import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const LOCATION_SHEET_MAP: Record<string, string> = {
  'bantul': '1D8l34AInFL-lqWpuTreaties4-xS15jNaL9nymCTQ9YqV8',
};

const COLUMN_MAP: Record<string, string> = {
  lokasi: 'B',
  garduInduk: 'C',
  brand: 'D',
  type: 'E',
  ipSn: 'F',
  username: 'G',
  password: 'H',
  keterangan: 'K',
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, column, updates } = body;

    if (!locationId || !column || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    const columnLetter = COLUMN_MAP[column];
    if (!columnLetter) {
      return NextResponse.json(
        { success: false, error: 'Invalid column' },
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

    // Build batch update
    const batchUpdates = updates.map((update: { no: string; value: string }) => {
      const rowNumber = parseInt(update.no) + 2; // Adjust for header row
      return {
        range: `CCTV!${columnLetter}${rowNumber}`,
        values: [[update.value]],
      };
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
    console.error('Error updating DVR data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}
