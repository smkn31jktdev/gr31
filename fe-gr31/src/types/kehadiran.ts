export interface Koordinat {
  lat: number;
  lng: number;
}

export interface KehadiranPatch {
  status: string;
  alasanTidakHadir?: string;
  koordinat?: Koordinat;
  jarak?: number;
  akurasi?: number;
  verifiedAt?: string;
}

export interface KehadiranInput {
  tanggal: string;
  kehadiran: KehadiranPatch;
}

export interface Kehadiran {
  id?: number;
  nisn: string;
  nama: string;
  kelas: string;
  tanggal: string;
  hari: string;
  status: string;
  waktuAbsen: string;
  alasanTidakHadir?: string;
  koordinat?: Koordinat;
  jarak?: number;
  akurasi?: number;
  verifiedAt?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KehadiranFilter {
  tanggal?: string;
  dari?: string;
  sampai?: string;
  kelas?: string;
  nisn?: string;
  status?: string;
}
