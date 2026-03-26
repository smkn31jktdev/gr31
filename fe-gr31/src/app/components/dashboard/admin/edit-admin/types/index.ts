export interface AdminItem {
  id: string;
  nama: string;
  email: string;
  createdAt?: string;
}

export interface EditFormState {
  nama: string;
  email: string;
  password: string;
}
