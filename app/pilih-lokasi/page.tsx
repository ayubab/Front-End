'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locations } from '@/lib/data';

export default function PilihLokasiPage() {
  const router = useRouter();
  const [userOffice, setUserOffice] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const office = localStorage.getItem('userOffice');
    
    setUserOffice(office);
    
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const handleLocationSelect = (locationId: string) => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <h1 className="text-xl font-bold">PILIH LOKASI GI/KANTOR</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold">
            Selamat datang! Silakan pilih lokasi Kantor/Gardu Induk:
          </h2>
        </div>

        <div className="space-y-3">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location.id)}
              className="w-full bg-white hover:bg-gray-50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">
                    {location.type === 'kantor' ? '🏢' : '⚡'}
                  </span>
                </div>
                <span className="font-semibold text-gray-800 text-left">
                  {location.name}
                </span>
              </div>
              <span className="text-2xl text-cyan-500 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
