import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

import { getSheetIdForLocation } from '@/lib/sheets';

async function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return auth.getClient();
}

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

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Fetch headers and last update date (K5)
    const [headersResponse, lastUpdateResponse, dataResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'APD STD!A5:J5',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'APD STD!K5',
      }),
      // Fetch all data starting from row 6 (A6:J120)
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'APD STD!A6:J120',
      }),
    ]);

    const headers = headersResponse.data.values?.[0] || [];
    const lastUpdateDate = lastUpdateResponse.data.values?.[0]?.[0] || '';

    const rows = dataResponse.data.values || [];
    const apdData: any[] = [];

    const categoryStartRows = new Set([6, 11, 15, 20, 22, 27, 32, 36, 42, 46, 50, 63]);
    rows.forEach((row, index) => {
      const rowIndex = index + 6; // Actual row number in sheet
      const itemPeralatan = row[0]?.toString() || '';
      const apd = row[1]?.toString() || '';
      const satuan = row[2]?.toString() || '';
      const baik = row[5]?.toString() || '';
      const rusak = row[6]?.toString() || '';
      const merk = row[7]?.toString() || '';
      const tahunPerolehan = row[8]?.toString() || '';
      const keterangan = row[9]?.toString() || '';

      // Category rows are predefined start rows or rows without APD detail
      const isCategory = categoryStartRows.has(rowIndex) || (itemPeralatan && !apd && !baik && !rusak && !merk && !tahunPerolehan && !keterangan);

      // Skip completely empty rows
      if (!itemPeralatan && !apd && !baik && !rusak && !merk && !tahunPerolehan && !keterangan) {
        return;
      }

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
    });

    return NextResponse.json({
      success: true,
      data: apdData,
      fieldMetadata: {},
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
