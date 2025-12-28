'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';
import PhotoUpload from '@/app/components/PhotoUpload';
import Image from 'next/image';

interface APDSubData {
  baik: string;
  rusak: string;
  merk: string;
  tahun: string;
  keterangan: string;
}

interface APDStdItem {
  rowIndex: number;
  itemPeralatan: string;
  apd: string;
  satuan: string;
  locationInfo: string;
  isCategory: boolean;
  gi: APDSubData;
  jar: APDSubData;
  pro: APDSubData;
  fotoKondisi?: string;
}

// Fixed rows example data (for Left Table Reference)
// This matches existing data structure but we can keep it as is or simplified
// since the main data comes from API now.
// We'll keep a simplified version or just rely on the API data for the main view.
// The "Show Example" feature used static data. I'll preserve it as it helps users.
const EXAMPLE_DATA = [
  { itemPeralatan: 'ALAT PELINDUNG KEPALA', apd: '', satuan: '', gi: '' },
  { itemPeralatan: '', apd: 'Helm Biru (HAR, Operator)', satuan: 'Buah', gi: '-' },
  { itemPeralatan: '', apd: 'Helm Merah (P.K3, P.M, P.P)', satuan: 'Buah', gi: '-' },
  { itemPeralatan: '', apd: 'Helm Kuning (Mitra, Magang)', satuan: 'Buah', gi: '-' },
  { itemPeralatan: '', apd: 'Helm Putih (Tamu & Manajemen)', satuan: 'Buah', gi: '-' },
  { itemPeralatan: '', apd: 'Helm Hijau (LING)', satuan: 'Buah', gi: '-' },
  // ... (Full list would be long, but sticking to existing pattern is fine for "Example")
];

type HarType = 'gi' | 'jar' | 'pro';
type FieldType = 'baik' | 'rusak' | 'merk' | 'tahun' | 'keterangan';

export default function APDStdPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [apdData, setApdData] = useState<APDStdItem[]>([]);
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [activeTab, setActiveTab] = useState<HarType>('gi');
  
  // Editing state
  // tracks which column (type + field) is being edited
  const [editingColumn, setEditingColumn] = useState<{type: HarType, field: FieldType} | null>(null);
  const [editedValues, setEditedValues] = useState<{[rowIndex: number]: string}>({});

  const [globalTanggal, setGlobalTanggal] = useState<string>('');
  const [showExampleTable, setShowExampleTable] = useState(false); // Default hide to save space
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

  const startEditing = (type: HarType, field: FieldType) => {
    const initialValues: {[key: number]: string} = {};
    apdData.forEach(item => {
      if (!item.isCategory) {
        // Access nested data: item[type][field]
        initialValues[item.rowIndex] = (item[type] as any)[field];
      }
    });
    setEditedValues(initialValues);
    setEditingColumn({ type, field });
  };

  const cancelEditing = () => {
    setEditingColumn(null);
    setEditedValues({});
  };

  const saveEditing = async () => {
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
        fetchAPDStdData();
        alert('Data berhasil diperbarui');
      } else {
        alert('Gagal memperbarui data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
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

  const renderHeaderCell = (field: FieldType, label: string) => {
    const isEditing = editingColumn?.type === activeTab && editingColumn?.field === field;
    
    return (
      <th className="px-3 py-2 text-left text-xs font-semibold text-green-800 uppercase min-w-[120px]">
        <div className="flex items-center justify-between gap-2">
          <span>{label}</span>
          {isEditing ? (
            <div className="flex gap-1">
              <button onClick={saveEditing} disabled={updating} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">✓</button>
              <button onClick={cancelEditing} disabled={updating} className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50">✕</button>
            </div>
          ) : (
            <button 
              onClick={() => startEditing(activeTab, field)} 
              disabled={!!editingColumn && (editingColumn.type !== activeTab || editingColumn.field !== field)}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-30"
            >
              Edit
            </button>
          )}
        </div>
      </th>
    );
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
              🎨 Warna
            </button>
            <button
              onClick={() => setShowExampleTable(!showExampleTable)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                showExampleTable ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              📋 Contoh
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
      <div className="max-w-[95%] mx-auto p-4 md:p-6">
        
        {/* Colors & Date Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
           {showColorImages && (
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
           
           <div className={showColorImages ? "lg:col-span-1" : "lg:col-span-3"}>
             <div className="bg-white rounded-xl shadow-lg p-5 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📅</span>
                  <div>
                    <h3 className="font-bold text-gray-800">Tanggal Update</h3>
                    <p className="text-xs text-gray-500">Nilai ini disimpan ke sel K5</p>
                  </div>
                </div>
                <input
                  type="date"
                  value={globalTanggal}
                  onChange={(e) => setGlobalTanggal(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-gray-50"
                />
                {lastUpdateDate && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                    Terakhir: <span className="font-semibold">{lastUpdateDate}</span>
                  </div>
                )}
             </div>
           </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['gi', 'jar', 'pro'] as HarType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                if (!editingColumn) setActiveTab(type);
                else alert('Selesaikan edit data terlebih dahulu');
              }}
              className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all shadow-sm ${
                activeTab === type 
                  ? 'bg-white text-cyan-700 border-t-4 border-cyan-500 translate-y-1' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-cyan-600'
              }`}
            >
              {getTabLabel(type)}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl rounded-tl-none shadow-xl overflow-hidden border border-gray-100">
           {/* Table Header Decoration */}
           <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-3 flex justify-between items-center">
             <div>
               <h3 className="text-white font-bold flex items-center gap-2">
                 ✏️ INPUT DATA: <span className="text-cyan-100 bg-white/20 px-2 py-0.5 rounded">{getTabLabel(activeTab)}</span>
               </h3>
             </div>
             <div className="text-xs text-white/80">
               {apdData.length} baris data
             </div>
           </div>

           {loading ? (
             <div className="p-20 text-center">
               <div className="animate-spin text-4xl mb-4">🌀</div>
               <div className="text-gray-500 font-medium">Memuat data spreadsheet...</div>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-sm border-collapse">
                 <thead className="bg-gray-50 text-gray-700">
                   <tr>
                     <th className="px-4 py-3 text-left border-b border-gray-200 sticky left-0 bg-gray-50 z-10 w-[250px]">Item / Peralatan</th>
                     <th className="px-3 py-3 text-left border-b border-gray-200 w-[150px]">APD</th>
                     <th className="px-3 py-3 text-left border-b border-gray-200 w-[100px]">Satuan</th>
                     <th className="px-3 py-3 text-left border-b border-gray-200 w-[100px]">GIS/GI</th>
                     
                     {/* Dynamic Columns based on Tab */}
                     {renderHeaderCell('baik', 'BAIK (Jml)')}
                     {renderHeaderCell('rusak', 'RUSAK/EXP')}
                     {renderHeaderCell('merk', 'MERK/TYPE')}
                     {renderHeaderCell('tahun', 'THN OLEH')}
                     {renderHeaderCell('keterangan', 'KETERANGAN')}
                     
                     <th className="px-3 py-3 text-center border-b border-gray-200 w-[100px]">FOTO</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {apdData.map((item) => {
                     if (item.isCategory) {
                       return (
                         <tr key={item.rowIndex} className="bg-cyan-50/50">
                           <td colSpan={10} className="px-4 py-3 font-bold text-cyan-800 border-l-4 border-cyan-500">
                             {item.itemPeralatan}
                           </td>
                         </tr>
                       );
                     }

                     const data = item[activeTab]; // Access nested data dynamically

                     return (
                       <tr key={item.rowIndex} className="hover:bg-blue-50/30 transition-colors group">
                         <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-white group-hover:bg-blue-50/30 border-r border-gray-100">
                            {item.itemPeralatan}
                         </td>
                         <td className="px-3 py-2 text-gray-600">{item.apd}</td>
                         <td className="px-3 py-2 text-gray-500">{item.satuan}</td>
                         <td className="px-3 py-2 text-gray-500">{item.locationInfo}</td>
                         
                         {/* Dynamic Cells */}
                         <td className="px-3 py-2">
                           {editingColumn?.type === activeTab && editingColumn?.field === 'baik' ? (
                             <input type="text" value={editedValues[item.rowIndex] ?? data.baik} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full bg-white border border-cyan-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />
                           ) : (
                             <span className={`font-semibold ${data.baik ? 'text-green-600' : 'text-gray-300'}`}>{data.baik || '-'}</span>
                           )}
                         </td>
                         
                         <td className="px-3 py-2">
                           {editingColumn?.type === activeTab && editingColumn?.field === 'rusak' ? (
                             <input type="text" value={editedValues[item.rowIndex] ?? data.rusak} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full bg-white border border-cyan-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />
                           ) : (
                             <span className={`font-semibold ${data.rusak ? 'text-red-600' : 'text-gray-300'}`}>{data.rusak || '-'}</span>
                           )}
                         </td>

                         <td className="px-3 py-2">
                            {editingColumn?.type === activeTab && editingColumn?.field === 'merk' ? (
                              <input type="text" value={editedValues[item.rowIndex] ?? data.merk} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full bg-white border border-cyan-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />
                            ) : (
                              <span className="text-gray-700">{data.merk}</span>
                            )}
                         </td>

                         <td className="px-3 py-2">
                            {editingColumn?.type === activeTab && editingColumn?.field === 'tahun' ? (
                              <input type="text" value={editedValues[item.rowIndex] ?? data.tahun} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full bg-white border border-cyan-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />
                            ) : (
                              <span className="text-gray-600">{data.tahun}</span>
                            )}
                         </td>

                         <td className="px-3 py-2">
                            {editingColumn?.type === activeTab && editingColumn?.field === 'keterangan' ? (
                              <input type="text" value={editedValues[item.rowIndex] ?? data.keterangan} onChange={(e) => setEditedValues({...editedValues, [item.rowIndex]: e.target.value})} className="w-full bg-white border border-cyan-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />
                            ) : (
                              <span className="text-gray-500 italic text-xs">{data.keterangan}</span>
                            )}
                         </td>

                         <td className="px-3 py-2 text-center">
                            <PhotoUpload
                              locationId={locationId}
                              category="apd-std"
                              itemId={`row-${item.rowIndex}`}
                              rowIndex={item.rowIndex}
                              currentPhotoUrl={item.fotoKondisi}
                              compact={true}
                              onUploadSuccess={(d) => {
                                setApdData(prev => prev.map(row => 
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
      </div>
    </div>
  );
}
