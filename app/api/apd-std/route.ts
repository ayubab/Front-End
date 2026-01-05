import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

const KANTOR_LOCATION_ID = 'ultg-yogyakarta';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'locationId is required' },
        { status: 400 }
      );
    }

    const SHEET_ID = getSheetIdForLocation(locationId);
    if (!SHEET_ID) {
      return NextResponse.json(
        { success: false, error: 'Sheet ID not found for location' },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const isKantor = locationId === KANTOR_LOCATION_ID;

    if (isKantor) {
      // KANTOR ULTG: Complex form with HAR GI, HAR JAR, HAR PRO
      return await fetchKantorData(sheets, SHEET_ID);
    } else {
      // Other GI locations: Simple form
      return await fetchGiData(sheets, SHEET_ID);
    }
  } catch (error) {
    console.error('Error fetching APD STD data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

async function fetchKantorData(sheets: any, sheetId: string) {
  // KANTOR ULTG column mapping:
  // A5:H5 = ITEM/PERALATAN, APD, SATUAN, GIS/GI/GITET, HAR GI, HAR Jaringan, HAR Proteksi, Kantor
  // I = empty
  // J5:N5 = HAR GI (BAIK, RUSAK, MERK, TAHUN, KET)
  // O = empty
  // P5:T5 = HAR JAR (BAIK, RUSAK, MERK, TAHUN, KET)
  // U = empty
  // V5:Z5 = HAR PRO (BAIK, RUSAK, MERK, TAHUN, KET)
  // Data starts from Row 7

  let dataResponse;
  try {
    dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'APD STD HAR!A5:Z70', // Up to row 70 covers all items (A7:A69)
    });
  } catch (sheetError: any) {
    console.error('Error fetching KANTOR sheet data:', sheetError?.message);
    if (sheetError?.message?.includes('Unable to parse range') || sheetError?.code === 400) {
      return NextResponse.json({
        success: false,
        error: `Sheet "APD STD HAR" tidak ditemukan di spreadsheet KANTOR. Pastikan sheet dengan nama "APD STD HAR" sudah ada.`,
      }, { status: 404 });
    }
    throw sheetError;
  }

  const values = dataResponse.data.values || [];
  const apdData: any[] = [];

  // Category row mappings based on user specification
  // A7:A11 = ALAT PELINDUNG KEPALA (Row 7 is category, 8-11 are items)
  // A12:A15 = ALAT PELINDUNG MATA DAN MUKA
  // etc.
  const categoryRows = new Set([7, 12, 16, 21, 23, 28, 33, 37, 43, 47, 51, 64]);

  // Data starts from index 2 (Row 7) in the range A5:Z70
  for (let i = 2; i < values.length; i++) {
    const row = values[i];
    if (!row) continue;

    const rowIndex = i + 5; // Convert to actual sheet row number

    // Column mapping (0-indexed):
    // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7
    // I=8 (empty)
    // J=9, K=10, L=11, M=12, N=13 (HAR GI)
    // O=14 (empty)
    // P=15, Q=16, R=17, S=18, T=19 (HAR JAR)
    // U=20 (empty)
    // V=21, W=22, X=23, Y=24, Z=25 (HAR PRO)

    const itemPeralatan = row[0]?.toString() || '';
    const apd = row[1]?.toString() || '';
    const satuan = row[2]?.toString() || '';
    const gisGiGitet = row[3]?.toString() || '';
    const harGi = row[4]?.toString() || '';
    const harJar = row[5]?.toString() || '';
    const harPro = row[6]?.toString() || '';
    const kantor = row[7]?.toString() || '';

    // Determine if this is a category row
    const isCategory = categoryRows.has(rowIndex) || (itemPeralatan && !apd);

    // Skip empty rows
    if (!itemPeralatan && !apd) continue;

    const dataGi = {
      baik: row[9]?.toString() || '',
      rusak: row[10]?.toString() || '',
      merk: row[11]?.toString() || '',
      tahun: row[12]?.toString() || '',
      keterangan: row[13]?.toString() || ''
    };

    const dataJar = {
      baik: row[15]?.toString() || '',
      rusak: row[16]?.toString() || '',
      merk: row[17]?.toString() || '',
      tahun: row[18]?.toString() || '',
      keterangan: row[19]?.toString() || ''
    };

    const dataPro = {
      baik: row[21]?.toString() || '',
      rusak: row[22]?.toString() || '',
      merk: row[23]?.toString() || '',
      tahun: row[24]?.toString() || '',
      keterangan: row[25]?.toString() || ''
    };

    apdData.push({
      rowIndex,
      itemPeralatan,
      apd,
      satuan,
      gisGiGitet,
      harGi,
      harJar,
      harPro,
      kantor,
      isCategory,
      gi: dataGi,
      jar: dataJar,
      pro: dataPro
    });
  }

  return NextResponse.json({
    success: true,
    data: apdData,
    isKantor: true,
    lastUpdateDate: '',
  });
}

async function fetchGiData(sheets: any, sheetId: string) {
  // GI locations: Simple form
  // Original mapping: A6:J120
  // A=ITEM, B=APD, C=SATUAN, D=?, E=?, F=BAIK, G=RUSAK, H=MERK, I=TAHUN, J=KET

  let dataResponse;
  try {
    dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'APD STD!A5:J120',
    });
  } catch (sheetError: any) {
    console.error('Error fetching GI sheet data:', sheetError?.message);
    if (sheetError?.message?.includes('Unable to parse range') || sheetError?.code === 400) {
      return NextResponse.json({
        success: false,
        error: `Sheet "APD STD" tidak ditemukan di spreadsheet untuk lokasi ini. Pastikan sheet dengan nama "APD STD" sudah ada.`,
      }, { status: 404 });
    }
    throw sheetError;
  }

  const values = dataResponse.data.values || [];
  const apdData: any[] = [];

  // Process from row 6 (index 1 in A5:J range)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row) continue;

    const rowIndex = i + 5;

    const itemPeralatan = row[0]?.toString() || '';
    const apd = row[1]?.toString() || '';
    const satuan = row[2]?.toString() || '';
    const baik = row[5]?.toString() || '';
    const rusak = row[6]?.toString() || '';
    const merk = row[7]?.toString() || '';
    const tahunPerolehan = row[8]?.toString() || '';
    const keterangan = row[9]?.toString() || '';

    // Set category based on whether this is a category header row
    // Category rows have content in column A but not in columns B, F, G
    const isCategory = (itemPeralatan && !apd && !baik && !rusak);

    // Skip completely empty rows (both A and B are empty)
    if (!itemPeralatan && !apd) continue;

    apdData.push({
      rowIndex,
      itemPeralatan,
      apd,
      satuan,
      baik,
      rusak,
      merk,
      tahunPerolehan,
      keterangan,
      isCategory,
    });
  }

  // Get last update date from K5
  const lastUpdateDate = values[0]?.[10] || '';

  return NextResponse.json({
    success: true,
    data: apdData,
    isKantor: false,
    lastUpdateDate,
  });
}
