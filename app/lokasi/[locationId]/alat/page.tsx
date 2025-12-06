'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById, categories, locations } from '@/lib/data';

export default function PilihAlatPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);
  const [viewMode, setViewMode] = useState<'input' | 'rekap'>('input');
  const [userOffice, setUserOffice] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const office = localStorage.getItem('userOffice');
    const mode = localStorage.getItem('viewMode') as 'input' | 'rekap';
    
    setUserOffice(office);
    setViewMode(mode || 'input');
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Check if user has access to this location
    if (office && office !== 'ultg-yogyakarta' && office !== locationId) {
      // User is not ULTG admin and trying to access a different location
      router.push(`/lokasi/${office}/alat`);
    }
  }, [router, locationId]);

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Lokasi tidak ditemukan</div>
      </div>
    );
  }

  const handleBack = () => {
    // Only ULTG users can go back to location selection
    if (userOffice === 'ultg-yogyakarta') {
      router.push('/pilih-lokasi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userOffice');
    localStorage.removeItem('viewMode');
    router.push('/login');
  };

  const handleCategorySelect = (categoryId: string) => {
    // Special routing for Denah
    if (categoryId === 'denah') {
      router.push(`/lokasi/${locationId}/denah`);
    } else if (categoryId === 'apd') {
      router.push(`/lokasi/${locationId}/alat/apd`);
    } else if (categoryId === 'apd-std') {
      router.push(`/lokasi/${locationId}/alat/apd-std`);
    } else if (categoryId === 'alat-kerja') {
      router.push(`/lokasi/${locationId}/alat/alat-kerja`);
    } else if (categoryId === 'limbah-k3') {
      router.push(`/lokasi/${locationId}/alat/limbah-k3`);
    } else if (categoryId === 'cctv') {
      router.push(`/lokasi/${locationId}/alat/cctv`);
    } else {
      router.push(`/lokasi/${locationId}/alat/${categoryId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {userOffice === 'ultg-yogyakarta' && (
              <button
                onClick={handleBack}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-xl">←</span>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold">{location.name}</h1>
              <p className="text-sm text-cyan-100">
                {viewMode === 'input' ? 'Pilih Kategori APD' : 'Rekap Data K3 APD'}
              </p>
            </div>
          </div>
          
          {userOffice === 'ultg-yogyakarta' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/rekap-excel')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-semibold transition-colors"
                title="Lihat Semua Excel Sheets"
              >
                📄 Excel Rekap
              </button>
              <button
                onClick={() => {
                  setViewMode('input');
                  localStorage.setItem('viewMode', 'input');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  viewMode === 'input' 
                    ? 'bg-cyan-500 hover:bg-cyan-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                ✏️ Input
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {viewMode === 'input' ? (
          /* Input View - Category Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                    {category.name}
                  </h3>
                  <div className="mt-4 text-cyan-500 font-semibold text-sm group-hover:translate-y-1 transition-transform">
                    Lihat Items →
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Rekap View - Data Table */
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Rekapitulasi Data APD</h2>
              <p className="text-sm text-gray-600 mt-1">Data dari semua lokasi kantor dan GI</p>
            </div>

            {/* Filter Controls */}
            <div className="mb-6 flex gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter Lokasi
                </label>
                <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">Semua Lokasi</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter Kategori
                </label>
                <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Tanggal</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Lokasi</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Kategori</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Kondisi</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Keterangan</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Placeholder rows - in real app, this would be populated from database/Google Sheets */}
                  <tr>
                    <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      Data akan ditampilkan setelah integrasi dengan Google Sheets selesai
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">2025-11-28</td>
                    <td className="border border-gray-300 px-4 py-2">{location.name}</td>
                    <td className="border border-gray-300 px-4 py-2">APAR</td>
                    <td className="border border-gray-300 px-4 py-2">APAR CO2</td>
                    <td className="border border-gray-300 px-4 py-2">NORMAL</td>
                    <td className="border border-gray-300 px-4 py-2">Inspeksi rutin</td>
                    <td className="border border-gray-300 px-4 py-2">Admin</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Export Button */}
            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
                📊 Export ke Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
