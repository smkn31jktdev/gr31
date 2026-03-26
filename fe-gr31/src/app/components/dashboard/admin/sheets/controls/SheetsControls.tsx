import { Calendar, Download, RefreshCw } from "lucide-react";
import Select from "@/app/components/ui/Select";
import { SummaryMonthOption } from "../types";

interface SheetsControlsProps {
  month: string;
  loading: boolean;
  message: string | null;
  availableMonths: SummaryMonthOption[];
  filteredSummariesLength: number;
  totalSummaries: number;
  currentMonthLabel: string;
  updateMonth: (value: string) => void;
  fetchSummaries: (monthOverride?: string) => void;
  downloadCsv: () => void;
  monthRefCurrent: string | null;
}

export default function SheetsControls({
  month,
  loading,
  message,
  availableMonths,
  filteredSummariesLength,
  totalSummaries,
  currentMonthLabel,
  updateMonth,
  fetchSummaries,
  downloadCsv,
  monthRefCurrent,
}: SheetsControlsProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Selector Section */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center gap-3 text-gray-900 font-bold text-lg mb-2">
            <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-(--secondary)">
              <Calendar className="w-5 h-5" />
            </span>
            Pilih Periode
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 pl-1">
              Bulan Laporan
            </label>
            <Select
              value={month}
              onChange={(value: string) => {
                if (!value || value === monthRefCurrent) return;
                updateMonth(value);
                void fetchSummaries(value);
              }}
              options={availableMonths.map((option) => ({
                value: option.key,
                label: option.label,
              }))}
              placeholder={
                availableMonths.length === 0
                  ? "Data tidak tersedia"
                  : "Pilih bulan..."
              }
              disabled={availableMonths.length === 0}
              className="w-full text-sm"
              searchable
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={downloadCsv}
              disabled={loading || !month}
              className="px-6 py-2.5 rounded-xl bg-(--secondary) text-white font-medium text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-teal-100 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? "Memproses..." : "Download CSV"}
            </button>
            <button
              onClick={() => fetchSummaries(month || undefined)}
              className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                message.toLowerCase().includes("berhasil")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="w-full lg:w-80 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Ringkasan Data</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Terpilih
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSummariesLength}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Data siswa bulan {currentMonthLabel}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Total Arsip
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSummaries}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total semua periode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
