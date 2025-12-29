'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';
import PhotoUpload from '@/app/components/PhotoUpload';
import Image from 'next/image';

// Types for KANTOR form
interface APDSubData {
  baik: string;
  rusak: string;
  merk: string;
  tahun: string;
  keterangan: string;
}

interface APDStdKantorItem {
  rowIndex: number;
  itemPeralatan: string;
  apd: string;
  satuan: string;
  gisGiGitet: string;
  harGi: string;
  harJar: string;
  harPro: string;
  kantor: string;
  isCategory: boolean;
  gi: APDSubData;
  jar: APDSubData;
  pro: APDSubData;
}

// Types for GI form
interface APDStdGiItem {
  rowIndex: number;
  itemPeralatan: string;
  apd: string;
  satuan: string;
  baik: string;
  rusak: string;
  merk: string;
  tahunPerolehan: string;
  keterangan: string;
  isCategory: boolean;
  fotoKondisi?: string;
}

type HarType = 'gi' | 'jar' | 'pro';
type FieldType = 'baik' | 'rusak' | 'merk' | 'tahun' | 'keterangan';

const KANTOR_LOCATION_ID = 'ultg-yogyakarta';

export default function APDStdPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);
  const isKantor = locationId === KANTOR_LOCATION_ID;

  // KANTOR state
  const [kantorData, setKantorData] = useState<APDStdKantorItem[]>([]);
  const [activeTab, setActiveTab] = useState<HarType>('gi');
  const [editingColumn, setEditingColumn] = useState<{type: HarType, field: FieldType} | null>(null);
  const [editedValues, setEditedValues] = useState<{[rowIndex: number]: string}>({});

  // GI state
  const [giData, setGiData] = useState<APDStdGiItem[]>([]);
  const [editingGiField, setEditingGiField] = useState<string | null>(null);
  const [editedGiValues, setEditedGiValues] = useState<{[rowIndex: number]: string}>({});

  // Common state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [globalTanggal, setGlobalTanggal] = useState<string>('');
  const [showColorImages, setShowColorImages] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchData();
      const today = new Date().toISOString().split('T')[0];
      setGlobalTanggal(today);
    }
  }, [router, locationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apd-std?locationId=${locationId}`);
      const result = await response.json();
      
      if (result.success) {
        if (isKantor) {
          setKantorData(result.data);
        } else {
          setGiData(result.data);
        }
        if (result.lastUpdateDate) {
          setLastUpdateDate(result.lastUpdateDate);
          setGlobalTanggal(result.lastUpdateDate);
        }
      } else {
        alert('Gagal memuat data: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/lokasi/${locationId}/alat`);
  };

  // ==================== KANTOR FUNCTIONS ====================
  const startKantorEditing = (type: HarType, field: FieldType) => {
    const initialValues: {[key: number]: string} = {};
    kantorData.forEach(item => {
      if (!item.isCategory) {
        initialValues[item.rowIndex] = (item[type] as any)[field];
      }
    });
    setEditedValues(initialValues);
    setEditingColumn({ type, field });
  };

  const cancelKantorEditing = () => {
    setEditingColumn(null);
    setEditedValues({});
  };

  const saveKantorEditing = async () => {
    if (!editingColumn) return;
    setUpdating(true);

    try {
      const updates = Object.entries(editedValues).map(([rowIndex, value]) => ({
        rowIndex: parseInt(rowIndex),
        [editingColumn.field]: value,
      }));

      const response = await fetch('/api/apd-std/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          locationId, 
          updates, 
          tanggalUpdate: globalTanggal,
          type: editingColumn.type 
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingColumn(null);
        setEditedValues({});
        fetchData();
        alert('Data berhasil diperbarui');
      } else {
        alert('Gagal memperbarui data');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setUpdating(false);
    }
  };

  const getTabLabel = (type: HarType) => {
    switch (type) {
      case 'gi': return 'HAR GI';
      case 'jar': return 'HAR JARINGAN';
      case 'pro': return 'HAR PROTEKSI';
    }
  };

  // ==================== GI FUNCTIONS ====================
  const startGiEditing = (field: string) => {
    const initialValues: {[key: number]: string} = {};
    giData.forEach(item => {
      if (!item.isCategory) {
        initialValues[item.rowIndex] = (item as any)[field] || '';
      }
    });
    setEditedGiValues(initialValues);
    setEditingGiField(field);
  };

  const cancelGiEditing = () => {
    setEditingGiField(null);
    setEditedGiValues({});
  };

  const saveGiEditing = async () => {
    if (!editingGiField) return;
    setUpdating(true);

    try {
      const updates = Object.entries(editedGiValues).map(([rowIndex, value]) => ({
        rowIndex: parseInt(rowIndex),
        [editingGiField]: value,
      }));

      const response = await fetch('/api/apd-std/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, updates, tanggalUpdate: globalTanggal }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingGiField(null);
        setEditedGiValues({});
        fetchData();
        alert('Data berhasil diperbarui');
      } else {
        alert('Gagal memperbarui data');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Terjadi kesalahan saat menyimpan');
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

  // ==================== RENDER KANTOR FORM ====================
  const renderKantorForm = () => {
    const renderKantorHeaderCell = (field: FieldType, label: string) => {
      const isEditing = editingColumn?.type === activeTab && editingColumn?.field === field;
      
      return (
        <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase min-w-[100px]">
          <div className="flex items-center justify-between gap-2">
            <span>{label}</span>
            {isEditing ? (
              <div className="flex gap-1">
                <button onClick={saveKantorEditing} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                <button onClick={cancelKantorEditing} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
              </div>
            ) : (
              <button 
                onClick={() => startKantorEditing(activeTab, field)} 
                disabled={!!editingColumn}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-30"
              >
                Edit
              </button>
            )}
          </div>
        </th>
      );
    };

    return (
      <>
        {/* Tab Selection */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['gi', 'jar', 'pro'] as HarType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                if (!editingColumn) setActiveTab(type);
                else alert('Selesaikan edit data terlebih dahulu');
              }}
              className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap ${
                activeTab === type 
                  ? 'bg-white text-cyan-700 border-t-4 border-cyan-500' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              {getTabLabel(type)}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-3 flex justify-between items-center">
            <h3 className="text-white font-bold">✏️ INPUT: {getTabLabel(activeTab)}</h3>
            <div className="text-xs text-white/80">{kantorData.length} baris</div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin text-4xl mb-4">🌀</div>
              <div className="text-gray-500">Memuat data...</div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 w-[200px]">Item/Peralatan</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-[200px]">APD</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-[80px]">Satuan</th>
                    {renderKantorHeaderCell('baik', 'BAIK')}
                    {renderKantorHeaderCell('rusak', 'RUSAK')}
                    {renderKantorHeaderCell('merk', 'MERK')}
                    {renderKantorHeaderCell('tahun', 'TAHUN')}
                    {renderKantorHeaderCell('keterangan', 'KET')}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kantorData.map((item) => {
                    if (item.isCategory) {
                      return (
                        <tr key={item.rowIndex} className="bg-cyan-50">
                          <td colSpan={8} className="px-3 py-2 font-bold text-cyan-800 border-l-4 border-cyan-500">
                            {item.itemPeralatan}
                          </td>
                        </tr>
                      );
                    }

                    const data = item[activeTab];

                    return (
                      <tr key={item.rowIndex} className="hover:bg-blue-50/30">
                        <td className="px-3 py-2 text-gray-700 sticky left-0 bg-white">{item.itemPeralatan}</td>
                        <td className="px-3 py-2 text-gray-600">{item.apd}</td>
                        <td className="px-3 py-2 text-gray-500">{item.satuan}</td>
                        
                        {/* BAIK */}
                        <td className="px-3 py-2">
                          {editingColumn?.type === activeTab && editingColumn?.field === 'baik' ? (
                            <input type="text" value={editedValues[item.rowIndex] ?? data.baik} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" autoFocus />
                          ) : (
                            <span className={`font-semibold ${data.baik ? 'text-green-600' : 'text-gray-300'}`}>{data.baik || '-'}</span>
                          )}
                        </td>

                        {/* RUSAK */}
                        <td className="px-3 py-2">
                          {editingColumn?.type === activeTab && editingColumn?.field === 'rusak' ? (
                            <input type="text" value={editedValues[item.rowIndex] ?? data.rusak} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
                          ) : (
                            <span className={`font-semibold ${data.rusak ? 'text-red-600' : 'text-gray-300'}`}>{data.rusak || '-'}</span>
                          )}
                        </td>

                        {/* MERK */}
                        <td className="px-3 py-2">
                          {editingColumn?.type === activeTab && editingColumn?.field === 'merk' ? (
                            <input type="text" value={editedValues[item.rowIndex] ?? data.merk} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
                          ) : (
                            <span className="text-gray-700">{data.merk || '-'}</span>
                          )}
                        </td>

                        {/* TAHUN */}
                        <td className="px-3 py-2">
                          {editingColumn?.type === activeTab && editingColumn?.field === 'tahun' ? (
                            <input type="text" value={editedValues[item.rowIndex] ?? data.tahun} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
                          ) : (
                            <span className="text-gray-600">{data.tahun || '-'}</span>
                          )}
                        </td>

                        {/* KETERANGAN */}
                        <td className="px-3 py-2">
                          {editingColumn?.type === activeTab && editingColumn?.field === 'keterangan' ? (
                            <input type="text" value={editedValues[item.rowIndex] ?? data.keterangan} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
                          ) : (
                            <span className="text-gray-500 text-xs">{data.keterangan || '-'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  // ==================== RENDER GI FORM ====================
  const renderGiForm = () => {
    const renderGiHeaderCell = (field: string, label: string) => {
      const isEditing = editingGiField === field;
      
      return (
        <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase min-w-[100px]">
          <div className="flex items-center justify-between gap-2">
            <span>{label}</span>
            {isEditing ? (
              <div className="flex gap-1">
                <button onClick={saveGiEditing} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
                <button onClick={cancelGiEditing} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
              </div>
            ) : (
              <button 
                onClick={() => startGiEditing(field)} 
                disabled={!!editingGiField}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-30"
              >
                Edit
              </button>
            )}
          </div>
        </th>
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold">✏️ DATA APD STD - {location.name}</h3>
          <div className="text-xs text-white/80">{giData.length} baris</div>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin text-4xl mb-4">🌀</div>
            <div className="text-gray-500">Memuat data...</div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-green-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 sticky left-0 bg-green-50 w-[200px]">Item/Peralatan</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 w-[200px]">APD</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 w-[80px]">Satuan</th>
                  {renderGiHeaderCell('baik', 'BAIK')}
                  {renderGiHeaderCell('rusak', 'RUSAK')}
                  {renderGiHeaderCell('merk', 'MERK')}
                  {renderGiHeaderCell('tahunPerolehan', 'TAHUN')}
                  {renderGiHeaderCell('keterangan', 'KET')}
                  <th className="px-3 py-2 text-center text-xs font-semibold text-green-800">FOTO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {giData.map((item) => {
                  if (item.isCategory) {
                    return (
                      <tr key={item.rowIndex} className="bg-green-100">
                        <td colSpan={9} className="px-3 py-2 font-bold text-green-900">
                          {item.itemPeralatan}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.rowIndex} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600 sticky left-0 bg-white">{item.itemPeralatan}</td>
                      <td className="px-3 py-2 text-gray-900">{item.apd}</td>
                      <td className="px-3 py-2 text-gray-600">{item.satuan}</td>
                      
                      {/* BAIK */}
                      <td className="px-3 py-2">
                        {editingGiField === 'baik' ? (
                          <input type="text" value={editedGiValues[item.rowIndex] ?? item.baik} onChange={(e) => setEditedGiValues({...editedGiValues, [item.rowIndex]: e.target.value})} className="w-20 border rounded px-2 py-1 text-xs" />
                        ) : (
                          <span className={`font-semibold ${item.baik ? 'text-green-700' : 'text-gray-300'}`}>{item.baik || '-'}</span>
                        )}
                      </td>

                      {/* RUSAK */}
                      <td className="px-3 py-2">
                        {editingGiField === 'rusak' ? (
                          <input type="text" value={editedGiValues[item.rowIndex] ?? item.rusak} onChange={(e) => setEditedGiValues({...editedGiValues, [item.rowIndex]: e.target.value})} className="w-20 border rounded px-2 py-1 text-xs" />
                        ) : (
                          <span className={`font-semibold ${item.rusak ? 'text-red-700' : 'text-gray-300'}`}>{item.rusak || '-'}</span>
                        )}
                      </td>

                      {/* MERK */}
                      <td className="px-3 py-2">
                        {editingGiField === 'merk' ? (
                          <input type="text" value={editedGiValues[item.rowIndex] ?? item.merk} onChange={(e) => setEditedGiValues({...editedGiValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
                        ) : (
                          <span className="text-gray-900">{item.merk || '-'}</span>
                        )}
                      </td>

                      {/* TAHUN */}
                      <td className="px-3 py-2">
                        {editingGiField === 'tahunPerolehan' ? (
                          <input type="text" value={editedGiValues[item.rowIndex] ?? item.tahunPerolehan} onChange={(e) => setEditedGiValues({...editedGiValues, [item.rowIndex]: e.target.value})} className="w-20 border rounded px-2 py-1 text-xs" />
                        ) : (
                          <span className="text-gray-600">{item.tahunPerolehan || '-'}</span>
                        )}
                      </td>

                      {/* KETERANGAN */}
                      <td className="px-3 py-2">
                        {editingGiField === 'keterangan' ? (
                          <input type="text" value={editedGiValues[item.rowIndex] ?? item.keterangan} onChange={(e) => setEditedGiValues({...editedGiValues, [item.rowIndex]: e.target.value})} className="w-full border rounded px-2 py-1 text-xs" />
                        ) : (
                          <span className="text-gray-600 text-xs">{item.keterangan || '-'}</span>
                        )}
                      </td>

                      {/* FOTO */}
                      <td className="px-3 py-2 text-center">
                        <PhotoUpload
                          locationId={locationId}
                          category="apd-std"
                          itemId={`row-${item.rowIndex}`}
                          rowIndex={item.rowIndex}
                          currentPhotoUrl={item.fotoKondisi}
                          compact={true}
                          onUploadSuccess={(d) => {
                            setGiData(prev => prev.map(row => 
                              row.rowIndex === item.rowIndex ? { ...row, fotoKondisi: d.thumbnailUrl } : row
                            ));
                          }}
                          onUploadError={() => {}}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-xl font-bold">
                🦺 {isKantor ? 'APD STD HAR - KANTOR' : 'APD STANDAR GI'}
              </h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isKantor && (
              <button
                onClick={() => setShowColorImages(!showColorImages)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showColorImages ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                🎨 Warna
              </button>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? '⟳' : '🔄'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[95%] mx-auto p-4 md:p-6">
        
        {/* Color Images for GI */}
        {!isKantor && showColorImages && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2">
                <h3 className="text-white font-bold text-sm">⛑️ WARNA HELM</h3>
              </div>
              <div className="p-2 flex justify-center bg-gray-50">
                <Image src="/helm.png" alt="Helm" width={200} height={100} className="rounded object-contain h-32 w-auto" priority />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-400 to-teal-500 px-4 py-2">
                <h3 className="text-white font-bold text-sm">🦺 WARNA ROMPI</h3>
              </div>
              <div className="p-2 flex justify-center bg-gray-50">
                <Image src="/rompi.png" alt="Rompi" width={200} height={100} className="rounded object-contain h-32 w-auto" priority />
              </div>
            </div>
          </div>
        )}

        {/* Date Update (for GI only) */}
        {!isKantor && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📅</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Update</label>
                <input
                  type="date"
                  value={globalTanggal}
                  onChange={(e) => setGlobalTanggal(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white"
                />
                {lastUpdateDate && (
                  <p className="text-xs text-gray-500 mt-1">Terakhir: {lastUpdateDate}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Render appropriate form */}
        {isKantor ? renderKantorForm() : renderGiForm()}
      </div>
    </div>
  );
}
