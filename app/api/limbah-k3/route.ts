import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'locationId is required' },
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

    // Fetch date, summary, and logs based on new layout
    const [dateResponse, summaryResponse, logsResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Limbah K3!D3',
      }),
      // Summary rows A5:C9
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Limbah K3!A5:C9',
      }),
      // Log rows F6:J19
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Limbah K3!F6:J19',
      }),
    ]);

    const summaryRows = summaryResponse.data.values || [];
    const limbahData: any[] = [];

    summaryRows.forEach((row, index) => {
      const rowIndex = index + 5;
      const [no, jenisLimbah, jumlah] = row;

      limbahData.push({
        rowIndex,
        no: no || '',
        jenisLimbah: jenisLimbah || '',
        jumlah: jumlah || '',
      });
    });

    const logsRows = logsResponse.data.values || [];
    const limbahLogs: any[] = [];

    logsRows.forEach((row, index) => {
      const rowIndex = index + 6; // actual sheet row
      const [tanggal, jenisLimbah, masuk, keluar, keterangan] = row;

      // Only include rows with data
      if (tanggal || jenisLimbah) {
        limbahLogs.push({
          rowIndex,
          tanggal: tanggal || '',
          jenisLimbah: jenisLimbah || '',
          masuk: masuk || '',
          keluar: keluar || '',
          keterangan: keterangan || '',
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: limbahData,
      logs: limbahLogs,
      lastUpdateDate: dateResponse.data.values?.[0]?.[0] || '',
    });
  } catch (error) {
    console.error('Error fetching Limbah K3 data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
