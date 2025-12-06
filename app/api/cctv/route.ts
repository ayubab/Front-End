import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const LOCATION_SHEET_MAP: Record<string, string> = {
  'bantul': '1D8l34AInFL-lqWpuTreaties4-xS15jNaL9nymCTQ9YqV8',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required' },
        { status: 400 }
      );
    }

    const spreadsheetId = LOCATION_SHEET_MAP[locationId.toLowerCase()];
    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'Invalid location' },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch DVR data (row 3 onwards, columns A-K)
    const dvrResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'CCTV!A3:K100',
    });

    const dvrRows = dvrResponse.data.values || [];
    const dvrData = dvrRows
      .filter(row => row[0]) // Filter rows with "No" value
      .map(row => ({
        no: row[0] || '',
        lokasi: row[1] || '',
        garduInduk: row[2] || '',
        brand: row[3] || '',
        type: row[4] || '',
        ipSn: row[5] || '',
        username: row[6] || '',
        password: row[7] || '',
        keterangan: row[10] || '',
      }));

    // Fetch Camera data (starts from a specific row, columns A-K)
    const cameraResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'CCTV!A10:K100', // Adjust based on where camera data starts
    });

    const cameraRows = cameraResponse.data.values || [];
    const cameraData = cameraRows
      .filter(row => row[0] && row[0] !== 'NO') // Filter valid rows
      .map(row => ({
        no: row[0] || '',
        idKamera: row[1] || '',
        lokasiKamera: row[2] || '',
        brand: row[3] || '',
        type: row[4] || '',
        ip: row[5] || '',
        username: row[6] || '',
        password: row[7] || '',
        statusNormal: row[8] || '',
        statusAnomali: row[9] || '',
        keterangan: row[10] || '',
      }));

    // Fetch Monitor data
    const monitorResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'CCTV!A32:E100', // Adjust based on where monitor data starts
    });

    const monitorRows = monitorResponse.data.values || [];
    const monitorData = monitorRows
      .filter(row => row[0] && row[0] !== 'NO')
      .map(row => ({
        no: row[0] || '',
        merkTipe: row[1] || '',
        penempatan: row[2] || '',
        kondisi: row[3] || '',
        keterangan: row[4] || '',
      }));

    return NextResponse.json({
      success: true,
      dvrData,
      cameraData,
      monitorData,
    });
  } catch (error) {
    console.error('Error fetching CCTV data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
