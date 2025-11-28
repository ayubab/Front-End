import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form data
    const data = {
      kantorGarduInduk: formData.get('kantorGarduInduk'),
      noApar: formData.get('noApar'),
      lokasi: formData.get('lokasi'),
      merk: formData.get('merk'),
      kapasitas: formData.get('kapasitas'),
      jenis: formData.get('jenis'),
      tanggalInspeksi: formData.get('tanggalInspeksi'),
      bahanPemadam: formData.get('bahanPemadam'),
      kelasKebakaran: formData.get('kelasKebakaran'),
      tanggalPengisian: formData.get('tanggalPengisian'),
      kadaluarsa: formData.get('kadaluarsa'),
      kondi: formData.get('kondi'),
      keterangan: formData.get('keterangan'),
      ambilFoto: formData.get('ambilFoto'), // This will be a File object
    };

    // Log the data (you can remove this later)
    console.log('Received APAR data:', data);

    // Google Sheets API setup
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!credentials || !spreadsheetId) {
      console.error('Missing Google credentials or sheet ID');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the row data
    const rowData = [
      data.kantorGarduInduk,
      data.noApar,
      data.lokasi,
      data.merk,
      data.kapasitas,
      data.jenis,
      data.tanggalInspeksi,
      data.bahanPemadam,
      data.kelasKebakaran,
      data.tanggalPengisian,
      data.kadaluarsa,
      data.kondi,
      data.keterangan,
      data.ambilFoto ? 'Foto tersedia' : 'Tidak ada foto', // For now, just indicate if photo exists
    ];

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:N', // Adjust range as needed
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ success: true, message: 'Data berhasil disimpan ke Google Sheets' });

  } catch (error) {
    console.error('Error processing APAR form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process form data' },
      { status: 500 }
    );
  }
}