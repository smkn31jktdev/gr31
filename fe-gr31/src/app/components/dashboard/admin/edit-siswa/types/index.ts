export interface StudentItem {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  walas?: string;
  isOnline?: boolean;
}

export interface EditFormState {
  nisn: string;
  nama: string;
  kelas: string;
  walas: string;
  password: string;
}
