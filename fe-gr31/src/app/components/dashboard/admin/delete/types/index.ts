export interface StudentResponse {
  id: string;
  nama: string;
  kelas: string;
  nisn: string;
  walas?: string;
}

export interface StudentOption {
  value: string;
  label: string;
  description: string;
  nama: string;
  kelas: string;
  nisn: string;
}

export interface MonthOption {
  key: string;
  label: string;
  entryCount: number;
}

export type FeedbackState = {
  type: "success" | "error" | "info";
  text: string;
} | null;

export interface PendingDelete {
  studentName: string;
  monthName: string;
  entryCount: number;
}
