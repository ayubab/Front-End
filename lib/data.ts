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

// 9 Kategori APD
export const categories: Category[] = [
  { id: 'apar', name: 'APAR', icon: '🧯' },
  { id: 'apat', name: 'APAT', icon: '🔥' },
  { id: 'fire-alarm', name: 'FIRE ALARM', icon: '🚨' },
  { id: 'hydrant', name: 'HYDRANT', icon: '🚒' },
  { id: 'apd', name: 'APD', icon: '👷' },
  { id: 'apd-std-har', name: 'APD STD HAR', icon: '🛡️' },
  { id: 'alat-kerja', name: 'ALAT KERJA', icon: '🔧' },
  { id: 'cctv', name: 'CCTV', icon: '📹' },
  { id: 'limbah-b3', name: 'LIMBAH B3', icon: '⚠️' },
];

// APD Items per kategori
export const apdItems: APDItem[] = [
  // 1. APAR
  { id: 'apar-co2', categoryId: 'apar', name: 'APAR CO2' },
  { id: 'apar-powder', categoryId: 'apar', name: 'APAR POWDER' },
  { id: 'apar-foam', categoryId: 'apar', name: 'APAR FOAM' },

  // 2. APAT
  { id: 'selang-kebakaran', categoryId: 'apat', name: 'SELANG KEBAKARAN' },
  { id: 'nozel', categoryId: 'apat', name: 'NOZEL' },
  { id: 'kopling', categoryId: 'apat', name: 'KOPLING' },

  // 3. FIRE ALARM
  { id: 'detektor-asap', categoryId: 'fire-alarm', name: 'DETEKTOR ASAP' },
  { id: 'detektor-panas', categoryId: 'fire-alarm', name: 'DETEKTOR PANAS' },
  { id: 'panel-kontrol', categoryId: 'fire-alarm', name: 'PANEL KONTROL' },
  { id: 'bell-sounder', categoryId: 'fire-alarm', name: 'BELL/SOUNDER' },

  // 4. HYDRANT
  { id: 'hydrant-box', categoryId: 'hydrant', name: 'HYDRANT BOX' },
  { id: 'hydrant-valve', categoryId: 'hydrant', name: 'HYDRANT VALVE' },
  { id: 'hydrant-pillar', categoryId: 'hydrant', name: 'HYDRANT PILLAR' },

  // 5. APD
  { id: 'helm-safety', categoryId: 'apd', name: 'HELM SAFETY' },
  { id: 'kacamata-safety', categoryId: 'apd', name: 'KACAMATA SAFETY' },
  { id: 'sarung-tangan', categoryId: 'apd', name: 'SARUNG TANGAN' },
  { id: 'safety-shoes', categoryId: 'apd', name: 'SAFETY SHOES' },
  { id: 'rompi-safety', categoryId: 'apd', name: 'ROMPI SAFETY' },

  // 6. APD STD HAR
  { id: 'helm-har', categoryId: 'apd-std-har', name: 'HELM HAR' },
  { id: 'sarung-tangan-insulasi', categoryId: 'apd-std-har', name: 'SARUNG TANGAN INSULASI' },
  { id: 'sepatu-dielektrik', categoryId: 'apd-std-har', name: 'SEPATU DIELEKTRIK' },
  { id: 'body-harness', categoryId: 'apd-std-har', name: 'BODY HARNESS' },

  // 7. A1-AT KERJA
  { id: 'tangga-alumunium', categoryId: 'alat-kerja', name: 'TANGGA ALUMUNIUM' },
  { id: 'kunci-inggris', categoryId: 'alat-kerja', name: 'KUNCI INGGRIS' },
  { id: 'obeng-set', categoryId: 'alat-kerja', name: 'OBENG SET' },
  { id: 'multimeter', categoryId: 'alat-kerja', name: 'MULTIMETER' },

  // 8. CCTV
  { id: 'kamera-cctv', categoryId: 'cctv', name: 'KAMERA CCTV' },
  { id: 'dvr-nvr', categoryId: 'cctv', name: 'DVR/NVR' },
  { id: 'monitor-cctv', categoryId: 'cctv', name: 'MONITOR CCTV' },
  { id: 'kabel-cctv', categoryId: 'cctv', name: 'KABEL CCTV' },

  // 9. LIMBAH B3
  { id: 'drum-limbah', categoryId: 'limbah-b3', name: 'DRUM LIMBAH B3' },
  { id: 'container-limbah', categoryId: 'limbah-b3', name: 'CONTAINER LIMBAH B3' },
  { id: 'label-b3', categoryId: 'limbah-b3', name: 'LABEL B3' },
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
