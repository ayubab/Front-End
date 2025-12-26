import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

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

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch headers and last update date (J3)
    const [headersResponse, lastUpdateResponse, dataResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Alat Kerja!A4:J4',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Alat Kerja!J3',
      }),
      // Fetch all data starting from row 6 (A6:J50)
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Alat Kerja!A6:J50',
      }),
    ]);

    const headers = headersResponse.data.values?.[0] || [];
    const lastUpdateDate = lastUpdateResponse.data.values?.[0]?.[0] || '';
    
    // Create field metadata from editable headers only
    const editableColumns = [
      null, // A no
      null, // B nama
      null, // C satuan
      null, // D jumlah minimum
      null, // E empty
      'jumlah', // F
      'merk',   // G
      'tahunPerolehan', // H
      'kondisi', // I
      'keterangan', // J
    ];
    const fieldMetadata: { [key: string]: string[] | null } = {};
    headers.forEach((header, index) => {
      const columnName = editableColumns[index];
      if (!columnName) return;
      const choices = parseChoices(header);
      if (choices) {
        fieldMetadata[columnName] = choices;
      }
    });

    const rows = dataResponse.data.values || [];
    const alatData: any[] = [];

    const categoryRows = new Set([5]); // row 5 contains "A Peralatan uji" header
    rows.forEach((row, index) => {
      const rowIndex = index + 6; // Actual row number in sheet
      const no = row[0]?.toString() || '';
      const namaPeralatan = row[1]?.toString() || '';
      const satuan = row[2]?.toString() || '';
      const jumlahMinimum = row[3]?.toString() || '';
      const jumlah = row[5]?.toString() || '';
      const merk = row[6]?.toString() || '';
      const tahunPerolehan = row[7]?.toString() || '';
      const kondisi = row[8]?.toString() || '';
      const keterangan = row[9]?.toString() || '';

      // Skip empty rows
      if (!no && !namaPeralatan && !jumlah && !merk && !kondisi && !keterangan) {
        return;
      }

      const isCategory =
        categoryRows.has(rowIndex) ||
        (no && /^[A-Z]$/.test(no.trim()) && namaPeralatan && !jumlah && !merk && !kondisi && !keterangan);

      alatData.push({
        rowIndex,
        no,
        namaPeralatan,
        satuan,
        jumlahMinimum,
        jumlah,
        merk,
        tahunPerolehan,
        kondisi,
        keterangan,
        isCategory,
      });
    });

    return NextResponse.json({
      success: true,
      data: alatData,
      fieldMetadata,
      lastUpdateDate,
    });
  } catch (error) {
    console.error('Error fetching Alat Kerja data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
