import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Location-specific sheet IDs
const LOCATION_SHEET_MAP: { [key: string]: string } = {
  'k3-apd': process.env.SHEET_ID_K3_APD || '',
  'k3-apar': process.env.SHEET_ID_K3_APAR || '',
  'k3-p3k': process.env.SHEET_ID_K3_P3K || '',
};

const getSheetIdForLocation = (locationId: string): string => {
  return LOCATION_SHEET_MAP[locationId] || process.env.NEXT_PUBLIC_SHEET_ID || '';
};

async function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return auth.getClient();
}

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

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Fetch limbah summary data (A5:C10 - rows 5-9 for 5 types of limbah)
    const summaryResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Limbah K3!A5:C10',
    });

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

    // Fetch log data (E5:I100 - TGL, JENIS AWAL LIMBAH, MASUK, KELUAR, KETERANGAN)
    const logsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Limbah K3!E5:I100',
    });

    const logsRows = logsResponse.data.values || [];
    const limbahLogs: any[] = [];

    logsRows.forEach((row, index) => {
      const rowIndex = index + 5;
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
    });
  } catch (error) {
    console.error('Error fetching Limbah K3 data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
