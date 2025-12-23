import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

import { getSheetIdForLocation } from '@/lib/sheets';

async function getAuthClient() {
  const options: any = {
    scopes: SCOPES,
  };
  
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_CREDENTIALS;

  if (credentialsJson) {
    try {
      options.credentials = JSON.parse(credentialsJson);
    } catch (err) {
      console.error('Error parsing credentials:', err);
    }
  }

  const auth = new google.auth.GoogleAuth(options);
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
      const { rowIndex, jumlah, merk, kondisi, keterangan } = update;

      if (rowIndex === undefined || rowIndex === null) continue;

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
    }

    if (batchData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Add current date (or provided date) to cell H3
    const currentDate = (tanggalUpdate || new Date().toISOString().split('T')[0]).toString();
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
