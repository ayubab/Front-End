'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';

interface AlatKerjaItem {
  rowIndex: number;
  no: string;
  namaPeralatan: string;
  satuan: string;
  jumlahMinimum: string;
  jumlah: string;
  merk: string;
  tahunPerolehan: string;
  kondisi: string;
  keterangan: string;
  isCategory: boolean;
}

interface FieldMetadata {
  [key: string]: string[] | null;
}

export default function AlatKerjaPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [alatData, setAlatData] = useState<AlatKerjaItem[]>([]);
  const [fieldMetadata, setFieldMetadata] = useState<FieldMetadata>({});
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingJumlah, setEditingJumlah] = useState(false);
  const [editingMerk, setEditingMerk] = useState(false);
  const [editingTahun, setEditingTahun] = useState(false);
  const [editingKondisi, setEditingKondisi] = useState(false);
  const [editingKeterangan, setEditingKeterangan] = useState(false);
  const [editedJumlah, setEditedJumlah] = useState<{[rowIndex: number]: string}>({});
  const [editedMerk, setEditedMerk] = useState<{[rowIndex: number]: string}>({});
  const [editedTahun, setEditedTahun] = useState<{[rowIndex: number]: string}>({});
  const [editedKondisi, setEditedKondisi] = useState<{[rowIndex: number]: string}>({});
  const [editedKeterangan, setEditedKeterangan] = useState<{[rowIndex: number]: string}>({});
  const [globalTanggal, setGlobalTanggal] = useState<string>('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchAlatKerjaData();
      const today = new Date().toISOString().split('T')[0];
      setGlobalTanggal(today);
    }
  }, [router, locationId]);

  const fetchAlatKerjaData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/alat-kerja?locationId=${locationId}`);
      const result = await response.json();
      
      if (result.success) {
        setAlatData(result.data);
        if (result.fieldMetadata) {
          setFieldMetadata(result.fieldMetadata);
        }
        if (result.lastUpdateDate) {
          setLastUpdateDate(result.lastUpdateDate);
          setGlobalTanggal(result.lastUpdateDate);
        }
      } else {
        alert('Gagal memuat data Alat Kerja');
      }
    } catch (error) {
      console.error('Error fetching Alat Kerja data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  const createColumnEditHandlers = (
    column: 'jumlah' | 'merk' | 'tahunPerolehan' | 'kondisi' | 'keterangan',
    setEditing: (val: boolean) => void,
    setEditedData: (data: {[key: number]: string}) => void
  ) => {
    return {
      edit: () => {
        setEditing(true);
        const initialData: {[rowIndex: number]: string} = {};
        alatData.forEach(item => {
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

          const response = await fetch('/api/alat-kerja/bulk', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
          });

          const result = await response.json();
          if (result.success) {
            setEditing(false);
            setEditedData({});
            fetchAlatKerjaData();
            const columnNames = {
              jumlah: 'Jumlah',
              merk: 'Merk/Type',
              tahunPerolehan: 'Tahun Perolehan',
              kondisi: 'Kondisi',
              keterangan: 'Keterangan'
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

  const jumlahHandlers = createColumnEditHandlers('jumlah', setEditingJumlah, setEditedJumlah);
  const merkHandlers = createColumnEditHandlers('merk', setEditingMerk, setEditedMerk);
  const tahunHandlers = createColumnEditHandlers('tahunPerolehan', setEditingTahun, setEditedTahun);
  const kondisiHandlers = createColumnEditHandlers('kondisi', setEditingKondisi, setEditedKondisi);
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
              <h1 className="text-xl font-bold">🔧 ALAT KERJA</h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
          <button
            onClick={fetchAlatKerjaData}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? '⟳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Global Tanggal Pengecekan */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📅</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Pengecekan (ditulis ke sel J3)
              </label>
              <input
                type="date"
                value={globalTanggal}
                onChange={(e) => setGlobalTanggal(e.target.value)}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Nilai ini dikirim ke sel J3 setiap kali menyimpan perubahan.
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
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase sticky left-0 bg-gray-50">No</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Nama Peralatan</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Satuan</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Jumlah Min</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Jumlah</span>
                        {editingJumlah ? (
                          <div className="flex gap-1">
                            <button onClick={() => jumlahHandlers.save(editedJumlah)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                            <button onClick={jumlahHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                          </div>
                        ) : (
                          <button onClick={jumlahHandlers.edit} className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700">Edit</button>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Merk/Type</span>
                        {editingMerk ? (
                          <div className="flex gap-1">
                            <button onClick={() => merkHandlers.save(editedMerk)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                            <button onClick={merkHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                          </div>
                        ) : (
                          <button onClick={merkHandlers.edit} className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700">Edit</button>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Tahun</span>
                        {editingTahun ? (
                          <div className="flex gap-1">
                            <button onClick={() => tahunHandlers.save(editedTahun)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                            <button onClick={tahunHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                          </div>
                        ) : (
                          <button onClick={tahunHandlers.edit} className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700">Edit</button>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Kondisi</span>
                        {editingKondisi ? (
                          <div className="flex gap-1">
                            <button onClick={() => kondisiHandlers.save(editedKondisi)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                            <button onClick={kondisiHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                          </div>
                        ) : (
                          <button onClick={kondisiHandlers.edit} className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700">Edit</button>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Keterangan</span>
                        {editingKeterangan ? (
                          <div className="flex gap-1">
                            <button onClick={() => keteranganHandlers.save(editedKeterangan)} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                            <button onClick={keteranganHandlers.cancel} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                          </div>
                        ) : (
                          <button onClick={keteranganHandlers.edit} className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700">Edit</button>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alatData.map((item, index) => (
                    item.isCategory ? (
                      <tr key={index} className="bg-cyan-50">
                        <td colSpan={9} className="px-3 py-2 text-xs font-bold text-cyan-900">
                          {item.no} - {item.namaPeralatan}
                        </td>
                      </tr>
                    ) : (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-900 sticky left-0 bg-white">{item.no}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.namaPeralatan}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{item.satuan}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{item.jumlahMinimum}</td>
                        <td className="px-3 py-2">
                          {editingJumlah ? (
                            <input type="text" value={editedJumlah[item.rowIndex] ?? item.jumlah} onChange={(e) => setEditedJumlah({ ...editedJumlah, [item.rowIndex]: e.target.value })} className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900" />
                          ) : (
                            <span className="text-xs text-gray-900">{item.jumlah || '-'}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingMerk ? (
                            <input type="text" value={editedMerk[item.rowIndex] ?? item.merk} onChange={(e) => setEditedMerk({ ...editedMerk, [item.rowIndex]: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900" />
                          ) : (
                            <span className="text-xs text-gray-900">{item.merk || '-'}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingTahun ? (
                            <input type="text" value={editedTahun[item.rowIndex] ?? item.tahunPerolehan} onChange={(e) => setEditedTahun({ ...editedTahun, [item.rowIndex]: e.target.value })} className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900" />
                          ) : (
                            <span className="text-xs text-gray-600">{item.tahunPerolehan || '-'}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingKondisi ? (
                            fieldMetadata.kondisi && fieldMetadata.kondisi.length > 0 ? (
                              <select value={editedKondisi[item.rowIndex] ?? item.kondisi ?? ''} onChange={(e) => setEditedKondisi({ ...editedKondisi, [item.rowIndex]: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900">
                                <option value="">Pilih kondisi</option>
                                {fieldMetadata.kondisi.map((choice, idx) => (
                                  <option key={idx} value={choice}>{choice}</option>
                                ))}
                              </select>
                            ) : (
                              <input type="text" value={editedKondisi[item.rowIndex] ?? item.kondisi ?? ''} onChange={(e) => setEditedKondisi({ ...editedKondisi, [item.rowIndex]: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900" />
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
                        <td className="px-3 py-2">
                          {editingKeterangan ? (
                            <input type="text" value={editedKeterangan[item.rowIndex] ?? item.keterangan ?? ''} onChange={(e) => setEditedKeterangan({ ...editedKeterangan, [item.rowIndex]: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900" />
                          ) : (
                            <span className="text-xs text-gray-600">{item.keterangan || '-'}</span>
                          )}
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {alatData.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              Tidak ada data Alat Kerja
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
