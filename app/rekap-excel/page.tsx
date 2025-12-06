'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locations } from '@/lib/data';

export default function RekapExcelPage() {
  const router = useRouter();
  const [userOffice, setUserOffice] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sheetIds, setSheetIds] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const office = localStorage.getItem('userOffice');
    
    setUserOffice(office);
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Only ULTG admin can access this page
    if (office !== 'ultg-yogyakarta') {
      router.push('/pilih-lokasi');
      return;
    }

    // Fetch sheet IDs from API
    fetch('/api/sheet-ids')
      .then(res => res.json())
      .then(data => {
        setSheetIds(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load sheet IDs:', error);
        setLoading(false);
      });
  }, [router]);

  const handleBack = () => {
    router.push('/pilih-lokasi');
  };

  // Google Sheets embed URLs using fetched sheet IDs
  const getSheetEmbedUrl = (locationId: string) => {
    const sheetId = sheetIds[locationId];
    if (!sheetId) return '';
    
    return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal&widget=true&chrome=false`;
  };

  if (userOffice !== 'ultg-yogyakarta' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-xl font-bold">Rekap Data K3 - Semua Lokasi</h1>
              <p className="text-sm text-cyan-100">
                View Excel Sheets untuk Admin ULTG
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Location Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Pilih Lokasi</h2>
            <p className="text-sm text-gray-600">
              Pilih lokasi untuk melihat data Google Sheets
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedLocation('all')}
              className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                selectedLocation === 'all'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Semua Data
            </button>
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                  selectedLocation === location.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {location.type === 'kantor' ? '🏢' : '⚡'} {location.name.replace('KANTOR ', '').replace('GI ', '').replace('GIS ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Excel Embed Viewer */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {selectedLocation === 'all' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Semua Data Lokasi
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Pilih lokasi spesifik di atas untuk melihat Google Sheets
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border border-cyan-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white text-xl">
                        {location.type === 'kantor' ? '🏢' : '⚡'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">
                          {location.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLocation(location.id)}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Lihat Sheet →
                    </button>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span>ℹ️</span> Informasi
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pilih lokasi di atas untuk melihat Google Sheets masing-masing lokasi</li>
                  <li>• Data diambil langsung dari Google Sheets setiap lokasi</li>
                  <li>• Anda dapat melihat, mengedit, dan mengelola data dari semua lokasi</li>
                  <li>• Akses ini hanya tersedia untuk Admin ULTG Yogyakarta</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {locations.find(loc => loc.id === selectedLocation)?.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Google Sheets - View & Edit
                </p>
              </div>

              {getSheetEmbedUrl(selectedLocation) ? (
                <div className="relative w-full" style={{ height: '70vh', minHeight: '500px' }}>
                  <iframe
                    src={getSheetEmbedUrl(selectedLocation)}
                    className="w-full h-full rounded-lg border-2 border-gray-200"
                    style={{ border: 'none' }}
                    title={`Google Sheets - ${locations.find(loc => loc.id === selectedLocation)?.name}`}
                  />
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                  <div className="text-5xl mb-3">⚠️</div>
                  <h3 className="font-bold text-yellow-900 mb-2">
                    Sheet ID Belum Dikonfigurasi
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Google Sheet ID untuk lokasi ini belum diatur di environment variables.
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <a
                  href={getSheetEmbedUrl(selectedLocation).replace('/edit?usp=sharing&rm=minimal&widget=true&chrome=false', '/edit')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <span>📄</span> Buka di Google Sheets
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
