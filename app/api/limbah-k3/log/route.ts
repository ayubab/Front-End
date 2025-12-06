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

export async function POST(request: NextRequest) {
  try {
    const { locationId, tanggal, jenisLimbah, masuk, keluar, keterangan } = await request.json();

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'locationId is required' },
        { status: 400 }
      );
    }

    if (!tanggal || !jenisLimbah) {
      return NextResponse.json(
        { success: false, error: 'tanggal and jenisLimbah are required' },
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

    // Find the next empty row in the log section (starting from E5)
    const existingLogsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Limbah K3!E5:E100',
    });

    const existingLogs = existingLogsResponse.data.values || [];
    let nextRow = 5; // Start at row 5
    
    // Find first empty row
    for (let i = 0; i < existingLogs.length; i++) {
      if (!existingLogs[i] || !existingLogs[i][0]) {
        nextRow = 5 + i;
        break;
      }
      if (i === existingLogs.length - 1) {
        nextRow = 5 + existingLogs.length;
      }
    }

    // Append new log entry
    const newLogData = [
      [tanggal, jenisLimbah, masuk || '', keluar || '', keterangan || '']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Limbah K3!E${nextRow}:I${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: newLogData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Log entry added successfully',
      rowIndex: nextRow,
    });
  } catch (error) {
    console.error('Error adding log entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add log entry' },
      { status: 500 }
    );
  }
}
