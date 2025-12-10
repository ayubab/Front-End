'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';

interface APDItem {
  rowIndex: number;
  jenisAPD: string;
  jumlah: string;
  merk: string;
  kondisi: string;
  keterangan: string;
  isCategory: boolean;
}

interface FieldMetadata {
  [key: string]: string[] | null;
}

export default function APDPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [apdData, setApdData] = useState<APDItem[]>([]);
  const [fieldMetadata, setFieldMetadata] = useState<FieldMetadata>({});
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingJumlah, setEditingJumlah] = useState(false);
  const [editingMerk, setEditingMerk] = useState(false);
  const [editingKondisi, setEditingKondisi] = useState(false);
  const [editingKeterangan, setEditingKeterangan] = useState(false);
  const [editedJumlah, setEditedJumlah] = useState<{[rowIndex: number]: string}>({});
  const [editedMerk, setEditedMerk] = useState<{[rowIndex: number]: string}>({});
  const [editedKondisi, setEditedKondisi] = useState<{[rowIndex: number]: string}>({});
  const [editedKeterangan, setEditedKeterangan] = useState<{[rowIndex: number]: string}>({});
  const [globalTanggal, setGlobalTanggal] = useState<string>('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchAPDData();
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setGlobalTanggal(today);
    }
  }, [router, locationId]);

  const fetchAPDData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apd?locationId=${locationId}`);
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
        alert('Gagal memuat data APD');
      }
    } catch (error) {
      console.error('Error fetching APD data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  const handleEditJumlah = () => {
    setEditingJumlah(true);
    const initialData: {[rowIndex: number]: string} = {};
    apdData.forEach(item => {
      if (!item.isCategory) {
        initialData[item.rowIndex] = item.jumlah;
      }
    });
    setEditedJumlah(initialData);
  };

  const handleEditMerk = () => {
    setEditingMerk(true);
    const initialData: {[rowIndex: number]: string} = {};
    apdData.forEach(item => {
      if (!item.isCategory) {
        initialData[item.rowIndex] = item.merk;
      }
    });
    setEditedMerk(initialData);
  };

  const handleEditKondisi = () => {
    setEditingKondisi(true);
    const initialData: {[rowIndex: number]: string} = {};
    apdData.forEach(item => {
      if (!item.isCategory) {
        initialData[item.rowIndex] = item.kondisi;
      }
    });
    setEditedKondisi(initialData);
  };

  const handleEditKeterangan = () => {
    setEditingKeterangan(true);
    const initialData: {[rowIndex: number]: string} = {};
    apdData.forEach(item => {
      if (!item.isCategory) {
        initialData[item.rowIndex] = item.keterangan;
      }
    });
    setEditedKeterangan(initialData);
  };

  const handleCancelJumlah = () => {
    setEditingJumlah(false);
    setEditedJumlah({});
  };

  const handleCancelMerk = () => {
    setEditingMerk(false);
    setEditedMerk({});
  };

  const handleCancelKondisi = () => {
    setEditingKondisi(false);
    setEditedKondisi({});
  };

  const handleCancelKeterangan = () => {
    setEditingKeterangan(false);
    setEditedKeterangan({});
  };

  const handleSaveJumlah = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedJumlah).map(([rowIndex, jumlah]) => ({
        rowIndex: parseInt(rowIndex),
        jumlah,
      }));

      const response = await fetch('/api/apd/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingJumlah(false);
        setEditedJumlah({});
        fetchAPDData();
        alert('Jumlah berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Jumlah');
      }
    } catch (error) {
      console.error('Error updating jumlah:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveMerk = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedMerk).map(([rowIndex, merk]) => ({
        rowIndex: parseInt(rowIndex),
        merk,
      }));

      const response = await fetch('/api/apd/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingMerk(false);
        setEditedMerk({});
        fetchAPDData();
        alert('Merk/Type berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Merk/Type');
      }
    } catch (error) {
      console.error('Error updating merk:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveKondisi = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedKondisi).map(([rowIndex, kondisi]) => ({
        rowIndex: parseInt(rowIndex),
        kondisi,
      }));

      const response = await fetch('/api/apd/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingKondisi(false);
        setEditedKondisi({});
        fetchAPDData();
        alert('Kondisi berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Kondisi');
      }
    } catch (error) {
      console.error('Error updating kondisi:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveKeterangan = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedKeterangan).map(([rowIndex, keterangan]) => ({
        rowIndex: parseInt(rowIndex),
        keterangan,
      }));

      const response = await fetch('/api/apd/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingKeterangan(false);
        setEditedKeterangan({});
        fetchAPDData();
        alert('Keterangan berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Keterangan');
      }
    } catch (error) {
      console.error('Error updating keterangan:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

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
              <h1 className="text-xl font-bold">🦺 ALAT PELINDUNG DIRI (APD)</h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
          <button
            onClick={fetchAPDData}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? '⟳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Global Tanggal Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📅</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Update (ditulis ke sel H3)
              </label>
              <input
                type="date"
                value={globalTanggal}
                onChange={(e) => setGlobalTanggal(e.target.value)}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Nilai ini akan dikirim sebagai tanggal update di sel H3 setiap kali menyimpan perubahan.
              </p>
              {lastUpdateDate && (
                <p className="text-xs text-gray-600 mt-1">
                  Terakhir tercatat di sheet: {lastUpdateDate}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-cyan-600 text-xl mb-2">Memuat data...</div>
              <div className="text-gray-500">Mohon tunggu sebentar</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase sticky left-0 bg-gray-50">Jenis APD</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Jumlah</span>
                        {editingJumlah ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveJumlah}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelJumlah}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditJumlah}
                            className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Merk / Type</span>
                        {editingMerk ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveMerk}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelMerk}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditMerk}
                            className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Kondisi (Baik/Rusak/Kadaluarsa)</span>
                        {editingKondisi ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveKondisi}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelKondisi}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditKondisi}
                            className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Keterangan</span>
                        {editingKeterangan ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveKeterangan}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelKeterangan}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditKeterangan}
                            className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apdData.map((item, index) => (
                    item.isCategory ? (
                      <tr key={index} className="bg-cyan-50">
                        <td colSpan={5} className="px-4 py-3 text-sm font-bold text-cyan-900">
                          {item.jenisAPD}
                        </td>
                      </tr>
                    ) : (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-white">{item.jenisAPD}</td>
                        <td className="px-4 py-3">
                          {editingJumlah ? (
                            <input
                              type="text"
                              value={editedJumlah[item.rowIndex] ?? item.jumlah}
                              onChange={(e) => setEditedJumlah({ ...editedJumlah, [item.rowIndex]: e.target.value })}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item.jumlah || '-'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingMerk ? (
                            <input
                              type="text"
                              value={editedMerk[item.rowIndex] ?? item.merk}
                              onChange={(e) => setEditedMerk({ ...editedMerk, [item.rowIndex]: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item.merk || '-'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingKondisi ? (
                            fieldMetadata.kondisi && fieldMetadata.kondisi.length > 0 ? (
                              <select
                                value={editedKondisi[item.rowIndex] ?? item.kondisi ?? ''}
                                onChange={(e) => setEditedKondisi({ ...editedKondisi, [item.rowIndex]: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              >
                                <option value="">Pilih kondisi</option>
                                {fieldMetadata.kondisi.map((choice, idx) => (
                                  <option key={idx} value={choice}>{choice}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editedKondisi[item.rowIndex] ?? item.kondisi ?? ''}
                                onChange={(e) => setEditedKondisi({ ...editedKondisi, [item.rowIndex]: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              />
                            )
                          ) : (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              item.kondisi?.toUpperCase() === 'BAIK' ? 'bg-green-100 text-green-800' : 
                              item.kondisi?.toUpperCase() === 'RUSAK' ? 'bg-red-100 text-red-800' : 
                              item.kondisi?.toUpperCase() === 'KADALUARSA' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.kondisi || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingKeterangan ? (
                            <input
                              type="text"
                              value={editedKeterangan[item.rowIndex] ?? item.keterangan ?? ''}
                              onChange={(e) => setEditedKeterangan({ ...editedKeterangan, [item.rowIndex]: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{item.keterangan || '-'}</span>
                          )}
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
              Tidak ada data APD
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
