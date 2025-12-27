'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById, getCategoryById } from '@/lib/data';

export default function AparPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  
  const location = getLocationById(locationId);
  const category = getCategoryById('apar');

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch(`/api/submit/apar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Data berhasil disimpan!');
        (e.target as HTMLFormElement).reset();
      } else {
        alert('Gagal menyimpan data. Coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan. Coba lagi.');
    }
  };

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

      {/* APAR Form */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Input Rekap K3 - APAR</h2>
            <p className="text-sm text-gray-600 mt-1">Masukkan data APAR untuk {location.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden category field */}
            <input type="hidden" name="category" value="apar" />

            {/* KANTOR/GARDU INDUK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KANTOR/GARDU INDUK <span className="text-red-500">*</span>
              </label>
              <select
                name="kantorGarduInduk"
                required
                defaultValue={locationId}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              >
                <option value={locationId}>{location.name}</option>
              </select>
            </div>

            {/* NO. APAR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NO. APAR <span className="text-red-500">*</span>
              </label>
              <input
                name="noApar"
                type="text"
                required
                placeholder="Masukkan nomor APAR"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* LOKASI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LOKASI <span className="text-red-500">*</span>
              </label>
              <input
                name="lokasi"
                type="text"
                required
                placeholder="Masukkan lokasi APAR"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* MERK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MERK <span className="text-red-500">*</span>
              </label>
              <input
                name="merk"
                type="text"
                required
                placeholder="Masukkan merk APAR"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* KAPASITAS (KG) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KAPASITAS (KG) <span className="text-red-500">*</span>
              </label>
              <input
                name="kapasitas"
                type="number"
                required
                step="0.1"
                placeholder="Masukkan kapasitas dalam KG"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* JENIS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JENIS <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              >
                <option value="">Pilih jenis APAR</option>
                <option value="co2">CO2</option>
                <option value="powder">Powder</option>
                <option value="foam">Foam</option>
                <option value="water">Water</option>
              </select>
            </div>

            {/* TANGGAL INSPERSI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TANGGAL INSPEKSI <span className="text-red-500">*</span>
              </label>
              <input
                name="tanggalInspeksi"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* BAHAN PEMADAM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                BAHAN PEMADAM <span className="text-red-500">*</span>
              </label>
              <input
                name="bahanPemadam"
                type="text"
                required
                placeholder="Masukkan bahan pemadam"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* KELAS KEBAKARAN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KELAS KEBAKARAN <span className="text-red-500">*</span>
              </label>
              <input
                name="kelasKebakaran"
                type="text"
                required
                placeholder="Contoh: A, B, C, D"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* TANGGAL PENGISIAN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TANGGAL PENGISIAN <span className="text-red-500">*</span>
              </label>
              <input
                name="tanggalPengisian"
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* KADALUARSA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KADALUARSA <span className="text-red-500">*</span>
              </label>
              <input
                name="kadaluarsa"
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              />
            </div>

            {/* KONDISI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KONDISI <span className="text-red-500">*</span>
              </label>
              <select
                name="kondisi"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
              >
                <option value="">Pilih kondisi</option>
                <option value="normal">NORMAL</option>
                <option value="abnormal">ABNORMAL</option>
                <option value="kadaluwarsa">KADALUWARSA</option>
                <option value="tekanan-berkurang">TEKANAN BERKURANG</option>
              </select>
            </div>

            {/* KETERANGAN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KETERANGAN <span className="text-red-500">*</span>
              </label>
              <textarea
                name="keterangan"
                required
                rows={4}
                placeholder="Masukkan keterangan"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-gray-900"
              />
            </div>

            {/* AMBIL FOTO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                AMBIL FOTO
              </label>
              <input
                name="ambilFoto"
                type="file"
                accept="image/*"
                capture="environment"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
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
    </div>
  );
}
