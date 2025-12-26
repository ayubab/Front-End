import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

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

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare batch update data
    const batchData: any[] = [];

    for (const update of updates) {
      const { rowIndex, boxKondisi, pilarKondisi, nozzleKondisi } = update;

      if (!rowIndex) continue;

      // Update Box Kondisi (column O)
      if (boxKondisi !== undefined) {
        batchData.push({
          range: `HYDRANT!O${rowIndex}`,
          values: [[boxKondisi]],
        });
      }

      // Update Pilar Kondisi (column T)
      if (pilarKondisi !== undefined) {
        batchData.push({
          range: `HYDRANT!T${rowIndex}`,
          values: [[pilarKondisi]],
        });
      }

      // Update Nozzle Kondisi (column Y)
      if (nozzleKondisi !== undefined) {
        batchData.push({
          range: `HYDRANT!Y${rowIndex}`,
          values: [[nozzleKondisi]],
        });
      }
    }

    if (batchData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

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
