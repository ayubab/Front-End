'use client';

import { useState, useRef } from 'react';

interface PhotoUploadProps {
  locationId: string;
  category: string;
  itemId: string;
  rowIndex?: number;
  currentPhotoUrl?: string;
  onUploadSuccess?: (photoData: PhotoData) => void;
  onUploadError?: (error: string) => void;
  compact?: boolean;
}

interface PhotoData {
  fileId: string;
  fileName: string;
  thumbnailUrl: string;
  fullUrl: string;
}

export default function PhotoUpload({
  locationId,
  category,
  itemId,
  rowIndex,
  currentPhotoUrl,
  onUploadSuccess,
  onUploadError,
  compact = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Hanya file JPEG, PNG, WebP, atau GIF yang diperbolehkan');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.('Ukuran file maksimal 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('locationId', locationId);
      formData.append('category', category);
      formData.append('itemId', itemId);
      if (rowIndex) {
        formData.append('rowIndex', rowIndex.toString());
      }

      // Simulate progress (actual XMLHttpRequest would give real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setPhotoUrl(result.data.thumbnailUrl);
        setPreview(null);
        onUploadSuccess?.(result.data);
      } else {
        throw new Error(result.message || 'Upload gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload gagal');
      setPreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleViewFullImage = () => {
    if (photoUrl) {
      // Extract file ID from thumbnail URL and open full view
      const match = photoUrl.match(/id=([^&]+)/);
      if (match) {
        window.open(`https://drive.google.com/file/d/${match[1]}/view`, '_blank');
      }
    }
    setShowFullImage(true);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : photoUrl ? (
          <button
            onClick={handleViewFullImage}
            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-cyan-300 hover:border-cyan-500 transition-colors"
          >
            <img
              src={photoUrl}
              alt="Foto kondisi"
              className="w-full h-full object-cover"
              onError={() => setPhotoUrl(null)}
            />
          </button>
        ) : (
          <button
            onClick={handleCameraCapture}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors border-2 border-dashed border-gray-300 hover:border-cyan-400"
            title="Tambah foto"
          >
            <span className="text-lg">📷</span>
          </button>
        )}

        {photoUrl && (
          <button
            onClick={handleCameraCapture}
            className="text-xs text-cyan-600 hover:text-cyan-800 underline"
            title="Ganti foto"
          >
            Ganti
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Display / Upload Area */}
      <div className="relative w-full">
        {uploading ? (
          <div className="w-full h-32 bg-cyan-50 rounded-xl flex flex-col items-center justify-center border-2 border-cyan-200">
            <div className="animate-spin w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full mb-2" />
            <p className="text-sm text-cyan-600">Mengupload... {uploadProgress}%</p>
            <div className="w-24 h-1 bg-cyan-200 rounded-full mt-2">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : preview ? (
          <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-cyan-300">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : photoUrl ? (
          <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-cyan-200 group">
            <img
              src={photoUrl}
              alt="Foto kondisi"
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleViewFullImage}
              onError={() => setPhotoUrl(null)}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={handleViewFullImage}
                className="px-3 py-1 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100"
              >
                👁️ Lihat
              </button>
              <button
                onClick={handleCameraCapture}
                className="px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-lg hover:bg-cyan-600"
              >
                📷 Ganti
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleCameraCapture}
            className="w-full h-32 bg-gray-50 hover:bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-cyan-400 transition-all"
          >
            <span className="text-3xl mb-2">📷</span>
            <p className="text-sm text-gray-500 font-medium">Tambah Foto Kondisi</p>
            <p className="text-xs text-gray-400 mt-1">Tap untuk ambil foto</p>
          </button>
        )}
      </div>

      {/* Full Image Modal */}
      {showFullImage && photoUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={photoUrl.replace('sz=w400', 'sz=w1200')}
              alt="Foto kondisi (full)"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-xl font-bold text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
