# Simple Outline - Aplikasi Rekap K3 APD

## Flow Aplikasi

```
LOGIN → PILIHAN LOKASI → PILIHAN ALAT → DAFTAR INPUT
```

---

## 1. LOGIN PAGE

**Halaman:** `/login`

**Elemen:**
- Logo PLN
- Judul aplikasi
- Form:
  - Input username
  - Input password
  - Tombol "Login"
- Error message (jika login gagal)

---

## 2. PILIHAN LOKASI

**Halaman:** `/pilih-lokasi`

**Elemen:**
- Header: "Pilih Lokasi GI/Kantor"
- List 12 lokasi dalam bentuk card/button:
  1. KANTOR ULTG YOGYAKARTA
  2. GI BANTUL
  3. GIS WIROBRAJAN
  4. GI KENTUNGAN
  5. GIS GEJAYAN
  6. GI KLATEN
  7. GI KALASAN
  8. GI SEMANU
  9. GI GODEAN
  10. GI MEDARI
  11. GI WATES
  12. GI PURWOREJO
- Tombol Logout

---

## 3. PILIHAN ALAT (Kategori APD)

**Halaman:** `/lokasi/[id]/alat`

**Elemen:**
- Header: Nama lokasi yang dipilih
- Tombol "Kembali"
- Grid 12 kategori APD:
  1. 👷 ALAT PELINDUNG KEPALA
  2. 👓 ALAT PELINDUNG MATA DAN MUKA
  3. 🧤 ALAT PELINDUNG TANGAN
  4. 👂 ALAT PELINDUNG TELINGA
  5. 👞 ALAT PELINDUNG KAKI
  6. 👔 PAKAIAN PELINDUNG
  7. 🦺 ROMPI PENGAWAS
  8. 😷 ALAT PELINDUNG PERNAPASAN
  9. 🪂 ALAT PELINDUNG JATUH
  10. 🛟 PELAMPUNG
  11. 🚧 RAMBU-RAMBU
  12. 🔧 ALAT KERJA

---

## 4. DAFTAR INPUT TIAP ALAT

**Halaman:** `/lokasi/[id]/alat/[kategori_id]`

**Elemen Halaman:**
- Header: Nama kategori
- Tombol "Kembali"
- List item dalam kategori (contoh: ALAT PELINDUNG KEPALA):
  - HELM BIRU (HAR, OPERATOR) → [Input]
  - HELM MERAH (P.K3, P.M, P.P) → [Input]
  - HELM KUNING (MITRA, MAGANG) → [Input]
  - HELM PUTIH (TAMU & MANAJEMEN) → [Input]
  - HELM HIJAU (LING) → [Input]

**Form Input (Modal/Page baru):**

Ketika user klik "Input", tampilkan form dengan field:

### Field Wajib:
- **LOKASI** (auto-filled, dropdown)
- **MERK** (text input)
- **TIPE** (text input)
- **KAPASITAS** (text input)
- **JENIS** (text input)
- **INSPEKSI TAHUN** (dropdown: 2020-2025)
- **TANGGAL PENGISIAN** (date picker, default: hari ini)
- **KADALUARSA** (date picker)
- **KONDISI** (dropdown: Baik / Cukup / Rusak)
- **KETERANGAN** (textarea)

### Field Opsional (hanya untuk alat tertentu):
- **BAHAN PEMADAM** (text input)
- **KELAS KEBAKARAN** (text input)

**Tombol:**
- Simpan
- Batal

---

## Data Master

### 12 Lokasi GI/Kantor:
1. KANTOR ULTG YOGYAKARTA
2. GI BANTUL
3. GIS WIROBRAJAN
4. GI KENTUNGAN
5. GIS GEJAYAN
6. GI KLATEN
7. GI KALASAN
8. GI SEMANU
9. GI GODEAN
10. GI MEDARI
11. GI WATES
12. GI PURWOREJO

### 12 Kategori APD & Item-itemnya:

#### 1. ALAT PELINDUNG KEPALA
- HELM BIRU (HAR, OPERATOR)
- HELM MERAH (P.K3, P.M, P.P)
- HELM KUNING (MITRA, MAGANG)
- HELM PUTIH (TAMU & MANAJEMEN)
- HELM HIJAU (LING)

#### 2. ALAT PELINDUNG MATA DAN MUKA
- KACAMATA PENGAMAN
- GOOGLES
- FACE SHIELD
- WELDING SHIELD

#### 3. ALAT PELINDUNG TANGAN
- SARUNG TANGAN TAHAN PANAS/API BAHAN KULIT
- SARUNG TANGAN TAHAN MEKANIS COATED GLOVES
- SARUNG TANGAN TAHAN KIMIA DAN CAIRAN BAHAN BUTYL
- SARUNG TANGAN INSULASI
- CONDUCTIVE GLOVES

#### 4. ALAT PELINDUNG TELINGA
- SUMBAT TELINGA (EAR PLUG)
- PENUTUP TELINGA (EAR MUFF)

#### 5. ALAT PELINDUNG KAKI
- SAFETY SHOES
- SEPATU TAHAN TEGANGAN
- CONDUCTIVE SHOES
- CONDUCTIVE SOCKS
- SEPATU TAHAN AIR

#### 6. PAKAIAN PELINDUNG
- WEARPACK TERPISAH
- WEARPACK TERUSAN
- WEARPACK LABORATORIUM
- PAKAIAN PELINDUNG B3 (HAZMAT)
- JAS HUJAN

#### 7. ROMPI PENGAWAS
- ROMPI PP (HIJAU)
- ROMPI PK3 (MERAH)
- ROMPI PM (KUNING)
- ROMPI TAMU (BIRU)

#### 8. ALAT PELINDUNG PERNAPASAN
- PARTICULATE RESPIRATOR (SINGLE USE FILTER)
- NON-POWERED HALF FACEPIECE RESPIRATOR (WITH REPLACABLE FILTER)
- NON-POWERED FULL FACEPIECE RESPIRATOR (WITH REPLACABLE FILTER)
- SELF CONTAINED BREATHING APPARATUS (SCBA) - RESCUE UNIT
- EMERGENCY ESCAPE BREATHING APPARATUS
- ALAT UKUR GAS BERACUN

#### 9. ALAT PELINDUNG JATUH
- ANCHOR / ANGKUR
- BODY SUPPORT / FULL BODY HARNESS
- CONNECTOR / LANYARD
- TANDU

#### 10. PELAMPUNG
- JAKET KESELAMATAN (LIFE JACKET)
- ROMPI KESELAMATAN (LIFE VEST)
- ALAT PELAMPUNG YANG DAPAT DILEMPAR (THROWABLE FLOTATION DEVICES)
- ALAT PELAMPUNG KHUSUS

#### 11. RAMBU-RAMBU
- BACKMED (KIT) P3K DAN ISINYA
- SAFETY LINE MERAH
- BENDERA SEGI EMPAT (MERAH & HIJAU)
- LAMPU EMERGENCY/LAMPU SOROT
- LEMARI K3
- SOP KEBAKARAN
- SOP KEAMANAN
- DENAH PENEMPATAN APAR
- DENAH EVAKUASI
- TERMOMETER SUHU BADAN
- TENSI METER
- SENTER KEPALA
- RAMBU-RAMBU (TAGING)

#### 12. ALAT KERJA
- Stick Ground 70/150 kV (termasuk kabel tembaga untuk grounding-3 kabel)
- Stick Ground 275/500 kV (termasuk kabel tembaga untuk grounding-3 kabel)
- Stick Ground 20 kV (termasuk kabel tembaga untuk grounding-3 kabel)
- Voltage Detector 20 kV with Insulating Stick
- Voltage Detector 70/150 kV with Insulating Stick
- Voltage Detector 275-500 kV with Insulating Stick

---

## Form Fields Reference

**Field yang selalu muncul:**
1. LOKASI (dropdown)
2. MERK (text)
3. TIPE (text)
4. KAPASITAS (text)
5. JENIS (text)
6. INSPEKSI TAHUN (dropdown)
7. TANGGAL PENGISIAN (date - default: today)
8. KADALUARSA (date)
9. KONDISI (dropdown: Baik/Cukup/Rusak)
10. KETERANGAN (textarea)

**Field opsional (untuk alat pemadam api/APAR):**
- BAHAN PEMADAM (text)
- KELAS KEBAKARAN (text)
