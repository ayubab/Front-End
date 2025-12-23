import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

const COLUMN_MAP: Record<string, string> = {
  merkTipe: 'B',
  penempatan: 'C',
  kondisi: 'D',
  keterangan: 'E',
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, column, updates, tanggalUpdate } = body;

    if (!locationId || !column || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const spreadsheetId = getSheetIdForLocation(locationId);
    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'Sheet ID not found for location' },
        { status: 400 }
      );
    }

    const columnLetter = COLUMN_MAP[column];
    if (!columnLetter) {
      return NextResponse.json(
        { success: false, error: 'Invalid column' },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Build batch update - monitor data starts at row 36
    const batchUpdates = updates.map((update: { no: string; value: string }) => {
      const rowNumber = parseInt(update.no) + 35; // Row 36 is first data row
      return {
        range: `CCTV!${columnLetter}${rowNumber}`,
        values: [[update.value]],
      };
    });

    // Stamp update date to K3
    const currentDate = (tanggalUpdate || new Date().toISOString().split('T')[0]).toString();
    batchUpdates.push({
      range: 'CCTV!K3',
      values: [[currentDate]],
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchUpdates,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating monitor data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}
