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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch(`/api/submit/${categoryId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Data berhasil disimpan!');
        setSelectedItem(null);
      } else {
        alert('Gagal menyimpan data. Coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan. Coba lagi.');
    }
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
      {categoryId === 'apar' ? (
        /* APAR Form */
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Input Rekap K3 - APAR</h2>
              <p className="text-sm text-gray-600 mt-1">Masukkan data APAR untuk {location.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden category field */}
              <input type="hidden" name="category" value={categoryId} />

              {/* KANTOR/GARDU INDUK */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KANTOR/GARDU INDUK <span className="text-red-500">*</span>
                </label>
                <select
                  name="kantorGarduInduk"
                  required
                  defaultValue={locationId}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  TANGGAL INSPERSI <span className="text-red-500">*</span>
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

              {/* KONDI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KONDI <span className="text-red-500">*</span>
                </label>
                <select
                  name="kondi"
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
      ) : categoryId === 'apat' ? (
        /* APAT Form */
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Input Rekap K3 - APAT</h2>
              <p className="text-sm text-gray-600 mt-1">Masukkan data APAT untuk {location.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden category field */}
              <input type="hidden" name="category" value={categoryId} />

              {/* GARDU INDUK */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GARDU INDUK <span className="text-red-500">*</span>
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

              {/* BAK / DRUM PASIR (buah) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  BAK / DRUM PASIR (buah) <span className="text-red-500">*</span>
                </label>
                <input
                  name="bakDrumPasir"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah bak/drum pasir"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* BAK / DRUM AIR (buah) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  BAK / DRUM AIR (buah) <span className="text-red-500">*</span>
                </label>
                <input
                  name="bakDrumAir"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah bak/drum air"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* SEKOP (buah) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SEKOP (buah) <span className="text-red-500">*</span>
                </label>
                <input
                  name="sekop"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah sekop"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* EMBER (buah) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  EMBER (buah) <span className="text-red-500">*</span>
                </label>
                <input
                  name="ember"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah ember"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* KARUNG GONI (buah) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KARUNG GONI (buah) <span className="text-red-500">*</span>
                </label>
                <input
                  name="karungGoni"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah karung goni"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* KETERANGAN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KETERANGAN
                </label>
                <textarea
                  name="keterangan"
                  rows={3}
                  placeholder="Masukkan keterangan tambahan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                ></textarea>
              </div>

              {/* TANGGAL INSPEKSI */}
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg"
                >
                  Simpan Data APAT
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : categoryId === 'fire-alarm' ? (
        /* FIRE ALARM Form */
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Input Rekap K3 - FIRE ALARM</h2>
              <p className="text-sm text-gray-600 mt-1">Masukkan data FIRE ALARM untuk {location.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden category field */}
              <input type="hidden" name="category" value={categoryId} />

              {/* GARDU INDUK */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GARDU INDUK <span className="text-red-500">*</span>
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

              {/* JENIS PERALATAN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JENIS PERALATAN <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenisPeralatan"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                >
                  <option value="">Pilih jenis peralatan</option>
                  <option value="detektor-asap">DETEKTOR ASAP</option>
                  <option value="detektor-panas">DETEKTOR PANAS</option>
                  <option value="panel-kontrol">PANEL KONTROL</option>
                  <option value="bell-sounder">BELL/SOUNDER</option>
                </select>
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
                  placeholder="Masukkan lokasi pemasangan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* HEAT (JUML TITIK) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  HEAT (JUML TITIK) <span className="text-red-500">*</span>
                </label>
                <input
                  name="heatTitik"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah titik detektor panas"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* SMOKE (JUML TITIK) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SMOKE (JUML TITIK) <span className="text-red-500">*</span>
                </label>
                <input
                  name="smokeTitik"
                  type="number"
                  required
                  min="0"
                  placeholder="Masukkan jumlah titik detektor asap"
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
                  <option value="baik">BAIK</option>
                  <option value="rusak">RUSAK</option>
                  <option value="perlu-perbaikan">PERLU PERBAIKAN</option>
                </select>
              </div>

              {/* MERK / TYPE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  MERK / TYPE <span className="text-red-500">*</span>
                </label>
                <input
                  name="merkType"
                  type="text"
                  required
                  placeholder="Masukkan merk dan tipe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* TANGGAL PENGECEKAN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TANGGAL PENGECEKAN <span className="text-red-500">*</span>
                </label>
                <input
                  name="tanggalPengecekan"
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* LINK LKS / BA ANOMALI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LINK LKS / BA ANOMALI
                </label>
                <input
                  name="linkLks"
                  type="url"
                  placeholder="Masukkan link LKS atau BA anomali (opsional)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* FOTO */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  FOTO <span className="text-red-500">*</span>
                </label>
                <input
                  name="photo"
                  type="file"
                  required
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
      ) : (
        /* Default Item List for Other Categories */
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
      )}

      {/* Modal Form for Other Categories */}
      {selectedItem && selectedItemData && categoryId !== 'apar' && categoryId !== 'apat' && categoryId !== 'fire-alarm' && (
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
              {/* Default Fields for Other Categories */}
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* KONDISI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  KONDISI <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-gray-900"
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
