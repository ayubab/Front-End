'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';
import PhotoUpload from '@/app/components/PhotoUpload';
import Image from 'next/image';

interface APDStdItem {
  rowIndex: number;
  itemPeralatan: string;
  apd: string;
  satuan: string;
  baik: string;
  rusak: string;
  merk: string;
  tahunPerolehan: string;
  keterangan: string;
  fotoKondisi?: string;
  isCategory: boolean;
}

interface ExampleItem {
  itemPeralatan: string;
  apd: string;
  satuan: string;
  gi: string;
}

interface FieldMetadata {
  [key: string]: string[] | null;
}

// Example data for reference (left table - gray)
const EXAMPLE_DATA: ExampleItem[] = [
  // ALAT PELINDUNG KEPALA
  { itemPeralatan: 'ALAT PELINDUNG KEPALA', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Helm Kerja Lapangan', satuan: 'Buah', gi: '10' },
  { itemPeralatan: '', apd: 'Helm Kerja Kantor (Topi)', satuan: 'Buah', gi: '5' },
  { itemPeralatan: '', apd: 'Helm Las', satuan: 'Buah', gi: '2' },
  { itemPeralatan: '', apd: 'Topi Pelindung', satuan: 'Buah', gi: '5' },
  // ALAT PELINDUNG MATA DAN MUKA
  { itemPeralatan: 'ALAT PELINDUNG MATA DAN MUKA', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Kacamata Las', satuan: 'Buah', gi: '2' },
  { itemPeralatan: '', apd: 'Kacamata Safety', satuan: 'Buah', gi: '10' },
  { itemPeralatan: '', apd: 'Face Shield', satuan: 'Buah', gi: '3' },
  // ALAT PELINDUNG TANGAN
  { itemPeralatan: 'ALAT PELINDUNG TANGAN', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Sarung Tangan Katun', satuan: 'Pasang', gi: '20' },
  { itemPeralatan: '', apd: 'Sarung Tangan Kulit', satuan: 'Pasang', gi: '10' },
  { itemPeralatan: '', apd: 'Sarung Tangan Listrik 20kV', satuan: 'Pasang', gi: '4' },
  { itemPeralatan: '', apd: 'Sarung Tangan Listrik 150kV', satuan: 'Pasang', gi: '4' },
  // ALAT PELINDUNG TELINGA
  { itemPeralatan: 'ALAT PELINDUNG TELINGA', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Ear Plug', satuan: 'Pasang', gi: '10' },
  { itemPeralatan: '', apd: 'Ear Muff', satuan: 'Buah', gi: '5' },
  // ALAT PELINDUNG KAKI
  { itemPeralatan: 'ALAT PELINDUNG KAKI', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Sepatu Safety', satuan: 'Pasang', gi: '10' },
  { itemPeralatan: '', apd: 'Sepatu Boot Karet', satuan: 'Pasang', gi: '5' },
  { itemPeralatan: '', apd: 'Sepatu Listrik', satuan: 'Pasang', gi: '4' },
  // PAKAIAN PELINDUNG
  { itemPeralatan: 'PAKAIAN PELINDUNG', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Baju Kerja Lapangan', satuan: 'Stel', gi: '10' },
  { itemPeralatan: '', apd: 'Jas Hujan', satuan: 'Buah', gi: '10' },
  { itemPeralatan: '', apd: 'Apron Las', satuan: 'Buah', gi: '2' },
  // ROMPI PENGAWAS
  { itemPeralatan: 'ROMPI PENGAWAS', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Rompi Safety', satuan: 'Buah', gi: '10' },
  { itemPeralatan: '', apd: 'Rompi Pengawas K3', satuan: 'Buah', gi: '3' },
  // ALAT PELINDUNG PERNAPASAN
  { itemPeralatan: 'ALAT PELINDUNG PERNAPASAN', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Masker Kain', satuan: 'Buah', gi: '20' },
  { itemPeralatan: '', apd: 'Masker Gas (Respirator)', satuan: 'Buah', gi: '5' },
  { itemPeralatan: '', apd: 'SCBA', satuan: 'Unit', gi: '1' },
  // ALAT PELINDUNG JATUH
  { itemPeralatan: 'ALAT PELINDUNG JATUH', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Full Body Harness', satuan: 'Buah', gi: '5' },
  { itemPeralatan: '', apd: 'Safety Belt', satuan: 'Buah', gi: '5' },
  { itemPeralatan: '', apd: 'Tali Pengaman (Lanyard)', satuan: 'Buah', gi: '5' },
  // PELAMPUNG
  { itemPeralatan: 'PELAMPUNG', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Pelampung (Life Jacket)', satuan: 'Buah', gi: '5' },
  { itemPeralatan: '', apd: 'Ring Buoy', satuan: 'Buah', gi: '2' },
];

export default function APDStdPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [apdData, setApdData] = useState<APDStdItem[]>([]);
  const [fieldMetadata, setFieldMetadata] = useState<FieldMetadata>({});
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingBaik, setEditingBaik] = useState(false);
  const [editingRusak, setEditingRusak] = useState(false);
  const [editingMerk, setEditingMerk] = useState(false);
  const [editingTahun, setEditingTahun] = useState(false);
  const [editingKeterangan, setEditingKeterangan] = useState(false);
  const [editedBaik, setEditedBaik] = useState<{[rowIndex: number]: string}>({});
  const [editedRusak, setEditedRusak] = useState<{[rowIndex: number]: string}>({});
  const [editedMerk, setEditedMerk] = useState<{[rowIndex: number]: string}>({});
  const [editedTahun, setEditedTahun] = useState<{[rowIndex: number]: string}>({});
  const [editedKeterangan, setEditedKeterangan] = useState<{[rowIndex: number]: string}>({});
  const [globalTanggal, setGlobalTanggal] = useState<string>('');
  const [showExampleTable, setShowExampleTable] = useState(true);
  const [showColorImages, setShowColorImages] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchAPDStdData();
      const today = new Date().toISOString().split('T')[0];
      setGlobalTanggal(today);
    }
  }, [router, locationId]);

  const fetchAPDStdData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apd-std?locationId=${locationId}`);
      const result = await response.json();
      
      if (result.success) {
        setApdData(result.data);
        if (result.fieldMetadata) {
          setFieldMetadata(result.fieldMetadata);
        }
        if (result.lastUpdateDate) {
          setLastUpdateDate(result.lastUpdateDate);
          setGlobalTanggal(result.lastUpdateDate);
        }
      } else {
        alert('Gagal memuat data APD STD');
      }
    } catch (error) {
      console.error('Error fetching APD STD data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  const createColumnEditHandlers = (
    column: 'baik' | 'rusak' | 'merk' | 'tahunPerolehan' | 'keterangan',
    setEditing: (val: boolean) => void,
    setEditedData: (data: {[key: number]: string}) => void
  ) => {
    return {
      edit: () => {
        setEditing(true);
        const initialData: {[rowIndex: number]: string} = {};
        apdData.forEach(item => {
          if (!item.isCategory) {
            initialData[item.rowIndex] = item[column];
          }
        });
        setEditedData(initialData);
      },
      cancel: () => {
        setEditing(false);
        setEditedData({});
      },
      save: async (editedData: {[key: number]: string}) => {
        setUpdating(true);
        try {
          const updates = Object.entries(editedData).map(([rowIndex, value]) => ({
            rowIndex: parseInt(rowIndex),
            [column]: value,
          }));

          const response = await fetch('/api/apd-std/bulk', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
          });

          const result = await response.json();
          if (result.success) {
            setEditing(false);
            setEditedData({});
            fetchAPDStdData();
            const columnNames = {
              gis: 'GIS/GI/GITET',
              baik: 'BAIK',
              rusak: 'RUSAK/KADALUARSA',
              merk: 'MERK/TYPE',
              tahunPerolehan: 'TAHUN PEROLEHAN',
              keterangan: 'KETERANGAN'
            };
            alert(`${columnNames[column]} berhasil diperbarui`);
          } else {
            alert(`Gagal memperbarui ${column}`);
          }
        } catch (error) {
          console.error(`Error updating ${column}:`, error);
          alert('Terjadi kesalahan saat memperbarui data');
        } finally {
          setUpdating(false);
        }
      }
    };
  };

  const baikHandlers = createColumnEditHandlers('baik', setEditingBaik, setEditedBaik);
  const rusakHandlers = createColumnEditHandlers('rusak', setEditingRusak, setEditedRusak);
  const merkHandlers = createColumnEditHandlers('merk', setEditingMerk, setEditedMerk);
  const tahunHandlers = createColumnEditHandlers('tahunPerolehan', setEditingTahun, setEditedTahun);
  const keteranganHandlers = createColumnEditHandlers('keterangan', setEditingKeterangan, setEditedKeterangan);

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Data tidak ditemukan</div>
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
              <h1 className="text-xl font-bold">🦺 APD STANDAR GI</h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColorImages(!showColorImages)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                showColorImages ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              🎨 {showColorImages ? 'Sembunyikan' : 'Tampilkan'} Warna
            </button>
            <button
              onClick={() => setShowExampleTable(!showExampleTable)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                showExampleTable ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              📋 {showExampleTable ? 'Sembunyikan' : 'Tampilkan'} Contoh
            </button>
            <button
              onClick={fetchAPDStdData}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? '⟳' : '🔄'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Color Images Section */}
        {showColorImages && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Helm Colors */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  ⛑️ WARNA HELM SAFETY
                </h3>
              </div>
              <div className="p-4">
                <Image
                  src="/helm.png"
                  alt="Referensi Warna Helm Safety"
                  width={400}
                  height={200}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>
            </div>
            
            {/* Rompi Colors */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-400 to-teal-500 px-4 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  🦺 WARNA ROMPI SAFETY
                </h3>
              </div>
              <div className="p-4">
                <Image
                  src="/rompi.png"
                  alt="Referensi Warna Rompi Safety"
                  width={400}
                  height={200}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Tanggal Update */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📅</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Update (ditulis ke sel K5)
              </label>
              <input
                type="date"
                value={globalTanggal}
                onChange={(e) => setGlobalTanggal(e.target.value)}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Nilai ini dikirim ke sel K5 setiap kali menyimpan perubahan.
              </p>
              {lastUpdateDate && (
                <p className="text-xs text-gray-600 mt-1">
                  Terakhir tercatat di sheet: {lastUpdateDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className={`grid gap-6 ${showExampleTable ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* Example Table (Left - Gray) */}
          {showExampleTable && (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  📋 CONTOH ISIAN (Referensi)
                </h3>
                <p className="text-gray-200 text-xs mt-1">Tabel contoh untuk membantu pengisian</p>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Item/Peralatan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">APD</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Satuan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">GI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {EXAMPLE_DATA.map((item, index) => {
                      const isCategory = item.itemPeralatan && !item.apd;
                      return isCategory ? (
                        <tr key={index} className="bg-gray-200">
                          <td colSpan={4} className="px-3 py-2 text-xs font-bold text-gray-800">
                            {item.itemPeralatan}
                          </td>
                        </tr>
                      ) : (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-500">{item.itemPeralatan}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{item.apd}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{item.satuan}</td>
                          <td className="px-3 py-2 text-xs text-gray-600 font-semibold">{item.gi}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Input Table (Right - Green header) */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                ✏️ DATA APD GI {location.name.toUpperCase()}
              </h3>
              <p className="text-green-100 text-xs mt-1">Tabel isian update kondisi APD</p>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <div className="text-cyan-600 text-xl mb-2">Memuat data...</div>
                <div className="text-gray-500">Mohon tunggu sebentar</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase sticky left-0 bg-green-50">Item/Peralatan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">APD</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">Satuan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">
                        <div className="flex items-center justify-between gap-2">
                          <span>BAIK (Jumlah)</span>
                          {editingBaik ? (
                            <div className="flex gap-1">
                              <button onClick={() => baikHandlers.save(editedBaik)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                              <button onClick={baikHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                            </div>
                          ) : (
                            <button onClick={baikHandlers.edit} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Edit</button>
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">
                        <div className="flex items-center justify-between gap-2">
                          <span>RUSAK/KADALUARSA</span>
                          {editingRusak ? (
                            <div className="flex gap-1">
                              <button onClick={() => rusakHandlers.save(editedRusak)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                              <button onClick={rusakHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                            </div>
                          ) : (
                            <button onClick={rusakHandlers.edit} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Edit</button>
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">
                        <div className="flex items-center justify-between gap-2">
                          <span>MERK/TYPE</span>
                          {editingMerk ? (
                            <div className="flex gap-1">
                              <button onClick={() => merkHandlers.save(editedMerk)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                              <button onClick={merkHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                            </div>
                          ) : (
                            <button onClick={merkHandlers.edit} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Edit</button>
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">
                        <div className="flex items-center justify-between gap-2">
                          <span>TAHUN PEROLEHAN</span>
                          {editingTahun ? (
                            <div className="flex gap-1">
                              <button onClick={() => tahunHandlers.save(editedTahun)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                              <button onClick={tahunHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                            </div>
                          ) : (
                            <button onClick={tahunHandlers.edit} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Edit</button>
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">
                        <div className="flex items-center justify-between gap-2">
                          <span>KET</span>
                          {editingKeterangan ? (
                            <div className="flex gap-1">
                              <button onClick={() => keteranganHandlers.save(editedKeterangan)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                              <button onClick={keteranganHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                            </div>
                          ) : (
                            <button onClick={keteranganHandlers.edit} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Edit</button>
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase">
                        📷 Foto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {apdData.map((item, index) => (
                      item.isCategory ? (
                        <tr key={index} className="bg-green-100">
                          <td colSpan={9} className="px-3 py-2 text-xs font-bold text-green-900">
                            {item.itemPeralatan}
                          </td>
                        </tr>
                      ) : (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-600 sticky left-0 bg-white">{item.itemPeralatan}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{item.apd}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{item.satuan}</td>
                          <td className="px-3 py-2">
                            {editingBaik ? (
                              <input type="text" value={editedBaik[item.rowIndex] ?? item.baik} onChange={(e) => setEditedBaik({ ...editedBaik, [item.rowIndex]: e.target.value })} className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" />
                            ) : (
                              <span className="text-xs font-semibold text-green-700">{item.baik || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingRusak ? (
                              <input type="text" value={editedRusak[item.rowIndex] ?? item.rusak} onChange={(e) => setEditedRusak({ ...editedRusak, [item.rowIndex]: e.target.value })} className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" />
                            ) : (
                              <span className="text-xs font-semibold text-red-700">{item.rusak || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingMerk ? (
                              <input type="text" value={editedMerk[item.rowIndex] ?? item.merk} onChange={(e) => setEditedMerk({ ...editedMerk, [item.rowIndex]: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" />
                            ) : (
                              <span className="text-xs text-gray-900">{item.merk || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingTahun ? (
                              <input type="text" value={editedTahun[item.rowIndex] ?? item.tahunPerolehan} onChange={(e) => setEditedTahun({ ...editedTahun, [item.rowIndex]: e.target.value })} className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" />
                            ) : (
                              <span className="text-xs text-gray-600">{item.tahunPerolehan || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingKeterangan ? (
                              <input type="text" value={editedKeterangan[item.rowIndex] ?? item.keterangan} onChange={(e) => setEditedKeterangan({ ...editedKeterangan, [item.rowIndex]: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" />
                            ) : (
                              <span className="text-xs text-gray-600">{item.keterangan || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <PhotoUpload
                              locationId={locationId}
                              category="apd-std"
                              itemId={`row-${item.rowIndex}`}
                              rowIndex={item.rowIndex}
                              currentPhotoUrl={item.fotoKondisi}
                              compact={true}
                              onUploadSuccess={(data) => {
                                setApdData(prev => prev.map(d => 
                                  d.rowIndex === item.rowIndex 
                                    ? { ...d, fotoKondisi: data.thumbnailUrl } 
                                    : d
                                ));
                              }}
                              onUploadError={(error) => alert(error)}
                            />
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {apdData.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500">
                Tidak ada data APD STD
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
