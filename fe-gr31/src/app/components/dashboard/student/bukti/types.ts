export interface StudentData {
  nama: string;
  nisn: string;
  kelas: string;
}

export interface BuktiData {
  _id?: string;
  nisn: string;
  nama: string;
  kelas: string;
  bulan: string;
  foto: string;
  linkYouTube: string;
  createdAt: Date;
  updatedAt: Date;
}
