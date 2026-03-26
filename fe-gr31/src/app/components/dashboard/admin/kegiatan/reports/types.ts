export interface MakanSehatPdfRow {
  tanggal: string;
  jenisMakanan: string;
  jenisLauk: string;
  makanSayurAtauBuah: boolean;
  minumSuplemen: boolean;
}

export interface OlahragaPdfRow {
  tanggal: string;
  jenisOlahraga: string;
  deskripsi: string;
  waktu: string;
}

export interface BelajarPdfRow {
  tanggal: string;
  dilakukan: string;
  jenisKegiatanBelajar: string;
}

export interface IbadahPdfRow {
  tanggal: string;
  berdoa: boolean;
  fajar: boolean;
  limaWaktu: boolean;
  zikir: boolean;
  dhuha: boolean;
  rawatib: boolean;
  zisNominal: string;
}

export interface BermasyarakatPdfRow {
  tanggal: string;
  jenisKegiatan: string;
  tempat: string;
  waktu: string;
}

export interface PdfParams {
  filename: string;
  student: { nama: string; kelas?: string };
  selectedMonth: string;
}
