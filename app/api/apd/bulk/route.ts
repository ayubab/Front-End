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

export async function PUT(request: NextRequest) {
  try {
    const { locationId, updates } = await request.json();

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'locationId is required' },
        { status: 400 }
      );
    }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'updates array is required' },
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

    // Prepare batch update data
    const batchData: any[] = [];

    for (const update of updates) {
      const { rowIndex, jumlah, merk, kondisi, keterangan, tanggal } = update;

      if (!rowIndex) continue;

      // Update Jumlah (column E)
      if (jumlah !== undefined) {
        batchData.push({
          range: `APD!E${rowIndex}`,
          values: [[jumlah]],
        });
      }

      // Update Merk/Type (column F)
      if (merk !== undefined) {
        batchData.push({
          range: `APD!F${rowIndex}`,
          values: [[merk]],
        });
      }

      // Update Kondisi (column G)
      if (kondisi !== undefined) {
        batchData.push({
          range: `APD!G${rowIndex}`,
          values: [[kondisi]],
        });
      }

      // Update Keterangan (column H)
      if (keterangan !== undefined) {
        batchData.push({
          range: `APD!H${rowIndex}`,
          values: [[keterangan]],
        });
      }

      // Update Tanggal (column I)
      if (tanggal !== undefined) {
        batchData.push({
          range: `APD!I${rowIndex}`,
          values: [[tanggal]],
        });
      }
    }

    if (batchData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Add current date to cell H3
    const currentDate = new Date().toISOString().split('T')[0];
    batchData.push({
      range: 'APD!H3',
      values: [[currentDate]],
    });

    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bulk update successful',
      updatedCount: batchData.length,
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}
