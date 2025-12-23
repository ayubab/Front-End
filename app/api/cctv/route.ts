import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { getSheetIdForLocation } from '@/lib/sheets';

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

    const spreadsheetId = getSheetIdForLocation(locationId);
    if (!spreadsheetId) {
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

    // Fetch last update date (K3)
    const [lastUpdateResponse, dvrResponse, cameraResponse, monitorResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'CCTV!K3',
      }),
      // DVR starts at row 7
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'CCTV!A7:K80',
      }),
      // Camera starts at row 15
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'CCTV!A15:K120',
      }),
      // Monitor starts at row 36
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'CCTV!A36:E60',
      }),
    ]);

    const lastUpdateDate = lastUpdateResponse.data.values?.[0]?.[0] || '';

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

    const cameraRows = cameraResponse.data.values || [];
    const cameraData = cameraRows
      .filter(row => row[0]) // Filter valid rows
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

    const monitorRows = monitorResponse.data.values || [];
    const monitorData = monitorRows
      .filter(row => row[0])
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
      lastUpdateDate,
    });
  } catch (error) {
    console.error('Error fetching CCTV data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
