import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

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

    // Fetch A5:Z120 to cover all new "HAR" columns
    let dataResponse;
    try {
      dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'APD STD!A5:Z120',
      });
    } catch (sheetError: any) {
      console.error('Error fetching sheet data:', sheetError?.message);
      if (sheetError?.message?.includes('Unable to parse range') || 
          sheetError?.code === 400) {
        return NextResponse.json({
          success: false,
          error: `Sheet "APD STD" tidak ditemukan di spreadsheet untuk lokasi ini. Pastikan sheet dengan nama "APD STD" sudah ada.`,
        }, { status: 404 });
      }
      throw sheetError;
    }

    const values = dataResponse.data.values || [];
    
    // In A5:Z120 range:
    // Index 0 = Row 5 (Headers)
    // Index 1 = Row 6
    // Index 2 = Row 7 (Start of Data as per prompt "A7:A11...")

    const apdData: any[] = [];
    
    // Start processing from Index 2 (Row 7)
    for (let i = 2; i < values.length; i++) {
        const row = values[i];
        // Only process if we have a row of data
        if (!row) continue;

        const rowIndex = i + 5; // Convert 0-based index relative to A5 to sheet physical row

        // Columns mapping (0-based index in 'values' array):
        // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8 (Empty)
        // J=9, K=10, L=11, M=12, N=13 (HAR GI)
        // O=14 (Empty)
        // P=15, Q=16, R=17, S=18, T=19 (HAR JAR)
        // U=20 (Empty)
        // V=21, W=22, X=23, Y=24, Z=25 (HAR PRO)

        const itemPeralatan = row[0]?.toString() || '';
        const apd = row[1]?.toString() || '';
        const satuan = row[2]?.toString() || '';
        const locationInfo = row[3]?.toString() || ''; // GIS/GI/GITET
        
        // Check for category: If Item Name exists but APD Name is empty
        const isCategory = itemPeralatan && !apd;

        // Skip completely empty rows
        if (!itemPeralatan && !apd && !satuan) continue;

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
            locationInfo,
            isCategory,
            gi: dataGi,
            jar: dataJar,
            pro: dataPro
        });
    }

    // Attempt to read Last Update Date from K5.
    // In range A5:Z120, Row 5 is index 0. Column K is index 10.
    const lastUpdateDate = values[0]?.[10] || '';

    return NextResponse.json({
      success: true,
      data: apdData,
      lastUpdateDate,
    });
  } catch (error) {
    console.error('Error fetching APD STD data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
