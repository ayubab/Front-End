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
  
  // Pattern: Text in parentheses with "/" separator
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

    // Fetch headers from row 4 (A4:J4)
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Alat Kerja!A4:J4',
    });

    const headers = headersResponse.data.values?.[0] || [];
    
    // Create field metadata from headers
    const fieldMetadata: { [key: string]: string[] | null } = {};
    headers.forEach((header, index) => {
      const columnName = ['no', 'namaPeralatan', 'satuan', 'jumlahMinimum', 'gap', 'jumlah', 'merk', 'tahunPerolehan', 'kondisi', 'keterangan'][index];
      if (columnName && columnName !== 'gap') {
        const choices = parseChoices(header);
        if (choices) {
          fieldMetadata[columnName] = choices;
        }
      }
    });

    // Fetch all data starting from row 5 (A5:J150)
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Alat Kerja!A5:J150',
    });

    const rows = dataResponse.data.values || [];
    const alatData: any[] = [];

    rows.forEach((row, index) => {
      const rowIndex = index + 5; // Actual row number in sheet
      const [no, namaPeralatan, satuan, jumlahMinimum, gap, jumlah, merk, tahunPerolehan, kondisi, keterangan] = row;

      // Category rows: no is a letter (A, B, etc.) and has namaPeralatan
      const isCategory = no && /^[A-Z]$/.test(no.trim());

      apdData.push({
        rowIndex,
        no: no || '',
        namaPeralatan: namaPeralatan || '',
        satuan: satuan || '',
        jumlahMinimum: jumlahMinimum || '',
        jumlah: jumlah || '',
        merk: merk || '',
        tahunPerolehan: tahunPerolehan || '',
        kondisi: kondisi || '',
        keterangan: keterangan || '',
        isCategory,
      });
    });

    return NextResponse.json({
      success: true,
      data: alatData,
      fieldMetadata,
    });
  } catch (error) {
    console.error('Error fetching Alat Kerja data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
