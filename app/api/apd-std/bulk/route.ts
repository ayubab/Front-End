import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

import { getSheetIdForLocation } from '@/lib/sheets';

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
    const { locationId, updates, tanggalUpdate } = await request.json();

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
      const { rowIndex, baik, rusak, merk, tahun, keterangan } = update;

      if (rowIndex === undefined || rowIndex === null) continue;

      // Update BAIK (column F)
      if (baik !== undefined) {
        batchData.push({
          range: `APD STD!F${rowIndex}`,
          values: [[baik]],
        });
      }

      // Update RUSAK/KADALUARSA (column G)
      if (rusak !== undefined) {
        batchData.push({
          range: `APD STD!G${rowIndex}`,
          values: [[rusak]],
        });
      }

      // Update MERK/TYPE (column H)
      if (merk !== undefined) {
        batchData.push({
          range: `APD STD!H${rowIndex}`,
          values: [[merk]],
        });
      }

      // Update TAHUN PEROLEHAN (column I)
      if (tahun !== undefined) {
        batchData.push({
          range: `APD STD!I${rowIndex}`,
          values: [[tahun]],
        });
      }

      // Update KETERANGAN (column J)
      if (keterangan !== undefined) {
        batchData.push({
          range: `APD STD!J${rowIndex}`,
          values: [[keterangan]],
        });
      }
    }

    if (batchData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Add current date (or provided date) to cell K5
    const currentDate = (tanggalUpdate || new Date().toISOString().split('T')[0]).toString();
    batchData.push({
      range: 'APD STD!K5',
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
