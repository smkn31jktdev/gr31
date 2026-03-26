export interface SummaryBrief {
  nisn: string;
  nama: string;
  kelas?: string;
  monthKey?: string;
  monthLabel?: string;
}

export interface SummaryMonthOption {
  key: string;
  label: string;
}

export interface SummaryResponse {
  summaries?: SummaryBrief[];
  availableMonths?: SummaryMonthOption[];
  selectedMonth?: string | null;
  totalRecords?: number;
}
