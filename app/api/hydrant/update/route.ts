import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Helper function to get sheet ID based on location
function getSheetIdForLocation(locationId: string): string {
  const sheetIdMap: { [key: string]: string } = {
    'ultg-yogyakarta': process.env.GOOGLE_SHEET_ID_ULTG_YOGYAKARTA || '',
    'gi-bantul': process.env.GOOGLE_SHEET_ID_GI_BANTUL || '',
    'gis-wirobrajan': process.env.GOOGLE_SHEET_ID_GIS_WIROBRAJAN || '',
    'gi-kentungan': process.env.GOOGLE_SHEET_ID_GI_KENTUNGAN || '',
    'gi-klaten': process.env.GOOGLE_SHEET_ID_GI_KLATEN || '',
    'gi-kalasan': process.env.GOOGLE_SHEET_ID_GI_KALASAN || '',
    'gi-semanu': process.env.GOOGLE_SHEET_ID_GI_SEMANU || '',
    'gi-godean': process.env.GOOGLE_SHEET_ID_GI_GODEAN || '',
    'gi-medari': process.env.GOOGLE_SHEET_ID_GI_MEDARI || '',
    'gi-wates': process.env.GOOGLE_SHEET_ID_GI_WATES || '',
    'gi-purworejo': process.env.GOOGLE_SHEET_ID_GI_PURWOREJO || '',
  };

  return sheetIdMap[locationId] || process.env.GOOGLE_SHEET_ID || '';
}

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
      columnLetter = 'S'; // Pilar Hydrant Kondisi column
    } else if (type === 'nozzle') {
      columnLetter = 'W'; // Nozzle Sprinkle Kondisi column
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
