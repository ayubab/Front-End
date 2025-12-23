export const LOCATION_SHEET_IDS: { [key: string]: string } = {
  'rekap-all': process.env.GOOGLE_SHEET_ID_REKAP_ALL || '',
  'ultg-yogyakarta': process.env.GOOGLE_SHEET_ID_ULTG_YOGYAKARTA || '',
  'gi-bantul': process.env.GOOGLE_SHEET_ID_GI_BANTUL || '',
  'gis-wirobrajan': process.env.GOOGLE_SHEET_ID_GIS_WIROBRAJAN || '',
  'gi-kentungan': process.env.GOOGLE_SHEET_ID_GI_KENTUNGAN || '',
  'gis-gejayan': process.env.GOOGLE_SHEET_ID_GIS_GEJAYAN || '',
  'gi-klaten': process.env.GOOGLE_SHEET_ID_GI_KLATEN || '',
  'gi-kalasan': process.env.GOOGLE_SHEET_ID_GI_KALASAN || '',
  'gi-semanu': process.env.GOOGLE_SHEET_ID_GI_SEMANU || '',
  'gi-godean': process.env.GOOGLE_SHEET_ID_GI_GODEAN || '',
  'gi-medari': process.env.GOOGLE_SHEET_ID_GI_MEDARI || '',
  'gi-wates': process.env.GOOGLE_SHEET_ID_GI_WATES || '',
  'gi-purworejo': process.env.GOOGLE_SHEET_ID_GI_PURWOREJO || '',
};

export const getSheetIdForLocation = (locationId: string): string => {
  return LOCATION_SHEET_IDS[locationId] || process.env.NEXT_PUBLIC_SHEET_ID || '';
};
