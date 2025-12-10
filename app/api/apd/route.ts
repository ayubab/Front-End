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

// Helper to parse choices from header text
function parseChoices(headerText: string): string[] | null {
  if (!headerText) return null;
  
  // Pattern 1: Text in parentheses with "/" separator
  const parenthesesMatch = headerText.match(/\(([^)]+)\)/);
  if (parenthesesMatch) {
    const choicesText = parenthesesMatch[1];
    if (choicesText.includes('/')) {
      return choicesText.split('/').map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  
  return null;
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

    // Fetch headers from row 4 (A4:H4) and last update date (H3)
    const [headersResponse, lastUpdateResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'APD!A4:H4',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'APD!H3',
      }),
    ]);

    const headers = headersResponse.data.values?.[0] || [];
    const lastUpdateDate = lastUpdateResponse.data.values?.[0]?.[0] || '';
    
    // Create field metadata from headers (focus on editable columns)
    const editableColumnMapping = [
      'jenisAPD',
      'jenisAPD',
      'jenisAPD',
      null,
      'jumlah',
      'merk',
      'kondisi',
      'keterangan',
    ];
    const fieldMetadata: { [key: string]: string[] | null } = {};
    headers.forEach((header, index) => {
      const columnName = editableColumnMapping[index];
      if (!columnName || columnName === 'jenisAPD') return;
      const choices = parseChoices(header);
      if (choices) {
        fieldMetadata[columnName] = choices;
      }
    });

    // Fetch all data starting from row 5 (A5:H200)
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'APD!A5:H200',
    });

    const rows = dataResponse.data.values || [];
    const apdData: any[] = [];

    const categoryRows = new Set([5, 10, 13, 17, 20, 27, 29, 31]);
    rows.forEach((row, index) => {
      const rowIndex = index + 5; // Actual row number in sheet
      const jenisAPD = (row[0] || row[1] || row[2] || '').toString();
      const jumlah = row[4]?.toString() || '';
      const merk = row[5]?.toString() || '';
      const kondisi = row[6]?.toString() || '';
      const keterangan = row[7]?.toString() || '';

      // Skip completely empty rows
      if (!jenisAPD && !jumlah && !merk && !kondisi && !keterangan) {
        return;
      }

      const isCategory = categoryRows.has(rowIndex) || (jenisAPD && !jumlah && !merk && !kondisi && !keterangan);

      apdData.push({
        rowIndex,
        jenisAPD,
        jumlah,
        merk,
        kondisi,
        keterangan,
        isCategory,
      });
    });

    return NextResponse.json({
      success: true,
      data: apdData,
      fieldMetadata,
      lastUpdateDate,
    });
  } catch (error) {
    console.error('Error fetching APD data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
