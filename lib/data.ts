// Data Master untuk Aplikasi K3 APD

export interface Location {
  id: string;
  name: string;
  type: 'kantor' | 'gi' | 'gis';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface APDItem {
  id: string;
  categoryId: string;
  name: string;
  requiresFireFields?: boolean;
}

// 12 Lokasi GI/Kantor
export const locations: Location[] = [
  { id: 'ultg-yogyakarta', name: 'KANTOR ULTG YOGYAKARTA', type: 'kantor' },
  { id: 'gi-bantul', name: 'GI BANTUL', type: 'gi' },
  { id: 'gis-wirobrajan', name: 'GIS WIROBRAJAN', type: 'gis' },
  { id: 'gi-kentungan', name: 'GI KENTUNGAN', type: 'gi' },
  { id: 'gis-gejayan', name: 'GIS GEJAYAN', type: 'gis' },
  { id: 'gi-klaten', name: 'GI KLATEN', type: 'gi' },
  { id: 'gi-kalasan', name: 'GI KALASAN', type: 'gi' },
  { id: 'gi-semanu', name: 'GI SEMANU', type: 'gi' },
  { id: 'gi-godean', name: 'GI GODEAN', type: 'gi' },
  { id: 'gi-medari', name: 'GI MEDARI', type: 'gi' },
  { id: 'gi-wates', name: 'GI WATES', type: 'gi' },
  { id: 'gi-purworejo', name: 'GI PURWOREJO', type: 'gi' },
];

// 12 Kategori APD
export const categories: Category[] = [
  { id: 'kepala', name: 'ALAT PELINDUNG KEPALA', icon: '👷' },
  { id: 'mata-muka', name: 'ALAT PELINDUNG MATA DAN MUKA', icon: '👓' },
  { id: 'tangan', name: 'ALAT PELINDUNG TANGAN', icon: '🧤' },
  { id: 'telinga', name: 'ALAT PELINDUNG TELINGA', icon: '👂' },
  { id: 'kaki', name: 'ALAT PELINDUNG KAKI', icon: '👞' },
  { id: 'pakaian', name: 'PAKAIAN PELINDUNG', icon: '👔' },
  { id: 'rompi', name: 'ROMPI PENGAWAS', icon: '🦺' },
  { id: 'pernapasan', name: 'ALAT PELINDUNG PERNAPASAN', icon: '😷' },
  { id: 'jatuh', name: 'ALAT PELINDUNG JATUH', icon: '🪂' },
  { id: 'pelampung', name: 'PELAMPUNG', icon: '🛟' },
  { id: 'rambu', name: 'RAMBU-RAMBU', icon: '🚧' },
  { id: 'alat-kerja', name: 'ALAT KERJA', icon: '🔧' },
];

// APD Items per kategori
export const apdItems: APDItem[] = [
  // 1. ALAT PELINDUNG KEPALA
  { id: 'helm-biru', categoryId: 'kepala', name: 'HELM BIRU (HAR, OPERATOR)' },
  { id: 'helm-merah', categoryId: 'kepala', name: 'HELM MERAH (P.K3, P.M, P.P)' },
  { id: 'helm-kuning', categoryId: 'kepala', name: 'HELM KUNING (MITRA, MAGANG)' },
  { id: 'helm-putih', categoryId: 'kepala', name: 'HELM PUTIH (TAMU & MANAJEMEN)' },
  { id: 'helm-hijau', categoryId: 'kepala', name: 'HELM HIJAU (LING)' },

  // 2. ALAT PELINDUNG MATA DAN MUKA
  { id: 'kacamata', categoryId: 'mata-muka', name: 'KACAMATA PENGAMAN' },
  { id: 'googles', categoryId: 'mata-muka', name: 'GOOGLES' },
  { id: 'face-shield', categoryId: 'mata-muka', name: 'FACE SHIELD' },
  { id: 'welding-shield', categoryId: 'mata-muka', name: 'WELDING SHIELD' },

  // 3. ALAT PELINDUNG TANGAN
  { id: 'sarung-tangan-panas', categoryId: 'tangan', name: 'SARUNG TANGAN TAHAN PANAS/API BAHAN KULIT' },
  { id: 'sarung-tangan-mekanis', categoryId: 'tangan', name: 'SARUNG TANGAN TAHAN MEKANIS COATED GLOVES' },
  { id: 'sarung-tangan-kimia', categoryId: 'tangan', name: 'SARUNG TANGAN TAHAN KIMIA DAN CAIRAN BAHAN BUTYL' },
  { id: 'sarung-tangan-insulasi', categoryId: 'tangan', name: 'SARUNG TANGAN INSULASI' },
  { id: 'conductive-gloves', categoryId: 'tangan', name: 'CONDUCTIVE GLOVES' },

  // 4. ALAT PELINDUNG TELINGA
  { id: 'ear-plug', categoryId: 'telinga', name: 'SUMBAT TELINGA (EAR PLUG)' },
  { id: 'ear-muff', categoryId: 'telinga', name: 'PENUTUP TELINGA (EAR MUFF)' },

  // 5. ALAT PELINDUNG KAKI
  { id: 'safety-shoes', categoryId: 'kaki', name: 'SAFETY SHOES' },
  { id: 'sepatu-tegangan', categoryId: 'kaki', name: 'SEPATU TAHAN TEGANGAN' },
  { id: 'conductive-shoes', categoryId: 'kaki', name: 'CONDUCTIVE SHOES' },
  { id: 'conductive-socks', categoryId: 'kaki', name: 'CONDUCTIVE SOCKS' },
  { id: 'sepatu-air', categoryId: 'kaki', name: 'SEPATU TAHAN AIR' },

  // 6. PAKAIAN PELINDUNG
  { id: 'wearpack-terpisah', categoryId: 'pakaian', name: 'WEARPACK TERPISAH' },
  { id: 'wearpack-terusan', categoryId: 'pakaian', name: 'WEARPACK TERUSAN' },
  { id: 'wearpack-lab', categoryId: 'pakaian', name: 'WEARPACK LABORATORIUM' },
  { id: 'hazmat', categoryId: 'pakaian', name: 'PAKAIAN PELINDUNG B3 (HAZMAT)' },
  { id: 'jas-hujan', categoryId: 'pakaian', name: 'JAS HUJAN' },

  // 7. ROMPI PENGAWAS
  { id: 'rompi-pp', categoryId: 'rompi', name: 'ROMPI PP (HIJAU)' },
  { id: 'rompi-pk3', categoryId: 'rompi', name: 'ROMPI PK3 (MERAH)' },
  { id: 'rompi-pm', categoryId: 'rompi', name: 'ROMPI PM (KUNING)' },
  { id: 'rompi-tamu', categoryId: 'rompi', name: 'ROMPI TAMU (BIRU)' },

  // 8. ALAT PELINDUNG PERNAPASAN
  { id: 'particulate-respirator', categoryId: 'pernapasan', name: 'PARTICULATE RESPIRATOR (SINGLE USE FILTER)' },
  { id: 'half-facepiece', categoryId: 'pernapasan', name: 'NON-POWERED HALF FACEPIECE RESPIRATOR (WITH REPLACABLE FILTER)' },
  { id: 'full-facepiece', categoryId: 'pernapasan', name: 'NON-POWERED FULL FACEPIECE RESPIRATOR (WITH REPLACABLE FILTER)' },
  { id: 'scba', categoryId: 'pernapasan', name: 'SELF CONTAINED BREATHING APPARATUS (SCBA) - RESCUE UNIT' },
  { id: 'escape-breathing', categoryId: 'pernapasan', name: 'EMERGENCY ESCAPE BREATHING APPARATUS' },
  { id: 'gas-detector', categoryId: 'pernapasan', name: 'ALAT UKUR GAS BERACUN' },

  // 9. ALAT PELINDUNG JATUH
  { id: 'anchor', categoryId: 'jatuh', name: 'ANCHOR / ANGKUR' },
  { id: 'body-harness', categoryId: 'jatuh', name: 'BODY SUPPORT / FULL BODY HARNESS' },
  { id: 'lanyard', categoryId: 'jatuh', name: 'CONNECTOR / LANYARD' },
  { id: 'tandu', categoryId: 'jatuh', name: 'TANDU' },

  // 10. PELAMPUNG
  { id: 'life-jacket', categoryId: 'pelampung', name: 'JAKET KESELAMATAN (LIFE JACKET)' },
  { id: 'life-vest', categoryId: 'pelampung', name: 'ROMPI KESELAMATAN (LIFE VEST)' },
  { id: 'throwable-float', categoryId: 'pelampung', name: 'ALAT PELAMPUNG YANG DAPAT DILEMPAR (THROWABLE FLOTATION DEVICES)' },
  { id: 'special-float', categoryId: 'pelampung', name: 'ALAT PELAMPUNG KHUSUS' },

  // 11. RAMBU-RAMBU (with fire fields)
  { id: 'p3k-kit', categoryId: 'rambu', name: 'BACKMED (KIT) P3K DAN ISINYA' },
  { id: 'safety-line', categoryId: 'rambu', name: 'SAFETY LINE MERAH' },
  { id: 'bendera', categoryId: 'rambu', name: 'BENDERA SEGI EMPAT (MERAH & HIJAU)' },
  { id: 'lampu-emergency', categoryId: 'rambu', name: 'LAMPU EMERGENCY/LAMPU SOROT' },
  { id: 'lemari-k3', categoryId: 'rambu', name: 'LEMARI K3' },
  { id: 'sop-kebakaran', categoryId: 'rambu', name: 'SOP KEBAKARAN' },
  { id: 'sop-keamanan', categoryId: 'rambu', name: 'SOP KEAMANAN' },
  { id: 'denah-apar', categoryId: 'rambu', name: 'DENAH PENEMPATAN APAR', requiresFireFields: true },
  { id: 'denah-evakuasi', categoryId: 'rambu', name: 'DENAH EVAKUASI' },
  { id: 'termometer', categoryId: 'rambu', name: 'TERMOMETER SUHU BADAN' },
  { id: 'tensi-meter', categoryId: 'rambu', name: 'TENSI METER' },
  { id: 'senter-kepala', categoryId: 'rambu', name: 'SENTER KEPALA' },
  { id: 'rambu-taging', categoryId: 'rambu', name: 'RAMBU-RAMBU (TAGING)' },

  // 12. ALAT KERJA
  { id: 'stick-ground-70-150', categoryId: 'alat-kerja', name: 'Stick Ground 70/150 kV (termasuk kabel tembaga untuk grounding-3 kabel)' },
  { id: 'stick-ground-275-500', categoryId: 'alat-kerja', name: 'Stick Ground 275/500 kV (termasuk kabel tembaga untuk grounding-3 kabel)' },
  { id: 'stick-ground-20', categoryId: 'alat-kerja', name: 'Stick Ground 20 kV (termasuk kabel tembaga untuk grounding-3 kabel)' },
  { id: 'voltage-detector-20', categoryId: 'alat-kerja', name: 'Voltage Detector 20 kV with Insulating Stick' },
  { id: 'voltage-detector-70-150', categoryId: 'alat-kerja', name: 'Voltage Detector 70/150 kV with Insulating Stick' },
  { id: 'voltage-detector-275-500', categoryId: 'alat-kerja', name: 'Voltage Detector 275-500 kV with Insulating Stick' },
];

// Helper functions
export function getLocationById(id: string) {
  return locations.find(loc => loc.id === id);
}

export function getCategoryById(id: string) {
  return categories.find(cat => cat.id === id);
}

export function getItemsByCategoryId(categoryId: string) {
  return apdItems.filter(item => item.categoryId === categoryId);
}

export function getItemById(id: string) {
  return apdItems.find(item => item.id === id);
}
