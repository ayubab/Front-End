'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';
import Image from 'next/image';

// Mapping of location IDs to their denah images
const denahMapping: { [key: string]: string[] } = {
  'ultg-yogyakarta': ['/denah_ultg_yogyakarta_1.jpg'],
  'gi-bantul': ['/denah_gi_bantul_1.jpg', '/denah_gi_bantul_2.jpg'],
  'gis-wirobrajan': ['/denah_gi_wirobrajan_1.jpg', '/denah_gi_wirobrajan_2.jpg'],
  'gi-kentungan': ['/denah_gi_kentungan_1.jpg', '/denah_gi_kentungan_2.jpg'],
  'gis-gejayan': ['/denah_gi_gejayan_1.jpg', '/denah_gi_gejayan_2.jpg', '/denah_gi_gejayan_3.jpg', '/denah_gi_gejayan_4.jpg'],
  'gi-klaten': ['/denah_gi_klaten_1.jpg', '/denah_gi_klaten_2.jpg'],
  'gi-kalasan': ['/denah_gi_kalasan_1.jpg'],
  'gi-semanu': ['/denah_gi_semanu_1.jpg', '/denah_gi_semanu_2.jpg'],
  'gi-godean': ['/denah_gi_godean_1.jpg'],
  'gi-medari': ['/denah_gi_medari_1.jpg'],
  'gi-wates': ['/denah_gi_wates_1.jpg'],
  'gi-purworejo': ['/denah_gi_purworejo_1.jpg', '/denah_gi_purworejo_2.jpg', '/denah_gi_purworejo_3.jpg', '/denah_gi_purworejo_4.jpg'],
};

export default function DenahPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(!!loggedIn);
    
    if (!loggedIn) {
      router.push('/login');
    }
  }, [router]);

  if (!location || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const denah = denahMapping[locationId] || [];
  const totalFloors = denah.length;

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  const getFloorLabel = (index: number) => {
    if (locationId === 'ultg-yogyakarta') return 'Kantor';
    return `Lantai ${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-xl font-bold">Denah {location.name}</h1>
              <p className="text-sm text-cyan-100">
                {totalFloors > 0 ? `${totalFloors} ${totalFloors > 1 ? 'Lantai' : 'Denah'}` : 'Tidak ada denah'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {totalFloors > 0 ? (
          <>
            {/* Floor Selector */}
            {totalFloors > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {denah.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFloor(index)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        selectedFloor === index
                          ? 'bg-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getFloorLabel(index)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Denah Display */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {getFloorLabel(selectedFloor)}
                </h2>
              </div>

              <div className="relative w-full" style={{ minHeight: '500px' }}>
                <Image
                  src={denah[selectedFloor]}
                  alt={`Denah ${getFloorLabel(selectedFloor)}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-lg"
                  priority
                />
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => setSelectedFloor(Math.max(0, selectedFloor - 1))}
                  disabled={selectedFloor === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedFloor === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  }`}
                >
                  ← Sebelumnya
                </button>
                
                <span className="text-gray-600 font-semibold">
                  {selectedFloor + 1} / {totalFloors}
                </span>

                <button
                  onClick={() => setSelectedFloor(Math.min(totalFloors - 1, selectedFloor + 1))}
                  disabled={selectedFloor === totalFloors - 1}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedFloor === totalFloors - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  }`}
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Denah Belum Tersedia
            </h3>
            <p className="text-gray-600">
              Denah untuk lokasi ini belum tersedia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
