'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById, categories } from '@/lib/data';

export default function PilihAlatPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Lokasi tidak ditemukan</div>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/pilih-lokasi');
  };

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/lokasi/${locationId}/alat/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className="text-xl font-bold">{location.name}</h1>
            <p className="text-sm text-cyan-100">Pilih Kategori APD</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
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
      </div>
    </div>
  );
}
