'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById, getCategoryById, getItemsByCategoryId } from '@/lib/data';

export default function DaftarItemPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const categoryId = params.categoryId as string;
  
  const location = getLocationById(locationId);
  const category = getCategoryById(categoryId);
  const items = getItemsByCategoryId(categoryId);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  if (!location || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Data tidak ditemukan</div>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  const handleInputClick = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would normally save to backend
    alert('Data berhasil disimpan!');
    setSelectedItem(null);
  };

  const selectedItemData = items.find(item => item.id === selectedItem);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className="text-xl font-bold">{category.icon} {category.name}</h1>
            <p className="text-sm text-cyan-100">{location.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Status: Tersedia
                    </span>
                    <span>Kondisi: Baik</span>
                  </div>
                </div>
                <button
                  onClick={() => handleInputClick(item.id)}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Input
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {selectedItem && selectedItemData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-cyan-600 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Input Rekap K3</h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-cyan-100 mt-1">{selectedItemData.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* LOKASI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LOKASI <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  defaultValue={locationId}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={locationId}>{location.name}</option>
                </select>
              </div>

              {/* MERK */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  MERK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan merk"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* TIPE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TIPE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan tipe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* KAPASITAS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KAPASITAS <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan kapasitas"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* JENIS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JENIS <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan jenis"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* INSPEKSI TAHUN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  INSPEKSI TAHUN <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  defaultValue="2025"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>

              {/* Optional Fields for Fire Equipment */}
              {selectedItemData.requiresFireFields && (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-3">
                      Field Tambahan untuk Alat Pemadam Api
                    </p>
                    
                    {/* BAHAN PEMADAM */}
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        BAHAN PEMADAM
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Powder, CO2, Foam"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    {/* KELAS KEBAKARAN */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        KELAS KEBAKARAN
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: A, B, C, D"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* TANGGAL PENGISIAN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TANGGAL PENGISIAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* KADALUARSA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KADALUARSA <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* KONDISI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KONDISI <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Pilih kondisi</option>
                  <option value="baik">Baik</option>
                  <option value="cukup">Cukup</option>
                  <option value="rusak">Rusak</option>
                </select>
              </div>

              {/* KETERANGAN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KETERANGAN <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Masukkan keterangan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
