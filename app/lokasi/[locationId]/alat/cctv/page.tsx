'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DVRData {
  no: string;
  lokasi: string;
  garduInduk: string;
  brand: string;
  type: string;
  ipSn: string;
  username: string;
  password: string;
  keterangan: string;
}

interface CameraData {
  no: string;
  idKamera: string;
  lokasiKamera: string;
  brand: string;
  type: string;
  ip: string;
  username: string;
  password: string;
  statusNormal: string;
  statusAnomali: string;
  keterangan: string;
}

interface MonitorData {
  no: string;
  merkTipe: string;
  penempatan: string;
  kondisi: string;
  keterangan: string;
}

export default function CCTVPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.locationId as string;

  const [dvrData, setDvrData] = useState<DVRData[]>([]);
  const [cameraData, setCameraData] = useState<CameraData[]>([]);
  const [monitorData, setMonitorData] = useState<MonitorData[]>([]);
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [globalTanggal, setGlobalTanggal] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // DVR editing states
  const [editingDvrColumn, setEditingDvrColumn] = useState<string | null>(null);
  const [editedDvrData, setEditedDvrData] = useState<Record<string, string>>({});

  // Camera editing states
  const [editingCameraColumn, setEditingCameraColumn] = useState<string | null>(null);
  const [editedCameraData, setEditedCameraData] = useState<Record<string, string>>({});

  // Monitor editing states
  const [editingMonitorColumn, setEditingMonitorColumn] = useState<string | null>(null);
  const [editedMonitorData, setEditedMonitorData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCCTVData();
    const today = new Date().toISOString().split('T')[0];
    setGlobalTanggal(today);
  }, [locationId]);

  const fetchCCTVData = async () => {
    try {
      const response = await fetch(`/api/cctv?locationId=${locationId}`);
      const result = await response.json();
      
      if (result.success) {
        setDvrData(result.dvrData || []);
        setCameraData(result.cameraData || []);
        setMonitorData(result.monitorData || []);
        if (result.lastUpdateDate) {
          setLastUpdateDate(result.lastUpdateDate);
          setGlobalTanggal(result.lastUpdateDate);
        }
      }
    } catch (error) {
      console.error('Error fetching CCTV data:', error);
      alert('Failed to load CCTV data');
    } finally {
      setLoading(false);
    }
  };

  // DVR Column Handlers
  const handleEditDvrColumn = (column: string) => {
    setEditingDvrColumn(column);
    const initialData: Record<string, string> = {};
    dvrData.forEach((item) => {
      initialData[item.no] = item[column as keyof DVRData] as string;
    });
    setEditedDvrData(initialData);
  };

  const handleSaveDvrColumn = async (column: string) => {
    try {
      const updates = dvrData.map((item) => ({
        no: item.no,
        value: editedDvrData[item.no] || item[column as keyof DVRData],
      }));

      const response = await fetch('/api/cctv/dvr/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          column,
          updates,
          tanggalUpdate: globalTanggal,
        }),
      });

      if (response.ok) {
        await fetchCCTVData();
        setEditingDvrColumn(null);
        setEditedDvrData({});
      }
    } catch (error) {
      console.error('Error saving DVR column:', error);
      alert('Failed to save changes');
    }
  };

  const handleCancelDvrEdit = () => {
    setEditingDvrColumn(null);
    setEditedDvrData({});
  };

  // Camera Column Handlers
  const handleEditCameraColumn = (column: string) => {
    setEditingCameraColumn(column);
    const initialData: Record<string, string> = {};
    cameraData.forEach((item) => {
      initialData[item.no] = item[column as keyof CameraData] as string;
    });
    setEditedCameraData(initialData);
  };

  const handleSaveCameraColumn = async (column: string) => {
    try {
      const updates = cameraData.map((item) => ({
        no: item.no,
        value: editedCameraData[item.no] || item[column as keyof CameraData],
      }));

      const response = await fetch('/api/cctv/camera/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          column,
          updates,
          tanggalUpdate: globalTanggal,
        }),
      });

      if (response.ok) {
        await fetchCCTVData();
        setEditingCameraColumn(null);
        setEditedCameraData({});
      }
    } catch (error) {
      console.error('Error saving camera column:', error);
      alert('Failed to save changes');
    }
  };

  const handleCancelCameraEdit = () => {
    setEditingCameraColumn(null);
    setEditedCameraData({});
  };

  // Monitor Column Handlers
  const handleEditMonitorColumn = (column: string) => {
    setEditingMonitorColumn(column);
    const initialData: Record<string, string> = {};
    monitorData.forEach((item) => {
      initialData[item.no] = item[column as keyof MonitorData] as string;
    });
    setEditedMonitorData(initialData);
  };

  const handleSaveMonitorColumn = async (column: string) => {
    try {
      const updates = monitorData.map((item) => ({
        no: item.no,
        value: editedMonitorData[item.no] || item[column as keyof MonitorData],
      }));

      const response = await fetch('/api/cctv/monitor/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          column,
          updates,
          tanggalUpdate: globalTanggal,
        }),
      });

      if (response.ok) {
        await fetchCCTVData();
        setEditingMonitorColumn(null);
        setEditedMonitorData({});
      }
    } catch (error) {
      console.error('Error saving monitor column:', error);
      alert('Failed to save changes');
    }
  };

  const handleCancelMonitorEdit = () => {
    setEditingMonitorColumn(null);
    setEditedMonitorData({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push(`/lokasi/${locationId}/alat`)}
          className="mb-6 px-4 py-2 bg-white text-cyan-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">CCTV Management</h1>

        {/* Tanggal Update */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white text-2xl">
              📅
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Update (ditulis ke sel K3)
              </label>
              <input
                type="date"
                value={globalTanggal}
                onChange={(e) => setGlobalTanggal(e.target.value)}
                className="w-full max-w-xs border border-cyan-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nilai ini dikirim ke sel K3 setiap kali menyimpan perubahan DVR/Kamera/Monitor.
              </p>
              {lastUpdateDate && (
                <p className="text-xs text-gray-600 mt-1">
                  Terakhir tercatat di sheet: {lastUpdateDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* DVR/NVR/XVR Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-cyan-600 mb-4">DATA DVR/NVR/XVR</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border border-gray-300 px-4 py-2 sticky left-0 bg-cyan-100 z-10">No</th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Lokasi</span>
                      {editingDvrColumn === 'lokasi' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('lokasi')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('lokasi')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Gardu Induk</span>
                      {editingDvrColumn === 'garduInduk' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('garduInduk')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('garduInduk')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Brand</span>
                      {editingDvrColumn === 'brand' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('brand')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('brand')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Type</span>
                      {editingDvrColumn === 'type' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('type')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('type')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>IP & S/N</span>
                      {editingDvrColumn === 'ipSn' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('ipSn')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('ipSn')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Username</span>
                      {editingDvrColumn === 'username' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('username')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('username')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Password</span>
                      {editingDvrColumn === 'password' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('password')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('password')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Keterangan</span>
                      {editingDvrColumn === 'keterangan' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveDvrColumn('keterangan')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelDvrEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditDvrColumn('keterangan')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dvrData.map((item) => (
                  <tr key={item.no} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white">{item.no}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'lokasi' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.lokasi}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.lokasi
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'garduInduk' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.garduInduk}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.garduInduk
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'brand' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.brand}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.brand
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'type' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.type}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.type
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'ipSn' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.ipSn}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.ipSn
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'username' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.username}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.username
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'password' ? (
                        <input
                          type="text"
                          value={editedDvrData[item.no] ?? item.password}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.password
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingDvrColumn === 'keterangan' ? (
                        <textarea
                          value={editedDvrData[item.no] ?? item.keterangan}
                          onChange={(e) => setEditedDvrData({ ...editedDvrData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                          rows={2}
                        />
                      ) : (
                        item.keterangan
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-cyan-600 mb-4">DATA KAMERA</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border border-gray-300 px-4 py-2 sticky left-0 bg-cyan-100 z-10">No</th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>ID Kamera</span>
                      {editingCameraColumn === 'idKamera' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('idKamera')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('idKamera')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Lokasi Kamera</span>
                      {editingCameraColumn === 'lokasiKamera' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('lokasiKamera')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('lokasiKamera')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Brand</span>
                      {editingCameraColumn === 'brand' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('brand')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('brand')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Type</span>
                      {editingCameraColumn === 'type' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('type')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('type')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>IP</span>
                      {editingCameraColumn === 'ip' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('ip')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('ip')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Username</span>
                      {editingCameraColumn === 'username' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('username')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('username')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Password</span>
                      {editingCameraColumn === 'password' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('password')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('password')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Status Normal</span>
                      {editingCameraColumn === 'statusNormal' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('statusNormal')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('statusNormal')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Status Anomali</span>
                      {editingCameraColumn === 'statusAnomali' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('statusAnomali')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('statusAnomali')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Keterangan</span>
                      {editingCameraColumn === 'keterangan' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveCameraColumn('keterangan')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelCameraEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditCameraColumn('keterangan')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cameraData.map((item) => (
                  <tr key={item.no} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white">{item.no}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'idKamera' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.idKamera}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.idKamera
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'lokasiKamera' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.lokasiKamera}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.lokasiKamera
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'brand' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.brand}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.brand
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'type' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.type}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.type
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'ip' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.ip}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.ip
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'username' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.username}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.username
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'password' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.password}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.password
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'statusNormal' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.statusNormal}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        <span className={item.statusNormal?.toUpperCase() === 'NORMAL' ? 'text-green-600 font-semibold' : ''}>
                          {item.statusNormal}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'statusAnomali' ? (
                        <input
                          type="text"
                          value={editedCameraData[item.no] ?? item.statusAnomali}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        <span className={item.statusAnomali ? 'text-red-600 font-semibold' : ''}>
                          {item.statusAnomali}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingCameraColumn === 'keterangan' ? (
                        <textarea
                          value={editedCameraData[item.no] ?? item.keterangan}
                          onChange={(e) => setEditedCameraData({ ...editedCameraData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                          rows={2}
                        />
                      ) : (
                        item.keterangan
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monitor Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-600 mb-4">DATA MONITOR</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border border-gray-300 px-4 py-2 sticky left-0 bg-cyan-100 z-10">No</th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Merk/Tipe/Model</span>
                      {editingMonitorColumn === 'merkTipe' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveMonitorColumn('merkTipe')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelMonitorEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditMonitorColumn('merkTipe')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Penempatan</span>
                      {editingMonitorColumn === 'penempatan' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveMonitorColumn('penempatan')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelMonitorEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditMonitorColumn('penempatan')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Kondisi</span>
                      {editingMonitorColumn === 'kondisi' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveMonitorColumn('kondisi')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelMonitorEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditMonitorColumn('kondisi')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span>Keterangan</span>
                      {editingMonitorColumn === 'keterangan' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveMonitorColumn('keterangan')} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                          <button onClick={handleCancelMonitorEdit} className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditMonitorColumn('keterangan')} className="text-cyan-600 hover:text-cyan-800 text-xs">Edit</button>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {monitorData.map((item) => (
                  <tr key={item.no} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white">{item.no}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingMonitorColumn === 'merkTipe' ? (
                        <input
                          type="text"
                          value={editedMonitorData[item.no] ?? item.merkTipe}
                          onChange={(e) => setEditedMonitorData({ ...editedMonitorData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.merkTipe
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingMonitorColumn === 'penempatan' ? (
                        <input
                          type="text"
                          value={editedMonitorData[item.no] ?? item.penempatan}
                          onChange={(e) => setEditedMonitorData({ ...editedMonitorData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        item.penempatan
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingMonitorColumn === 'kondisi' ? (
                        <input
                          type="text"
                          value={editedMonitorData[item.no] ?? item.kondisi}
                          onChange={(e) => setEditedMonitorData({ ...editedMonitorData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        <span className={item.kondisi?.toUpperCase() === 'NORMAL' ? 'text-green-600 font-semibold' : item.kondisi?.toUpperCase() === 'RUSAK' ? 'text-red-600 font-semibold' : ''}>
                          {item.kondisi}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingMonitorColumn === 'keterangan' ? (
                        <textarea
                          value={editedMonitorData[item.no] ?? item.keterangan}
                          onChange={(e) => setEditedMonitorData({ ...editedMonitorData, [item.no]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-gray-900"
                          rows={2}
                        />
                      ) : (
                        item.keterangan
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
