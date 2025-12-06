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

export interface User {
  email: string;
  password: string;
  role: 'input' | 'rekap' | 'admin';
  office: string;
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

// Users untuk login
export const users: User[] = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@ultg.co.id',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: (process.env.ADMIN_ROLE as 'admin' | 'input' | 'rekap') || 'admin',
    office: process.env.ADMIN_OFFICE || 'ultg-yogyakarta'
  },
  // Additional users for each location
  ...(process.env.USER_BANTUL_EMAIL ? [{
    email: process.env.USER_BANTUL_EMAIL,
    password: process.env.USER_BANTUL_PASSWORD || 'bantul123',
    role: (process.env.USER_BANTUL_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-bantul'
  }] : []),
  ...(process.env.USER_WIROBRAJAN_EMAIL ? [{
    email: process.env.USER_WIROBRAJAN_EMAIL,
    password: process.env.USER_WIROBRAJAN_PASSWORD || 'wirobrajan123',
    role: (process.env.USER_WIROBRAJAN_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gis-wirobrajan'
  }] : []),
  ...(process.env.USER_KENTUNGAN_EMAIL ? [{
    email: process.env.USER_KENTUNGAN_EMAIL,
    password: process.env.USER_KENTUNGAN_PASSWORD || 'kentungan123',
    role: (process.env.USER_KENTUNGAN_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-kentungan'
  }] : []),
  ...(process.env.USER_GEJAYAN_EMAIL ? [{
    email: process.env.USER_GEJAYAN_EMAIL,
    password: process.env.USER_GEJAYAN_PASSWORD || 'gejayan123',
    role: (process.env.USER_GEJAYAN_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gis-gejayan'
  }] : []),
  ...(process.env.USER_KLATEN_EMAIL ? [{
    email: process.env.USER_KLATEN_EMAIL,
    password: process.env.USER_KLATEN_PASSWORD || 'klaten123',
    role: (process.env.USER_KLATEN_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-klaten'
  }] : []),
  ...(process.env.USER_KALASAN_EMAIL ? [{
    email: process.env.USER_KALASAN_EMAIL,
    password: process.env.USER_KALASAN_PASSWORD || 'kalasan123',
    role: (process.env.USER_KALASAN_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-kalasan'
  }] : []),
  ...(process.env.USER_SEMANU_EMAIL ? [{
    email: process.env.USER_SEMANU_EMAIL,
    password: process.env.USER_SEMANU_PASSWORD || 'semanu123',
    role: (process.env.USER_SEMANU_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-semanu'
  }] : []),
  ...(process.env.USER_GODEAN_EMAIL ? [{
    email: process.env.USER_GODEAN_EMAIL,
    password: process.env.USER_GODEAN_PASSWORD || 'godean123',
    role: (process.env.USER_GODEAN_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-godean'
  }] : []),
  ...(process.env.USER_MEDARI_EMAIL ? [{
    email: process.env.USER_MEDARI_EMAIL,
    password: process.env.USER_MEDARI_PASSWORD || 'medari123',
    role: (process.env.USER_MEDARI_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-medari'
  }] : []),
  ...(process.env.USER_WATES_EMAIL ? [{
    email: process.env.USER_WATES_EMAIL,
    password: process.env.USER_WATES_PASSWORD || 'wates123',
    role: (process.env.USER_WATES_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-wates'
  }] : []),
  ...(process.env.USER_PURWOREJO_EMAIL ? [{
    email: process.env.USER_PURWOREJO_EMAIL,
    password: process.env.USER_PURWOREJO_PASSWORD || 'purworejo123',
    role: (process.env.USER_PURWOREJO_ROLE as 'admin' | 'input' | 'rekap') || 'input',
    office: 'gi-purworejo'
  }] : []),
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
  {id: 'denah', name: 'Denah', icon: '🗺️' },
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

export function getUserByCredentials(email: string, password: string) {
  return users.find(user => user.email === email && user.password === password);
}
