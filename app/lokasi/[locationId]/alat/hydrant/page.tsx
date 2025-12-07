'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';

interface PumpInfo {
  columnB: string;
  columnC: string;
  columnD: string;
  columnE: string;
  columnF: string;
  merkTipe: string;
  kapasitasAirTank: string;
  keterangan: string;
  linkLKS: string;
}

interface HydrantItem {
  rowIndex: number;
  no: string;
  boxNo: string;
  boxLocation: string;
  boxKondisi: string;
  pilarNo: string;
  pilarLocation: string;
  pilarKondisi: string;
  nozzleNo: string;
  nozzleLocation: string;
  nozzleKondisi: string;
  tanggalPengecekan: string;
  keterangan: string;
  linkLks: string;
}

interface FieldMetadata {
  [key: string]: string[] | null;
}

export default function HydrantPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [hydrantData, setHydrantData] = useState<HydrantItem[]>([]);
  const [pumpInfo, setPumpInfo] = useState<PumpInfo | null>(null);
  const [fieldMetadata, setFieldMetadata] = useState<FieldMetadata>({});
  const [editingPump, setEditingPump] = useState(false);
  const [editedPumpInfo, setEditedPumpInfo] = useState<PumpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HydrantItem | null>(null);
  const [editedData, setEditedData] = useState<Partial<HydrantItem>>({});
  const [inlineEditing, setInlineEditing] = useState<{[key: string]: boolean}>({});
  const [editingBoxColumn, setEditingBoxColumn] = useState(false);
  const [editingPilarColumn, setEditingPilarColumn] = useState(false);
  const [editingNozzleColumn, setEditingNozzleColumn] = useState(false);
  const [editedBoxData, setEditedBoxData] = useState<{[rowIndex: number]: string}>({});
  const [editedPilarData, setEditedPilarData] = useState<{[rowIndex: number]: string}>({});
  const [editedNozzleData, setEditedNozzleData] = useState<{[rowIndex: number]: string}>({});
  const [globalTanggal, setGlobalTanggal] = useState<string>('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchHydrantData();
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setGlobalTanggal(today);
    }
  }, [router, locationId]);

  const fetchHydrantData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hydrant?locationId=${locationId}`);
      const result = await response.json();
      
      if (result.success) {
        setHydrantData(result.data);
        setPumpInfo(result.pumpInfo);
        if (result.fieldMetadata) {
          setFieldMetadata(result.fieldMetadata);
        }
      } else {
        alert('Gagal memuat data hydrant');
      }
    } catch (error) {
      console.error('Error fetching hydrant data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  const handleEditPump = () => {
    setEditingPump(true);
    setEditedPumpInfo(pumpInfo);
  };

  const handleCancelPumpEdit = () => {
    setEditingPump(false);
    setEditedPumpInfo(null);
  };

  const handleSavePump = async () => {
    if (!editedPumpInfo) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/hydrant/pump', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          pumpInfo: editedPumpInfo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPumpInfo(editedPumpInfo);
        setEditingPump(false);
        setEditedPumpInfo(null);
        alert('Data pompa berhasil diperbarui');
      } else {
        alert('Gagal memperbarui data pompa');
      }
    } catch (error) {
      console.error('Error updating pump data:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditBoxColumn = () => {
    setEditingBoxColumn(true);
    const initialData: {[rowIndex: number]: string} = {};
    hydrantData.forEach(item => {
      initialData[item.rowIndex] = item.boxKondisi;
    });
    setEditedBoxData(initialData);
  };

  const handleEditPilarColumn = () => {
    setEditingPilarColumn(true);
    const initialData: {[rowIndex: number]: string} = {};
    hydrantData.forEach(item => {
      initialData[item.rowIndex] = item.pilarKondisi;
    });
    setEditedPilarData(initialData);
  };

  const handleEditNozzleColumn = () => {
    setEditingNozzleColumn(true);
    const initialData: {[rowIndex: number]: string} = {};
    hydrantData.forEach(item => {
      initialData[item.rowIndex] = item.nozzleKondisi;
    });
    setEditedNozzleData(initialData);
  };

  const handleCancelBoxEdit = () => {
    setEditingBoxColumn(false);
    setEditedBoxData({});
  };

  const handleCancelPilarEdit = () => {
    setEditingPilarColumn(false);
    setEditedPilarData({});
  };

  const handleCancelNozzleEdit = () => {
    setEditingNozzleColumn(false);
    setEditedNozzleData({});
  };

  const handleSaveBoxColumn = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedBoxData).map(([rowIndex, boxKondisi]) => ({
        rowIndex: parseInt(rowIndex),
        boxKondisi,
      }));

      const response = await fetch('/api/hydrant/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingBoxColumn(false);
        setEditedBoxData({});
        fetchHydrantData();
        alert('Box Hydrant berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Box Hydrant');
      }
    } catch (error) {
      console.error('Error updating box column:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePilarColumn = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedPilarData).map(([rowIndex, pilarKondisi]) => ({
        rowIndex: parseInt(rowIndex),
        pilarKondisi,
      }));

      const response = await fetch('/api/hydrant/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingPilarColumn(false);
        setEditedPilarData({});
        fetchHydrantData();
        alert('Pilar Hydrant berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Pilar Hydrant');
      }
    } catch (error) {
      console.error('Error updating pilar column:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNozzleColumn = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(editedNozzleData).map(([rowIndex, nozzleKondisi]) => ({
        rowIndex: parseInt(rowIndex),
        nozzleKondisi,
      }));

      const response = await fetch('/api/hydrant/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingNozzleColumn(false);
        setEditedNozzleData({});
        fetchHydrantData();
        alert('Nozzle Sprinkle berhasil diperbarui');
      } else {
        alert('Gagal memperbarui Nozzle Sprinkle');
      }
    } catch (error) {
      console.error('Error updating nozzle column:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (item: HydrantItem) => {
    setSelectedItem(item);
    setEditedData({
      boxKondisi: item.boxKondisi,
      pilarKondisi: item.pilarKondisi,
      nozzleKondisi: item.nozzleKondisi,
      tanggalPengecekan: globalTanggal || item.tanggalPengecekan || new Date().toISOString().split('T')[0],
      keterangan: item.keterangan,
      linkLks: item.linkLks,
    });
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setEditedData({});
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/hydrant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          rowIndex: selectedItem.rowIndex,
          ...editedData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Data berhasil diupdate!');
        handleCloseModal();
        fetchHydrantData(); // Refresh data
      } else {
        alert('Gagal mengupdate data');
      }
    } catch (error) {
      console.error('Error updating hydrant data:', error);
      alert('Terjadi kesalahan saat mengupdate data');
    } finally {
      setUpdating(false);
    }
  };

  const handleInlineKondisiChange = async (item: HydrantItem, field: 'boxKondisi' | 'pilarKondisi' | 'nozzleKondisi', value: string) => {
    const key = `${item.rowIndex}-${field}`;
    setInlineEditing({ ...inlineEditing, [key]: true });

    try {
      const response = await fetch('/api/hydrant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          rowIndex: item.rowIndex,
          [field]: value,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setHydrantData(hydrantData.map(h => 
          h.rowIndex === item.rowIndex ? { ...h, [field]: value } : h
        ));
      } else {
        alert('Gagal mengupdate kondisi');
      }
    } catch (error) {
      console.error('Error updating kondisi:', error);
      alert('Terjadi kesalahan saat mengupdate kondisi');
    } finally {
      setInlineEditing({ ...inlineEditing, [key]: false });
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
              <h1 className="text-xl font-bold">🚒 HYDRANT</h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
          <button
            onClick={fetchHydrantData}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-cyan-50 border-b border-cyan-100">
              <h2 className="text-xl font-bold text-gray-800">DATA HYDRANT SISTEM</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {hydrantData.length} item
              </p>
            </div>

            {/* Global Tanggal Section */}
            <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tanggal Pengecekan Global
                  </label>
                  <input
                    type="date"
                    value={globalTanggal}
                    onChange={(e) => setGlobalTanggal(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white shadow-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    💡 Tanggal ini akan otomatis terisi saat Anda membuka form update
                  </p>
                </div>
              </div>
            </div>

            {/* Pump Information Section */}
            {pumpInfo && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Informasi Pompa</h3>
                  {!editingPump ? (
                    <button
                      onClick={handleEditPump}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Edit Pompa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelPumpEdit}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSavePump}
                        disabled={updating}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Column B */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">Column B</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.columnB}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            columnB: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.columnB || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column C */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">Column C</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.columnC}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            columnC: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.columnC || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column D */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">Column D</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.columnD}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            columnD: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.columnD || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column E */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">Column E</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.columnE}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            columnE: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.columnE || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column F */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">Column F (Tekanan Operasi)</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.columnF}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            columnF: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.columnF || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Merk/Tipe/Model */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">🔧 Merk/Tipe/Model</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <textarea
                          value={editedPumpInfo.merkTipe}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            merkTipe: e.target.value
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900 whitespace-pre-line">
                          {pumpInfo?.merkTipe || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kapasitas Air Tank */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">💧 Kapasitas Air Tank (m³)</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.kapasitasAirTank}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            kapasitasAirTank: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.kapasitasAirTank || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">📝 Keterangan</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <textarea
                          value={editedPumpInfo.keterangan}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            keterangan: e.target.value
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900 whitespace-pre-line">
                          {pumpInfo?.keterangan || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link LKS */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-cyan-700 mb-3">🔗 Link LKS / BA Anomali</h4>
                    <div className="text-sm">
                      {editingPump && editedPumpInfo ? (
                        <input
                          type="text"
                          value={editedPumpInfo.linkLKS}
                          onChange={(e) => setEditedPumpInfo({
                            ...editedPumpInfo,
                            linkLKS: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        />
                      ) : (
                        <div className="font-semibold text-gray-900">
                          {pumpInfo?.linkLKS ? (
                            <a href={pumpInfo.linkLKS} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {pumpInfo.linkLKS}
                            </a>
                          ) : '-'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between">
                        <span>Box Hydrant</span>
                        {editingBoxColumn ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveBoxColumn}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelBoxEdit}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditBoxColumn}
                            className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between">
                        <span>Pilar Hydrant</span>
                        {editingPilarColumn ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSavePilarColumn}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelPilarEdit}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditPilarColumn}
                            className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      <div className="flex items-center justify-between">
                        <span>Nozzle Sprinkle</span>
                        {editingNozzleColumn ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveNozzleColumn}
                              disabled={updating}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelNozzleEdit}
                              disabled={updating}
                              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEditNozzleColumn}
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
                  {hydrantData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{item.no}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">{item.boxNo}</div>
                          <div className="text-gray-600">{item.boxLocation}</div>
                          {editingBoxColumn ? (
                            fieldMetadata.boxKondisi && fieldMetadata.boxKondisi.length > 0 ? (
                              <select
                                value={editedBoxData[item.rowIndex] || item.boxKondisi || ''}
                                onChange={(e) => setEditedBoxData({ ...editedBoxData, [item.rowIndex]: e.target.value })}
                                className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              >
                                <option value="">Pilih kondisi</option>
                                {fieldMetadata.boxKondisi.map((choice, idx) => (
                                  <option key={idx} value={choice}>{choice}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editedBoxData[item.rowIndex] || item.boxKondisi || ''}
                                onChange={(e) => setEditedBoxData({ ...editedBoxData, [item.rowIndex]: e.target.value })}
                                className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              />
                            )
                          ) : (
                            <div className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              item.boxKondisi === 'Normal' ? 'bg-green-100 text-green-800' : 
                              item.boxKondisi === 'Kadang Rembes' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.boxKondisi || '-'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">{item.pilarNo}</div>
                          <div className="text-gray-600">{item.pilarLocation}</div>
                          {editingPilarColumn ? (
                            fieldMetadata.pilarKondisi && fieldMetadata.pilarKondisi.length > 0 ? (
                              <select
                                value={editedPilarData[item.rowIndex] || item.pilarKondisi || ''}
                                onChange={(e) => setEditedPilarData({ ...editedPilarData, [item.rowIndex]: e.target.value })}
                                className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              >
                                <option value="">Pilih kondisi</option>
                                {fieldMetadata.pilarKondisi.map((choice, idx) => (
                                  <option key={idx} value={choice}>{choice}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editedPilarData[item.rowIndex] || item.pilarKondisi || ''}
                                onChange={(e) => setEditedPilarData({ ...editedPilarData, [item.rowIndex]: e.target.value })}
                                className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              />
                            )
                          ) : (
                            <div className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              item.pilarKondisi === 'Normal' ? 'bg-green-100 text-green-800' : 
                              item.pilarKondisi === 'Kadang Rembes' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.pilarKondisi || '-'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">{item.nozzleNo}</div>
                          <div className="text-gray-600">{item.nozzleLocation}</div>
                          {editingNozzleColumn ? (
                            fieldMetadata.nozzleKondisi && fieldMetadata.nozzleKondisi.length > 0 ? (
                              <select
                                value={editedNozzleData[item.rowIndex] || item.nozzleKondisi || ''}
                                onChange={(e) => setEditedNozzleData({ ...editedNozzleData, [item.rowIndex]: e.target.value })}
                                className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              >
                                <option value="">Pilih kondisi</option>
                                {fieldMetadata.nozzleKondisi.map((choice, idx) => (
                                  <option key={idx} value={choice}>{choice}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editedNozzleData[item.rowIndex] || item.nozzleKondisi || ''}
                                onChange={(e) => setEditedNozzleData({ ...editedNozzleData, [item.rowIndex]: e.target.value })}
                                className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900"
                              />
                            )
                          ) : (
                            <div className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              item.nozzleKondisi === 'Normal' ? 'bg-green-100 text-green-800' : 
                              item.nozzleKondisi === 'Kadang Rembes' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.nozzleKondisi || '-'}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hydrantData.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Tidak ada data hydrant
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-cyan-600 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Update Kondisi Hydrant</h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-cyan-100 mt-1">
                {selectedItem.boxNo} - {selectedItem.boxLocation}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Box Hydrant Kondisi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kondisi Box Hydrant
                </label>
                {fieldMetadata.boxKondisi && fieldMetadata.boxKondisi.length > 0 ? (
                  <select
                    value={editedData.boxKondisi || ''}
                    onChange={(e) => setEditedData({ ...editedData, boxKondisi: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                  >
                    <option value="">Pilih kondisi</option>
                    {fieldMetadata.boxKondisi.map((choice, idx) => (
                      <option key={idx} value={choice}>{choice}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editedData.boxKondisi || ''}
                    onChange={(e) => setEditedData({ ...editedData, boxKondisi: e.target.value })}
                    placeholder="Masukkan kondisi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                  />
                )}
              </div>

              {/* Pilar Hydrant Kondisi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kondisi Pilar Hydrant
                </label>
                {fieldMetadata.pilarKondisi && fieldMetadata.pilarKondisi.length > 0 ? (
                  <select
                    value={editedData.pilarKondisi || ''}
                    onChange={(e) => setEditedData({ ...editedData, pilarKondisi: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                  >
                    <option value="">Pilih kondisi</option>
                    {fieldMetadata.pilarKondisi.map((choice, idx) => (
                      <option key={idx} value={choice}>{choice}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editedData.pilarKondisi || ''}
                    onChange={(e) => setEditedData({ ...editedData, pilarKondisi: e.target.value })}
                    placeholder="Masukkan kondisi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                  />
                )}
              </div>

              {/* Nozzle Kondisi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kondisi Nozzle Sprinkle
                </label>
                {fieldMetadata.nozzleKondisi && fieldMetadata.nozzleKondisi.length > 0 ? (
                  <select
                    value={editedData.nozzleKondisi || ''}
                    onChange={(e) => setEditedData({ ...editedData, nozzleKondisi: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                  >
                    <option value="">Pilih kondisi</option>
                    {fieldMetadata.nozzleKondisi.map((choice, idx) => (
                      <option key={idx} value={choice}>{choice}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editedData.nozzleKondisi || ''}
                    onChange={(e) => setEditedData({ ...editedData, nozzleKondisi: e.target.value })}
                    placeholder="Masukkan kondisi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                  />
                )}
              </div>

              {/* Box Nomor */}
              {selectedItem.boxNo && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Box Hydrant
                  </label>
                  {fieldMetadata.boxNo && fieldMetadata.boxNo.length > 0 ? (
                    <select
                      value={editedData.boxNo || selectedItem.boxNo}
                      onChange={(e) => setEditedData({ ...editedData, boxNo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                    >
                      <option value="">Pilih nomor</option>
                      {fieldMetadata.boxNo.map((choice, idx) => (
                        <option key={idx} value={choice}>{choice}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                      {selectedItem.boxNo}
                    </div>
                  )}
                </div>
              )}

              {/* Box Location */}
              {selectedItem.boxLocation && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lokasi Box Hydrant
                  </label>
                  {fieldMetadata.boxLocation && fieldMetadata.boxLocation.length > 0 ? (
                    <select
                      value={editedData.boxLocation || selectedItem.boxLocation}
                      onChange={(e) => setEditedData({ ...editedData, boxLocation: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                    >
                      <option value="">Pilih lokasi</option>
                      {fieldMetadata.boxLocation.map((choice, idx) => (
                        <option key={idx} value={choice}>{choice}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                      {selectedItem.boxLocation}
                    </div>
                  )}
                </div>
              )}

              {/* Tanggal Pengecekan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Pengecekan
                </label>
                <input
                  type="date"
                  value={editedData.tanggalPengecekan || ''}
                  onChange={(e) => setEditedData({ ...editedData, tanggalPengecekan: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  value={editedData.keterangan || ''}
                  onChange={(e) => setEditedData({ ...editedData, keterangan: e.target.value })}
                  rows={3}
                  placeholder="Masukkan keterangan (opsional)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-gray-900"
                />
              </div>

              {/* Link LKS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link LKS / BA Anomali
                </label>
                <input
                  type="url"
                  value={editedData.linkLks || ''}
                  onChange={(e) => setEditedData({ ...editedData, linkLks: e.target.value })}
                  placeholder="Masukkan link (opsional)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {updating ? 'Mengupdate...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
