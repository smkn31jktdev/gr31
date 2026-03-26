import { RefreshCw, Save } from "lucide-react";

interface ActionButtonsProps {
  loading: boolean;
  rowsCount: number;
  onLoad: () => void;
  onImport: () => void;
}

export default function ActionButtons({
  loading,
  rowsCount,
  onLoad,
  onImport,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-gray-100 pt-6">
      <button
        onClick={onLoad}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 font-semibold rounded-xl hover:bg-blue-100 transition-colors ${
          loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>Muat Data Sheet</span>
      </button>

      <button
        onClick={onImport}
        disabled={loading || rowsCount === 0}
        className={`inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--secondary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--secondary)]/20 hover:brightness-110 transition-all ${
          loading || rowsCount === 0
            ? "cursor-not-allowed opacity-50 shadow-none"
            : "cursor-pointer"
        }`}
      >
        <Save className="w-4 h-4" />
        <span>Simpan Semua Admin</span>
      </button>

      <div className="ml-auto text-sm text-gray-500">
        Baris data: <strong className="text-gray-900">{rowsCount}</strong>
      </div>
    </div>
  );
}
