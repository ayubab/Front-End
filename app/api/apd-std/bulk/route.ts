import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

const KANTOR_LOCATION_ID = 'ultg-yogyakarta';

export async function PUT(request: NextRequest) {
  try {
    const { locationId, updates, tanggalUpdate, type } = await request.json();

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

    const isKantor = locationId === KANTOR_LOCATION_ID;
    const batchData: any[] = [];

    if (isKantor) {
      // KANTOR: Use APD STD HAR sheet with HAR GI/JAR/PRO columns
      const sheetName = 'APD STD HAR';
      const updateType = type || 'gi';

      // Column mapping for KANTOR
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

        if (baik !== undefined) {
          batchData.push({ range: `${sheetName}!${columns.baik}${rowIndex}`, values: [[baik]] });
        }
        if (rusak !== undefined) {
          batchData.push({ range: `${sheetName}!${columns.rusak}${rowIndex}`, values: [[rusak]] });
        }
        if (merk !== undefined) {
          batchData.push({ range: `${sheetName}!${columns.merk}${rowIndex}`, values: [[merk]] });
        }
        if (tahun !== undefined) {
          batchData.push({ range: `${sheetName}!${columns.tahun}${rowIndex}`, values: [[tahun]] });
        }
        if (keterangan !== undefined) {
          batchData.push({ range: `${sheetName}!${columns.keterangan}${rowIndex}`, values: [[keterangan]] });
        }
      }
    } else {
      // GI locations: Use APD STD sheet with simpler column mapping
      const sheetName = 'APD STD';

      for (const update of updates) {
        const { rowIndex, baik, rusak, merk, tahunPerolehan, keterangan } = update;
        if (rowIndex === undefined || rowIndex === null) continue;

        // GI column mapping: F=BAIK, G=RUSAK, H=MERK, I=TAHUN, J=KET
        if (baik !== undefined) {
          batchData.push({ range: `${sheetName}!F${rowIndex}`, values: [[baik]] });
        }
        if (rusak !== undefined) {
          batchData.push({ range: `${sheetName}!G${rowIndex}`, values: [[rusak]] });
        }
        if (merk !== undefined) {
          batchData.push({ range: `${sheetName}!H${rowIndex}`, values: [[merk]] });
        }
        if (tahunPerolehan !== undefined) {
          batchData.push({ range: `${sheetName}!I${rowIndex}`, values: [[tahunPerolehan]] });
        }
        if (keterangan !== undefined) {
          batchData.push({ range: `${sheetName}!J${rowIndex}`, values: [[keterangan]] });
        }
      }

      // Update date in K5 for GI
      if (tanggalUpdate) {
        batchData.push({ range: `${sheetName}!K5`, values: [[tanggalUpdate]] });
      }
    }

    if (batchData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

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
