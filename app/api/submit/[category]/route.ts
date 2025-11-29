import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Helper function to get sheet ID based on location
function getSheetIdForLocation(locationId: string): string {
  const sheetIdMap: { [key: string]: string } = {
    'ultg-yogyakarta': process.env.GOOGLE_SHEET_ID_ULTG_YOGYAKARTA || '',
    'gi-bantul': process.env.GOOGLE_SHEET_ID_GI_BANTUL || '',
    'gis-wirobrajan': process.env.GOOGLE_SHEET_ID_GIS_WIROBRAJAN || '',
    'gi-kentungan': process.env.GOOGLE_SHEET_ID_GI_KENTUNGAN || '',
    'gi-klaten': process.env.GOOGLE_SHEET_ID_GI_KLATEN || '',
    'gi-kalasan': process.env.GOOGLE_SHEET_ID_GI_KALASAN || '',
    'gi-semanu': process.env.GOOGLE_SHEET_ID_GI_SEMANU || '',
    'gi-godean': process.env.GOOGLE_SHEET_ID_GI_GODEAN || '',
    'gi-medari': process.env.GOOGLE_SHEET_ID_GI_MEDARI || '',
    'gi-wates': process.env.GOOGLE_SHEET_ID_GI_WATES || '',
    'gi-purworejo': process.env.GOOGLE_SHEET_ID_GI_PURWOREJO || '',
  };

  return sheetIdMap[locationId] || process.env.GOOGLE_SHEET_ID || '';
}

// Helper function to upload file to Google Drive
async function uploadToDrive(file: File, auth: any): Promise<string | null> {
  try {
    const drive = google.drive({ version: 'v3', auth });

    // Convert File to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileMetadata: any = {
      name: file.name,
    };

    // Only add parents if folder ID is specified
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (folderId && folderId.trim()) {
      fileMetadata.parents = [folderId.trim()];
    }

    const media = {
      mimeType: file.type,
      body: buffer,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.id!;
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    return null;
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category: urlCategory } = await params;
    const formData = await request.formData();

    // Get category from form data (more reliable than URL)
    const category = formData.get('category') as string || urlCategory;

    // Extract common form data
    const data = {
      kantorGarduInduk: formData.get('kantorGarduInduk'),
      lokasi: formData.get('lokasi'),
      tanggalInspeksi: formData.get('tanggalInspeksi'),
      kondi: formData.get('kondi'),
      keterangan: formData.get('keterangan'),
      ambilFoto: formData.get('ambilFoto'),
      // Category-specific fields will be added below
    };

    // Add category-specific fields based on the category
    switch (category) {
      case 'apar':
        Object.assign(data, {
          noApar: formData.get('noApar'),
          merk: formData.get('merk'),
          kapasitas: formData.get('kapasitas'),
          tipe: formData.get('jenis'), // APAR type (CO2, Powder, etc.) from form
          jenis: 'APAR', // Category name for JENIS column
          bahanPemadam: formData.get('bahanPemadam'),
          kelasKebakaran: formData.get('kelasKebakaran'),
          tanggalPengisian: formData.get('tanggalPengisian'),
          kadaluarsa: formData.get('kadaluarsa'),
        });
        break;

      case 'apat':
        Object.assign(data, {
          bakDrumPasir: formData.get('bakDrumPasir'),
          bakDrumAir: formData.get('bakDrumAir'),
          sekop: formData.get('sekop'),
          ember: formData.get('ember'),
          karungGoni: formData.get('karungGoni'),
          jenis: 'APAT', // Category name
        });
        break;

      case 'fire-alarm':
        Object.assign(data, {
          jenisPeralatan: formData.get('jenisPeralatan'),
          heatTitik: formData.get('heatTitik'),
          smokeTitik: formData.get('smokeTitik'),
          kondisi: formData.get('kondisi'),
          merkType: formData.get('merkType'),
          kondisi2: formData.get('kondisi2'), // Second kondisi field
          tanggalPengecekan: formData.get('tanggalPengecekan'),
          linkLks: formData.get('linkLks'),
          jenis: 'FIRE ALARM', // Category name
        });
        break;

      case 'hydrant':
        Object.assign(data, {
          jenisHydrant: formData.get('jenisHydrant'),
          nomorHydrant: formData.get('nomorHydrant'),
          merk: formData.get('merk'),
          tanggalUji: formData.get('tanggalUji'),
          tekanan: formData.get('tekanan'),
          jenis: 'HYDRANT', // Category name
        });
        break;

      case 'apd':
        Object.assign(data, {
          jenisAPD: formData.get('jenisAPD'),
          ukuran: formData.get('ukuran'),
          merk: formData.get('merk'),
          tanggalKadaluarsa: formData.get('tanggalKadaluarsa'),
          jumlah: formData.get('jumlah'),
          jenis: 'APD', // Category name
        });
        break;

      case 'apd-std-har':
        Object.assign(data, {
          jenisPeralatan: formData.get('jenisPeralatan'),
          nomorSeri: formData.get('nomorSeri'),
          merk: formData.get('merk'),
          tanggalKalibrasi: formData.get('tanggalKalibrasi'),
          tegangan: formData.get('tegangan'),
          jenis: 'APD STD HAR', // Category name
        });
        break;

      case 'alat-kerja':
        Object.assign(data, {
          jenisAlat: formData.get('jenisAlat'),
          nomorSeri: formData.get('nomorSeri'),
          merk: formData.get('merk'),
          tanggalKalibrasi: formData.get('tanggalKalibrasi'),
          kapasitas: formData.get('kapasitas'),
          jenis: 'ALAT KERJA', // Category name
        });
        break;

      case 'cctv':
        Object.assign(data, {
          jenisKamera: formData.get('jenisKamera'),
          lokasiPemasangan: formData.get('lokasiPemasangan'),
          merk: formData.get('merk'),
          resolusi: formData.get('resolusi'),
          statusRekaman: formData.get('statusRekaman'),
          jenis: 'CCTV', // Category name
        });
        break;

      case 'limbah-b3':
        Object.assign(data, {
          jenisLimbah: formData.get('jenisLimbah'),
          jumlah: formData.get('jumlah'),
          satuan: formData.get('satuan'),
          tanggalPenimbunan: formData.get('tanggalPenimbunan'),
          statusPenyimpanan: formData.get('statusPenyimpanan'),
          jenis: 'LIMBAH B3', // Category name
        });
        break;

      case 'denah':
        Object.assign(data, {
          jenisDenah: formData.get('jenisDenah'),
          skala: formData.get('skala'),
          tanggalUpdate: formData.get('tanggalUpdate'),
          statusKelengkapan: formData.get('statusKelengkapan'),
          jenis: 'DENAH', // Category name
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Kategori tidak dikenali' },
          { status: 400 }
        );
    }

    console.log(`Received ${category.toUpperCase()} data:`, data);

    // Google Sheets API setup
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const locationId = data.kantorGarduInduk as string;
    const spreadsheetId = getSheetIdForLocation(locationId);

    if (!credentials || !spreadsheetId) {
      console.error('Missing Google credentials or sheet ID for location:', locationId);
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Handle photo upload if present
    let photoFormula = '';
    if (data.ambilFoto instanceof File) {
      console.log('Uploading photo to Google Drive...', {
        fileName: data.ambilFoto.name,
        fileSize: data.ambilFoto.size,
        fileType: data.ambilFoto.type
      });
      const fileId = await uploadToDrive(data.ambilFoto, auth);
      if (fileId) {
        // Create IMAGE formula for Google Sheets using direct download link
        photoFormula = `=IMAGE("https://drive.google.com/uc?export=view&id=${fileId}", 1)`;
        console.log('Photo uploaded successfully, formula:', photoFormula);
      } else {
        photoFormula = 'Upload gagal';
        console.error('Failed to upload photo');
      }
    } else {
      photoFormula = data.ambilFoto || '';
      console.log('No photo file found, using text:', photoFormula);
    }

    // Create row data in the exact order matching sheet columns (including ID column)
    let rowData: any[] = [];

    // Generate a simple auto-incrementing ID (you can modify this logic)
    const id = Date.now().toString(); // Or use a counter, or let Google Sheets handle it

    switch (category) {
      case 'apar':
        rowData = [
          id,                    // A: ID
          (data as any).kantorGarduInduk, // B: KANTOR/GARDU INDUK
          (data as any).noApar,           // C: NO. APAR
          (data as any).lokasi,           // D: LOKASI
          (data as any).merk,             // E: MERK
          (data as any).tipe,             // F: TIPE
          (data as any).kapasitas,        // G: KAPASITAS (KG)
          (data as any).jenis,            // H: JENIS
          (data as any).tanggalInspeksi,  // I: TANGGAL INSPEKSI
          (data as any).bahanPemadam,     // J: BAHAN PEMADAM
          (data as any).kelasKebakaran,   // K: KELAS KEBAKARAN
          (data as any).tanggalPengisian, // L: TANGGAL PENGISIAN
          (data as any).kadaluarsa,       // M: KADALUARSA
          (data as any).kondi,            // N: KONDISI
          (data as any).keterangan,       // O: KETERANGAN
          photoFormula                    // P: Foto
        ];
        break;

      case 'apat':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).bakDrumPasir,
          (data as any).bakDrumAir,
          (data as any).sekop,
          (data as any).ember,
          (data as any).karungGoni,
          (data as any).keterangan,
          (data as any).tanggalInspeksi
        ];
        break;

      case 'fire-alarm':
        rowData = [
          id,
          (data as any).jenisPeralatan,
          (data as any).lokasi,
          (data as any).heatTitik,
          (data as any).smokeTitik,
          (data as any).kondisi,
          (data as any).merkType,
          (data as any).kondisi2, // Second kondisi field
          (data as any).tanggalPengecekan,
          (data as any).linkLks
        ];
        break;

      case 'hydrant':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisHydrant,
          (data as any).nomorHydrant,
          (data as any).merk,
          (data as any).jenis,            // JENIS (category name)
          (data as any).tanggalUji,
          (data as any).tekanan,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      case 'apd':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisAPD,
          (data as any).ukuran,
          (data as any).merk,
          (data as any).jenis,            // JENIS (category name)
          (data as any).tanggalKadaluarsa,
          (data as any).jumlah,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      case 'apd-std-har':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisPeralatan,
          (data as any).nomorSeri,
          (data as any).merk,
          (data as any).jenis,            // JENIS (category name)
          (data as any).tanggalKalibrasi,
          (data as any).tegangan,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      case 'alat-kerja':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisAlat,
          (data as any).nomorSeri,
          (data as any).merk,
          (data as any).jenis,            // JENIS (category name)
          (data as any).tanggalKalibrasi,
          (data as any).kapasitas,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      case 'cctv':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisKamera,
          (data as any).lokasiPemasangan,
          (data as any).merk,
          (data as any).jenis,            // JENIS (category name)
          (data as any).resolusi,
          (data as any).statusRekaman,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      case 'limbah-b3':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisLimbah,
          (data as any).jumlah,
          (data as any).satuan,
          (data as any).jenis,            // JENIS (category name)
          (data as any).tanggalPenimbunan,
          (data as any).statusPenyimpanan,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      case 'denah':
        rowData = [
          id,
          (data as any).kantorGarduInduk,
          (data as any).jenisDenah,
          (data as any).skala,
          (data as any).jenis,            // JENIS (category name)
          (data as any).tanggalUpdate,
          (data as any).statusKelengkapan,
          (data as any).lokasi,
          (data as any).tanggalInspeksi,
          (data as any).kondi,
          (data as any).keterangan,
          photoFormula
        ];
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Kategori tidak dikenali' },
          { status: 400 }
        );
    }

    // Determine sheet name based on category
    const sheetName = getSheetName(category);

    // Check if sheet exists, create it if not
    await ensureSheetExists(sheets, spreadsheetId, sheetName);

    // Append to Google Sheet (automatically adds to bottom row, starting from column A with ID)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:${String.fromCharCode(65 + rowData.length - 1)}`, // Start from column A, dynamic end column
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data ${category.toUpperCase()} berhasil disimpan ke Google Sheets`
    });

  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process form data' },
      { status: 500 }
    );
  }
}

// Helper function to map category to sheet name
function getSheetName(category: string): string {
  const sheetMapping: { [key: string]: string } = {
    'apar': 'APAR',
    'apat': 'APAT',
    'fire-alarm': 'FIRE ALARM',
    'hydrant': 'HYDRANT',
    'apd': 'APD',
    'apd-std-har': 'STD HAR',
    'alat-kerja': 'ALAT KERJA',
    'cctv': 'CCTV',
    'limbah-b3': 'LIMBAH B3',
    'denah': 'DENAH',
  };

  return sheetMapping[category] || category.toUpperCase();
}

// Function to ensure a sheet exists, create it if not
async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetName: string) {
  try {
    // Get spreadsheet metadata to check existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheets = spreadsheet.data.sheets.map((sheet: any) => sheet.properties.title);
    
    if (!existingSheets.includes(sheetName)) {
      // Create the sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          }],
        },
      });
      console.log(`Created new sheet: ${sheetName}`);

      // Add headers to the new sheet
      const headers = getSheetHeaders(sheetName);
      if (headers.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });
        console.log(`Added headers to sheet: ${sheetName}`);
      }
    }
  } catch (error) {
    console.error(`Error ensuring sheet exists: ${sheetName}`, error);
    throw error;
  }
}

// Function to get headers for each sheet type
function getSheetHeaders(sheetName: string): string[] {
  const headerMapping: { [key: string]: string[] } = {
    'APAR': [
      'ID', 'KANTOR/GARDU INDUK', 'NO. APAR', 'LOKASI', 'MERK', 'TIPE', 'KAPASITAS (KG)', 'JENIS', 
      'TANGGAL INSPEKSI', 'BAHAN PEMADAM', 'KELAS KEBAKARAN', 'TANGGAL PENGISIAN', 'KADALUARSA', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'APAT': [
      'ID', 'GARDU INDUK', 'BAK / DRUM PASIR (buah)', 'BAK / DRUM AIR (buah)', 'SEKOP (buah)', 'EMBER (buah)', 'KARUNG GONI (buah)', 'KETERANGAN', 'TANGGAL INSPEKSI'
    ],
    'FIRE ALARM': [
      'NO', 'JENIS PERALATAN', 'LOKASI', 'HEAT(JUML TITIK)', 'SMOKE(JUML TITIK)', 'KONDISI', 'MERK /TYPE', 'KONDISI', 'TANGGAL PENGECEKAN', 'LINK LKS / BA ANOMALI'
    ],
    'HYDRANT': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS HYDRANT', 'NOMOR HYDRANT', 'MERK', 'JENIS', 'TANGGAL UJI', 'TEKANAN', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'APD': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS APD', 'UKURAN', 'MERK', 'JENIS', 'TANGGAL KADALUARSA', 'JUMLAH', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'STD HAR': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS PERALATAN', 'NOMOR SERI', 'MERK', 'JENIS', 'TANGGAL KALIBRASI', 'TEGANGAN', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'ALAT KERJA': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS ALAT', 'NOMOR SERI', 'MERK', 'JENIS', 'TANGGAL KALIBRASI', 'KAPASITAS', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'CCTV': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS KAMERA', 'LOKASI PEMASANGAN', 'MERK', 'JENIS', 'RESOLUSI', 'STATUS REKAMAN', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'LIMBAH B3': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS LIMBAH', 'JUMLAH', 'SATUAN', 'JENIS', 'TANGGAL PENIMBUNAN', 'STATUS PENYIMPANAN', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
    'DENAH': [
      'ID', 'KANTOR/GARDU INDUK', 'JENIS DENAH', 'SKALA', 'JENIS', 'TANGGAL UPDATE', 'STATUS KELENGKAPAN', 
      'LOKASI', 'TANGGAL INSPEKSI', 'KONDISI', 'KETERANGAN', 'FOTO'
    ],
  };

  return headerMapping[sheetName] || [];
}