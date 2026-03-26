export interface Admin {
  id: string;
  nama: string;
  email: string;
  password?: string;
  fotoProfil?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRegisterInput {
  nama: string;
  email: string;
  password: string;
  role?: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}
