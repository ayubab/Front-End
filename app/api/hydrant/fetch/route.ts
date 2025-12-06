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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { success: false, message: 'Location ID is required' },
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

    // Fetch data from the Hydrant sheet
    // Row 7 onwards contains the actual data (rows 1-6 are headers/titles)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A7:W100`, // Fetch from row 7 to row 100
    });

    const rows = response.data.values || [];

    // Parse the data into structured format
    const hydrantData = {
      boxHydrant: [] as Array<{ no: string; nomorBox: string; lokasi: string; kondisi: string; rowIndex: number }>,
      pilarHydrant: [] as Array<{ no: string; nomorPilar: string; lokasi: string; kondisi: string; rowIndex: number }>,
      nozzleSprinkle: [] as Array<{ no: string; nomorPilar: string; lokasi: string; kondisi: string; rowIndex: number }>,
    };

    rows.forEach((row, index) => {
      const actualRowIndex = index + 7; // Add 7 because data starts at row 7

      // Box Hydrant: columns L, M, N, O (indices 11, 12, 13, 14)
      if (row[11] || row[12]) {
        hydrantData.boxHydrant.push({
          no: row[11] || '',
          nomorBox: row[12] || '',
          lokasi: row[13] || '',
          kondisi: row[14] || '',
          rowIndex: actualRowIndex,
        });
      }

      // Pilar Hydrant: columns P, Q, R, S (indices 15, 16, 17, 18)
      if (row[15] || row[16]) {
        hydrantData.pilarHydrant.push({
          no: row[15] || '',
          nomorPilar: row[16] || '',
          lokasi: row[17] || '',
          kondisi: row[18] || '',
          rowIndex: actualRowIndex,
        });
      }

      // Nozzle Sprinkle: columns T, U, V, W (indices 19, 20, 21, 22)
      if (row[19] || row[20]) {
        hydrantData.nozzleSprinkle.push({
          no: row[19] || '',
          nomorPilar: row[20] || '',
          lokasi: row[21] || '',
          kondisi: row[22] || '',
          rowIndex: actualRowIndex,
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: hydrantData,
    });

  } catch (error) {
    console.error('Error fetching Hydrant data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Hydrant data' },
      { status: 500 }
    );
  }
}
