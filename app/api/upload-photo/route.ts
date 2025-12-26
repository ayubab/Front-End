import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

import { getSheetIdForLocation } from '@/lib/sheets';

// Convert buffer to readable stream for Google Drive API
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// POST - Upload photo to Google Drive
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const locationId = formData.get('locationId') as string;
    const category = formData.get('category') as string;
    const itemId = formData.get('itemId') as string;
    const rowIndex = formData.get('rowIndex') as string;

    // Validate required fields
    if (!file || !locationId || !category || !itemId) {
      return NextResponse.json(
        { success: false, message: 'File, locationId, category, and itemId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!credentials || !folderId) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error: Missing Drive configuration' },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    // Create unique filename: locationId_category_itemId.ext
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueFilename = `${locationId}_${category}_${itemId}.${ext}`;

    // Search for existing file with same name pattern to replace
    const searchQuery = `name contains '${locationId}_${category}_${itemId}' and '${folderId}' in parents and trashed = false`;
    const existingFiles = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
    });

    // Delete existing files with same itemId (photo replacement strategy)
    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      for (const existingFile of existingFiles.data.files) {
        if (existingFile.id) {
          await drive.files.delete({ fileId: existingFile.id });
          console.log(`Deleted old photo: ${existingFile.name}`);
        }
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload new file to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: uniqueFilename,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: bufferToStream(buffer),
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = driveResponse.data.id;

    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'Failed to upload file to Drive' },
        { status: 500 }
      );
    }

    // Set file permissions to "anyone with link can view"
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Generate direct viewable URL
    const photoUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    const fullPhotoUrl = `https://drive.google.com/file/d/${fileId}/view`;

    // Update Google Sheet with photo URL if rowIndex is provided
    if (rowIndex) {
      const spreadsheetId = getSheetIdForLocation(locationId);
      
      if (spreadsheetId) {
        // Determine which column to update based on category
        const photoColumnMap: { [key: string]: string } = {
          'apd': 'G',        // Column G for APD photos
          'apd-std': 'G',    // Column G for APD STD photos
          'hydrant': 'P',    // Column P for Hydrant photos (after Kondisi columns)
          'cctv': 'H',       // Column H for CCTV photos
          'alat-kerja': 'G', // Column G for Alat Kerja photos
          'limbah-k3': 'G',  // Column G for Limbah K3 photos
        };

        const sheetNameMap: { [key: string]: string } = {
          'apd': 'APD',
          'apd-std': 'APD STD',
          'hydrant': 'HYDRANT',
          'cctv': 'CCTV',
          'alat-kerja': 'Alat Kerja',
          'limbah-k3': 'Limbah K3',
        };

        const column = photoColumnMap[category];
        const sheetName = sheetNameMap[category];

        if (column && sheetName) {
          try {
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${sheetName}!${column}${rowIndex}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [[fullPhotoUrl]]
              }
            });
          } catch (sheetError) {
            console.error('Error updating sheet with photo URL:', sheetError);
            // Don't fail the entire request if sheet update fails
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        fileId,
        fileName: uniqueFilename,
        thumbnailUrl: photoUrl,
        fullUrl: fullPhotoUrl,
        webViewLink: driveResponse.data.webViewLink,
      }
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload photo', error: String(error) },
      { status: 500 }
    );
  }
}

// GET - Fetch photo URL for specific item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const category = searchParams.get('category');
    const itemId = searchParams.get('itemId');

    if (!locationId || !category || !itemId) {
      return NextResponse.json(
        { success: false, message: 'locationId, category, and itemId are required' },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!credentials || !folderId) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Search for photo file
    const searchQuery = `name contains '${locationId}_${category}_${itemId}' and '${folderId}' in parents and trashed = false`;
    const files = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name, webViewLink, thumbnailLink)',
      orderBy: 'modifiedTime desc',
    });

    if (files.data.files && files.data.files.length > 0) {
      const file = files.data.files[0];
      return NextResponse.json({
        success: true,
        data: {
          fileId: file.id,
          fileName: file.name,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
          fullUrl: `https://drive.google.com/file/d/${file.id}/view`,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: 'No photo found'
    });

  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete photo from Google Drive
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const locationId = searchParams.get('locationId');
    const category = searchParams.get('category');
    const rowIndex = searchParams.get('rowIndex');

    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'fileId is required' },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    // Delete file from Drive
    await drive.files.delete({ fileId });

    // Clear photo URL from Google Sheet if location and row info provided
    if (locationId && category && rowIndex) {
      const spreadsheetId = getSheetIdForLocation(locationId);
      
      if (spreadsheetId) {
        const photoColumnMap: { [key: string]: string } = {
          'apd': 'G',
          'apd-std': 'G',
          'hydrant': 'P',
          'cctv': 'H',
          'alat-kerja': 'G',
          'limbah-k3': 'G',
        };

        const sheetNameMap: { [key: string]: string } = {
          'apd': 'APD',
          'apd-std': 'APD STD',
          'hydrant': 'HYDRANT',
          'cctv': 'CCTV',
          'alat-kerja': 'Alat Kerja',
          'limbah-k3': 'Limbah K3',
        };

        const column = photoColumnMap[category];
        const sheetName = sheetNameMap[category];

        if (column && sheetName) {
          try {
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${sheetName}!${column}${rowIndex}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [['']]
              }
            });
          } catch (sheetError) {
            console.error('Error clearing sheet photo URL:', sheetError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
