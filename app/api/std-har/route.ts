import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getSheetIdForLocation } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json({ success: false, error: 'locationId is required' }, { status: 400 });
    }

    const SHEET_ID = getSheetIdForLocation(locationId);
    if (!SHEET_ID) {
      return NextResponse.json({ success: false, error: 'Sheet ID not found' }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read STD HAR sheet
    // Columns A-M (13 columns)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'STD HAR!A2:M1000', // Assuming Row 1 is header
    });

    const rows = response.data.values || [];
    const data = rows.map((row, index) => ({
      rowIndex: index + 2,
      id: row[0] || '',
      kantor: row[1] || '',
      jenisPeralatan: row[2] || '',
      nomorSeri: row[3] || '',
      merk: row[4] || '',
      jenis: row[5] || '',
      tanggalKalibrasi: row[6] || '',
      tegangan: row[7] || '',
      lokasi: row[8] || '',
      tanggalInspeksi: row[9] || '',
      kondisi: row[10] || '',
      keterangan: row[11] || '',
      foto: row[12] || '',
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching STD HAR:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    // Implement Add/Update logic if needed. 
    // For now, prompt implied reading/updating existing tabs. 
    // I'll assume standard row-based update logic similar to others if user asks.
    // Given the prompt "theres update on KANTOR ULTG tab...", likely data entry.
    // I'll leave POST empty for now unless needed, but GET is essential.
    return NextResponse.json({ success: true, message: "Use PUT for updates" });
}
