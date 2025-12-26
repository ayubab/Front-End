import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, type, rowIndex, kondisi } = body;

    if (!locationId || !type || !rowIndex || !kondisi) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Google Sheets API setup
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const spreadsheetId = getSheetIdForLocation(locationId);

    if (!credentials || !spreadsheetId) {
      console.error('Missing Google credentials or sheet ID for location:', locationId);
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetName = 'HYDRANT';

    // Determine which column to update based on type
    let columnLetter = '';
    if (type === 'box') {
      columnLetter = 'O'; // Box Hydrant Kondisi column
    } else if (type === 'pilar') {
      columnLetter = 'T'; // Pilar Hydrant Kondisi column
    } else if (type === 'nozzle') {
      columnLetter = 'Y'; // Nozzle Sprinkle Kondisi column
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid type' },
        { status: 400 }
      );
    }

    // Update the specific cell
    const range = `${sheetName}!${columnLetter}${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[kondisi]],
      },
    });

    console.log(`Updated ${type} kondisi at row ${rowIndex} to: ${kondisi}`);

    return NextResponse.json({
      success: true,
      message: 'Kondisi berhasil diperbarui',
    });

  } catch (error) {
    console.error('Error updating Hydrant kondisi:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update kondisi' },
      { status: 500 }
    );
  }
}
