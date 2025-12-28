'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocationById } from '@/lib/data';

interface StdHarItem {
  rowIndex: number;
  id: string;
  kantor: string;
  jenisPeralatan: string;
  nomorSeri: string;
  merk: string;
  jenis: string;
  tanggalKalibrasi: string;
  tegangan: string;
  lokasi: string;
  tanggalInspeksi: string;
  kondisi: string;
  keterangan: string;
  foto: string;
}

export default function StdHarPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.locationId as string;
  const location = getLocationById(locationId);

  const [data, setData] = useState<StdHarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationId) {
      fetchData();
    }
  }, [locationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/std-har?locationId=${locationId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.push(`/lokasi/${locationId}/alat`);

  if (!location) return <div>Lokasi tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-500">
      <div className="bg-cyan-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-2xl hover:bg-white/20 p-2 rounded">←</button>
            <div>
              <h1 className="text-xl font-bold">📋 STD HAR</h1>
              <p className="text-sm text-cyan-100">{location.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 border">ID</th>
                    <th className="px-3 py-2 border">KANTOR/GI</th>
                    <th className="px-3 py-2 border">JENIS PERALATAN</th>
                    <th className="px-3 py-2 border">NO SERI</th>
                    <th className="px-3 py-2 border">MERK</th>
                    <th className="px-3 py-2 border">JENIS</th>
                    <th className="px-3 py-2 border">TGL KALIBRASI</th>
                    <th className="px-3 py-2 border">TEGANGAN</th>
                    <th className="px-3 py-2 border">LOKASI</th>
                    <th className="px-3 py-2 border">TGL INSPEKSI</th>
                    <th className="px-3 py-2 border">KONDISI</th>
                    <th className="px-3 py-2 border">KET</th>
                    <th className="px-3 py-2 border">FOTO</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.rowIndex} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border">{item.id}</td>
                      <td className="px-3 py-2 border">{item.kantor}</td>
                      <td className="px-3 py-2 border">{item.jenisPeralatan}</td>
                      <td className="px-3 py-2 border">{item.nomorSeri}</td>
                      <td className="px-3 py-2 border">{item.merk}</td>
                      <td className="px-3 py-2 border">{item.jenis}</td>
                      <td className="px-3 py-2 border">{item.tanggalKalibrasi}</td>
                      <td className="px-3 py-2 border">{item.tegangan}</td>
                      <td className="px-3 py-2 border">{item.lokasi}</td>
                      <td className="px-3 py-2 border">{item.tanggalInspeksi}</td>
                      <td className="px-3 py-2 border">{item.kondisi}</td>
                      <td className="px-3 py-2 border">{item.keterangan}</td>
                      <td className="px-3 py-2 border">{item.foto}</td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                     <tr><td colSpan={13} className="p-4 text-center text-gray-500">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
