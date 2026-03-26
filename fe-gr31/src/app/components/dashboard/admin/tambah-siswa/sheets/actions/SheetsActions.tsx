import { SquarePen, RefreshCw, Save } from "lucide-react";

interface SheetsActionsProps {
  sheetUrl: string;
  loading: boolean;
  rowsCount: number;
  onLoad: () => void;
  onImport: () => void;
}

export default function SheetsActions({
  sheetUrl,
  loading,
  rowsCount,
  onLoad,
  onImport,
}: SheetsActionsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            URL Google Sheet
          </label>
          <div className="flex gap-2">
            <input
              value={sheetUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  const url = sheetUrl?.trim();
                  if (!url) return;
                  window.open(url, "_blank", "noopener,noreferrer");
                } catch (err) {
                  console.error(err);
                }
              }}
              title="Buka Sheet"
              className="inline-flex items-center justify-center w-12 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer border border-amber-200"
            >
              <SquarePen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

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
          <span>Simpan Semua Siswa</span>
        </button>

        <div className="ml-auto text-sm text-gray-500">
          Baris data: <strong className="text-gray-900">{rowsCount}</strong>
        </div>
      </div>
    </>
  );
}
