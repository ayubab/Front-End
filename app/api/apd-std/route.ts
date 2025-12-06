import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Location-specific sheet IDs
const LOCATION_SHEET_MAP: { [key: string]: string } = {
  'k3-apd': process.env.SHEET_ID_K3_APD || '',
  'k3-apar': process.env.SHEET_ID_K3_APAR || '',
  'k3-p3k': process.env.SHEET_ID_K3_P3K || '',
};

const getSheetIdForLocation = (locationId: string): string => {
  return LOCATION_SHEET_MAP[locationId] || process.env.NEXT_PUBLIC_SHEET_ID || '';
};

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

    // Fetch headers from row 5 (A5:J5)
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'APD STD!A5:J5',
    });

    const headers = headersResponse.data.values?.[0] || [];

    // Fetch all data starting from row 6 (A6:J150)
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'APD STD!A6:J150',
    });

    const rows = dataResponse.data.values || [];
    const apdData: any[] = [];

    rows.forEach((row, index) => {
      const rowIndex = index + 6; // Actual row number in sheet
      const [itemPeralatan, apd, satuan, gis, gap, baik, rusak, merk, tahunPerolehan, keterangan] = row;

      // Category rows have itemPeralatan but no apd
      const isCategory = itemPeralatan && !apd;

      apdData.push({
        rowIndex,
        itemPeralatan: itemPeralatan || '',
        apd: apd || '',
        satuan: satuan || '',
        gis: gis || '',
        baik: baik || '',
        rusak: rusak || '',
        merk: merk || '',
        tahunPerolehan: tahunPerolehan || '',
        keterangan: keterangan || '',
        isCategory,
      });
    });

    return NextResponse.json({
      success: true,
      data: apdData,
      fieldMetadata: {},
    });
  } catch (error) {
    console.error('Error fetching APD STD data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
