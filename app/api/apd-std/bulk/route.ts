import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

export async function PUT(request: NextRequest) {
  try {
    const { locationId, updates, tanggalUpdate, type } = await request.json(); // type: 'gi' | 'jar' | 'pro'

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
    
    // Default to 'gi' if not specified for backward compatibility, or error?
    // Let's assume 'gi' if missing, but preferably should be sent.
    const updateType = type || 'gi';

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

    // Column mapping based on type
    const columnMap: Record<string, { baik: string, rusak: string, merk: string, tahun: string, keterangan: string }> = {
      gi: { baik: 'J', rusak: 'K', merk: 'L', tahun: 'M', keterangan: 'N' },
      jar: { baik: 'P', rusak: 'Q', merk: 'R', tahun: 'S', keterangan: 'T' },
      pro: { baik: 'V', rusak: 'W', merk: 'X', tahun: 'Y', keterangan: 'Z' }
    };

    const columns = columnMap[updateType];
    if (!columns) {
        return NextResponse.json({ success: false, error: 'Invalid update type' }, { status: 400 });
    }

    for (const update of updates) {
      const { rowIndex, baik, rusak, merk, tahun, keterangan } = update;

      if (rowIndex === undefined || rowIndex === null) continue;

      // Update BAIK
      if (baik !== undefined) {
        batchData.push({
          range: `APD STD!${columns.baik}${rowIndex}`,
          values: [[baik]],
        });
      }

      // Update RUSAK/KADALUARSA
      if (rusak !== undefined) {
        batchData.push({
          range: `APD STD!${columns.rusak}${rowIndex}`,
          values: [[rusak]],
        });
      }

      // Update MERK/TYPE
      if (merk !== undefined) {
        batchData.push({
          range: `APD STD!${columns.merk}${rowIndex}`,
          values: [[merk]],
        });
      }

      // Update TAHUN PEROLEHAN
      if (tahun !== undefined) {
        batchData.push({
          range: `APD STD!${columns.tahun}${rowIndex}`,
          values: [[tahun]],
        });
      }

      // Update KETERANGAN
      if (keterangan !== undefined) {
        batchData.push({
          range: `APD STD!${columns.keterangan}${rowIndex}`,
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

    // Add current date (or provided date) to cell K5 (Global Update Date)
    // The prompt implied K4 or K5. Existing code used K5. User prompt "J5~:N5~= input, K4...?"
    // I'll stick to K5 as the single source of truth for "Last Update" date unless user sees it in wrong place.
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
