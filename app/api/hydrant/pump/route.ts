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

// PUT - Update pump information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, pumpInfo } = body;

    if (!locationId || !pumpInfo) {
      return NextResponse.json(
        { success: false, message: 'Location ID and pump info are required' },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const spreadsheetId = getSheetIdForLocation(locationId);

    if (!credentials || !spreadsheetId) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetName = 'HYDRANT';

    // First, fetch current pump data to preserve unchanged fields
    const currentResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!B9:J9`,
    });
    const currentData = currentResponse.data.values?.[0] || [];

    // Update pump data in row 9, columns B-J (preserve existing values if not provided)
    const pumpValues = [
      pumpInfo.columnB !== undefined ? pumpInfo.columnB : (currentData[0] || ''),
      pumpInfo.columnC !== undefined ? pumpInfo.columnC : (currentData[1] || ''),
      pumpInfo.columnD !== undefined ? pumpInfo.columnD : (currentData[2] || ''),
      pumpInfo.columnE !== undefined ? pumpInfo.columnE : (currentData[3] || ''),
      pumpInfo.columnF !== undefined ? pumpInfo.columnF : (currentData[4] || ''),
      pumpInfo.merkTipe !== undefined ? pumpInfo.merkTipe : (currentData[5] || ''),
      pumpInfo.kapasitasAirTank !== undefined ? pumpInfo.kapasitasAirTank : (currentData[6] || ''),
      pumpInfo.keterangan !== undefined ? pumpInfo.keterangan : (currentData[7] || ''),
      pumpInfo.linkLKS !== undefined ? pumpInfo.linkLKS : (currentData[8] || '')
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!B9:J9`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [pumpValues]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pump information updated successfully'
    });

  } catch (error) {
    console.error('Error updating pump information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update pump information' },
      { status: 500 }
    );
  }
}
