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

// GET - Fetch Hydrant data
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

    // Fetch pump headers from row 8 (B-J) to detect choice fields
    const pumpHeadersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!B8:J8`,
    });
    const pumpHeaders = pumpHeadersResponse.data.values?.[0] || [];

    // Fetch hydrant headers from row 8 to detect choice fields
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!L8:Y8`,
    });
    const headers = headersResponse.data.values?.[0] || [];

    // Helper function to parse choices from header
    const parseChoices = (header: string): string[] | null => {
      if (!header) return null;
      
      // First try pattern with parentheses: "Field (option1/option2/option3)"
      const matchParens = header.match(/\(([^)]+)\)/);
      if (matchParens) {
        const choicesText = matchParens[1];
        if (choicesText.includes('/')) {
          return choicesText.split('/').map(choice => choice.trim()).filter(c => c);
        }
      }
      
      // Also check if header itself contains multiple options separated by /
      // This catches headers like "Normal/Rusak/Kadang Rembes"
      if (header.includes('/')) {
        const choices = header.split('/').map(choice => choice.trim()).filter(c => c);
        // Only treat as choices if we have at least 2 options
        if (choices.length >= 2) {
          return choices;
        }
      }
      
      return null;
    };

    // Map all headers to detect which fields have choices
    const fieldMetadata: Record<string, string[] | null> = {};
    
    // Parse pump headers (B-J)
    const pumpColumnMapping = [
      { key: 'columnB', index: 0 },
      { key: 'columnC', index: 1 },
      { key: 'columnD', index: 2 },
      { key: 'columnE', index: 3 },
      { key: 'columnF', index: 4 },
      { key: 'merkTipe', index: 5 },
      { key: 'kapasitasAirTank', index: 6 },
      { key: 'keterangan', index: 7 },
      { key: 'linkLKS', index: 8 }
    ];

    pumpColumnMapping.forEach(({ key, index }) => {
      const choices = parseChoices(pumpHeaders[index]);
      if (choices) {
        fieldMetadata[key] = choices;
      }
    });

    // Parse hydrant headers (L-Y)
    const columnMapping = [
      { key: 'boxNo', index: 1 },           // Column M
      { key: 'boxLocation', index: 2 },     // Column N
      { key: 'boxKondisi', index: 3 },      // Column O
      { key: 'pilarNo', index: 5 },         // Column R
      { key: 'pilarLocation', index: 6 },   // Column S
      { key: 'pilarKondisi', index: 7 },    // Column T
      { key: 'nozzleNo', index: 9 },        // Column W
      { key: 'nozzleLocation', index: 10 }, // Column X
      { key: 'nozzleKondisi', index: 11 }   // Column Y
    ];

    columnMapping.forEach(({ key, index }) => {
      const choices = parseChoices(headers[index]);
      if (choices) {
        fieldMetadata[key] = choices;
      }
    });

    // Fetch pump data (row 9: columns B-J for all pump information)
    const pumpResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!B9:J9`,
    });
    const pumpData = pumpResponse.data.values?.[0] || [];

    // Fetch Box Hydrant data (columns L-O, starting from row 9)
    const boxResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!L9:O100`,
    });
    const boxRows = boxResponse.data.values || [];

    // Fetch Pilar Hydrant data (columns Q-T, starting from row 9)
    const pilarResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!Q9:T100`,
    });
    const pilarRows = pilarResponse.data.values || [];

    // Fetch Nozzle Sprinkle data (columns V-Y, starting from row 9)
    const nozzleResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!V9:Y100`,
    });
    const nozzleRows = nozzleResponse.data.values || [];

    // Parse pump data (B-J: 9 columns)
    const pumpInfo = {
      columnB: pumpData[0] || '',
      columnC: pumpData[1] || '',
      columnD: pumpData[2] || '',
      columnE: pumpData[3] || '',
      columnF: pumpData[4] || '',
      merkTipe: pumpData[5] || '',        // Column G
      kapasitasAirTank: pumpData[6] || '', // Column H
      keterangan: pumpData[7] || '',       // Column I
      linkLKS: pumpData[8] || ''           // Column J
    };

    // Parse Box Hydrant data (L-O)
    const boxHydrants = boxRows
      .filter(row => row[0]) // Filter rows with No value
      .map((row, index) => ({
        rowIndex: index + 9, // Row 9 is the first data row
        no: row[0] || '',
        nomorBox: row[1] || '',
        lokasi: row[2] || '',
        kondisi: row[3] || ''
      }));

    // Parse Pilar Hydrant data (Q-T)
    const pilarHydrants = pilarRows
      .filter(row => row[0]) // Filter rows with No value
      .map((row, index) => ({
        rowIndex: index + 9,
        no: row[0] || '',
        nomorPilar: row[1] || '',
        lokasi: row[2] || '',
        kondisi: row[3] || ''
      }));

    // Parse Nozzle Sprinkle data (V-Y)
    const nozzleSprinkles = nozzleRows
      .filter(row => row[0]) // Filter rows with No value
      .map((row, index) => ({
        rowIndex: index + 9,
        no: row[0] || '',
        nomorPilar: row[1] || '',
        lokasi: row[2] || '',
        kondisi: row[3] || ''
      }));

    // Combine all data into flat array format for compatibility
    const maxLength = Math.max(boxHydrants.length, pilarHydrants.length, nozzleSprinkles.length);
    const combinedData = [];
    
    for (let i = 0; i < maxLength; i++) {
      const boxItem = boxHydrants[i] || { no: '', nomorBox: '', lokasi: '', kondisi: '' };
      const pilarItem = pilarHydrants[i] || { no: '', nomorPilar: '', lokasi: '', kondisi: '' };
      const nozzleItem = nozzleSprinkles[i] || { no: '', nomorPilar: '', lokasi: '', kondisi: '' };
      
      combinedData.push({
        rowIndex: i + 9,
        no: boxItem.no || pilarItem.no || nozzleItem.no || (i + 1).toString(),
        boxNo: boxItem.nomorBox,
        boxLocation: boxItem.lokasi,
        boxKondisi: boxItem.kondisi,
        pilarNo: pilarItem.nomorPilar,
        pilarLocation: pilarItem.lokasi,
        pilarKondisi: pilarItem.kondisi,
        nozzleNo: nozzleItem.nomorPilar,
        nozzleLocation: nozzleItem.lokasi,
        nozzleKondisi: nozzleItem.kondisi,
        tanggalPengecekan: '',
        keterangan: '',
        linkLks: ''
      });
    }

    return NextResponse.json({
      success: true,
      data: combinedData,
      pumpInfo,
      fieldMetadata
    });

  } catch (error) {
    console.error('Error fetching Hydrant data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Hydrant data' },
      { status: 500 }
    );
  }
}

// POST - Update kondisi for specific items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, updates } = body;

    if (!locationId || !updates) {
      return NextResponse.json(
        { success: false, message: 'Location ID and updates are required' },
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

    // Process updates
    const batchUpdates = [];

    // Update Box Hydrant kondisi (column O)
    if (updates.boxHydrants) {
      for (const update of updates.boxHydrants) {
        batchUpdates.push({
          range: `${sheetName}!O${update.rowIndex}`,
          values: [[update.kondisi]]
        });
      }
    }

    // Update Pilar Hydrant kondisi (column S)
    if (updates.pilarHydrants) {
      for (const update of updates.pilarHydrants) {
        batchUpdates.push({
          range: `${sheetName}!S${update.rowIndex}`,
          values: [[update.kondisi]]
        });
      }
    }

    // Update Nozzle Sprinkle kondisi (column W)
    if (updates.nozzleSprinkles) {
      for (const update of updates.nozzleSprinkles) {
        batchUpdates.push({
          range: `${sheetName}!W${update.rowIndex}`,
          values: [[update.kondisi]]
        });
      }
    }

    // Update pump data if provided (row 5, columns B-F)
    if (updates.pumpInfo) {
      const pumpValues = [
        updates.pumpInfo.electricPump?.kapasitasDebit || '',
        updates.pumpInfo.electricPump?.tekananOperasi || '',
        updates.pumpInfo.jockeyPump?.tekananOperasi || '',
        updates.pumpInfo.dieselPump?.kapasitasDebit || '',
        updates.pumpInfo.dieselPump?.tekananOperasi || ''
      ];
      batchUpdates.push({
        range: `${sheetName}!B5:F5`,
        values: [pumpValues]
      });
    }

    // Execute batch update
    if (batchUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchUpdates
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Hydrant data updated successfully',
      updatedCount: batchUpdates.length
    });

  } catch (error) {
    console.error('Error updating Hydrant data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Hydrant data' },
      { status: 500 }
    );
  }
}

// PUT - Update a single hydrant row
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, rowIndex, boxKondisi, pilarKondisi, nozzleKondisi, tanggalPengecekan, keterangan, linkLks } = body;

    if (!locationId || !rowIndex) {
      return NextResponse.json(
        { success: false, message: 'Location ID and row index are required' },
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

    // Build batch updates for the specific row
    const batchUpdates = [];

    // Update Box Hydrant kondisi (column O)
    if (boxKondisi !== undefined) {
      batchUpdates.push({
        range: `${sheetName}!O${rowIndex}`,
        values: [[boxKondisi]]
      });
    }

    // Update Pilar Hydrant kondisi (column T)
    if (pilarKondisi !== undefined) {
      batchUpdates.push({
        range: `${sheetName}!T${rowIndex}`,
        values: [[pilarKondisi]]
      });
    }

    // Update Nozzle Sprinkle kondisi (column Y)
    if (nozzleKondisi !== undefined) {
      batchUpdates.push({
        range: `${sheetName}!Y${rowIndex}`,
        values: [[nozzleKondisi]]
      });
    }

    // Execute batch update
    if (batchUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchUpdates
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Hydrant row updated successfully'
    });

  } catch (error) {
    console.error('Error updating Hydrant row:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Hydrant row' },
      { status: 500 }
    );
  }
}
