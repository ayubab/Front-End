'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';

interface LimbahItem {
  rowIndex: number;
  no: string;
  jenisLimbah: string;
  jumlah: string;
}

interface LimbahLog {
  rowIndex: number;
  tanggal: string;
  jenisLimbah: string;
  masuk: string;
  keluar: string;
  keterangan: string;
}

export default function LimbahK3Page() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [limbahData, setLimbahData] = useState<LimbahItem[]>([]);
  const [limbahLogs, setLimbahLogs] = useState<LimbahLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingJumlah, setEditingJumlah] = useState(false);
  const [editedJumlah, setEditedJumlah] = useState<{[rowIndex: number]: string}>({});
  
  // New log entry state
  const [showAddLog, setShowAddLog] = useState(false);
  const [newLog, setNewLog] = useState({
    tanggal: '',
    jenisLimbah: '',
    masuk: '',
    keluar: '',
    keterangan: ''
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchLimbahData();
    }
  }, [router, locationId]);

  const fetchLimbahData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/limbah-k3?locationId=${locationId}`);
      const result = await response.json();
      
      if (result.success) {
        setLimbahData(result.data);
        setLimbahLogs(result.logs || []);
      } else {
        alert('Gagal memuat data Limbah K3');
      }
    } catch (error) {
      console.error('Error fetching Limbah K3 data:', error);
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
    limbahData.forEach(item => {
      initialData[item.rowIndex] = item.jumlah;
    });
    setEditedJumlah(initialData);
  };

  const handleCancelJumlah = () => {
    setEditingJumlah(false);
    setEditedJumlah({});
  };

  const handleSaveJumlah = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedJumlah).map(([rowIndex, jumlah]) => ({
        rowIndex: parseInt(rowIndex),
        jumlah,
      }));

      const response = await fetch('/api/limbah-k3/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingJumlah(false);
        setEditedJumlah({});
        fetchLimbahData();
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

  const handleAddLog = async () => {
    if (!newLog.tanggal || !newLog.jenisLimbah) {
      alert('Tanggal dan Jenis Limbah harus diisi');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/limbah-k3/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, ...newLog }),
      });

      const result = await response.json();
      if (result.success) {
        setShowAddLog(false);
        setNewLog({ tanggal: '', jenisLimbah: '', masuk: '', keluar: '', keterangan: '' });
        fetchLimbahData();
        alert('Log limbah berhasil ditambahkan');
      } else {
        alert('Gagal menambahkan log limbah');
      }
    } catch (error) {
      console.error('Error adding log:', error);
      alert('Terjadi kesalahan saat menambahkan log');
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
              <h1 className="text-xl font-bold">♻️ LIMBAH K3</h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
          <button
            onClick={fetchLimbahData}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? '⟳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Limbah Summary Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 bg-cyan-50 border-b border-cyan-100">
            <h2 className="text-lg font-bold text-cyan-900">Data Limbah</h2>
          </div>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Jenis Awal Limbah</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between gap-2">
                        <span>Jumlah (ton)</span>
                        {editingJumlah ? (
                          <div className="flex gap-1">
                            <button onClick={handleSaveJumlah} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                            <button onClick={handleCancelJumlah} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
                          </div>
                        ) : (
                          <button onClick={handleEditJumlah} className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700">Edit</button>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {limbahData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.jenisLimbah}</td>
                      <td className="px-4 py-3">
                        {editingJumlah ? (
                          <input
                            type="text"
                            value={editedJumlah[item.rowIndex] ?? item.jumlah}
                            onChange={(e) => setEditedJumlah({ ...editedJumlah, [item.rowIndex]: e.target.value })}
                            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{item.jumlah || '0'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Limbah Logs Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 bg-cyan-50 border-b border-cyan-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-cyan-900">Catatan Keluar Masuk Limbah</h2>
            <button
              onClick={() => setShowAddLog(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Tambah Catatan
            </button>
          </div>
          
          {showAddLog && (
            <div className="p-6 bg-blue-50 border-b border-blue-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Tambah Catatan Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={newLog.tanggal}
                    onChange={(e) => setNewLog({ ...newLog, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Limbah *</label>
                  <select
                    value={newLog.jenisLimbah}
                    onChange={(e) => setNewLog({ ...newLog, jenisLimbah: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Pilih Jenis</option>
                    {limbahData.map((item, idx) => (
                      <option key={idx} value={item.jenisLimbah}>{item.jenisLimbah}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Masuk (ton)</label>
                  <input
                    type="text"
                    value={newLog.masuk}
                    onChange={(e) => setNewLog({ ...newLog, masuk: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Keluar (ton)</label>
                  <input
                    type="text"
                    value={newLog.keluar}
                    onChange={(e) => setNewLog({ ...newLog, keluar: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={newLog.keterangan}
                    onChange={(e) => setNewLog({ ...newLog, keterangan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddLog}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setShowAddLog(false);
                    setNewLog({ tanggal: '', jenisLimbah: '', masuk: '', keluar: '', keterangan: '' });
                  }}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Jenis Limbah</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Masuk (ton)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Keluar (ton)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {limbahLogs.length > 0 ? (
                  limbahLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{log.tanggal}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{log.jenisLimbah}</td>
                      <td className="px-4 py-3 text-sm text-green-700 font-semibold">{log.masuk || '-'}</td>
                      <td className="px-4 py-3 text-sm text-red-700 font-semibold">{log.keluar || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.keterangan || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Belum ada catatan limbah
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
