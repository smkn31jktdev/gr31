import { SquarePen } from "lucide-react";

interface UrlInputProps {
  sheetUrl: string;
}

export default function UrlInput({ sheetUrl }: UrlInputProps) {
  return (
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
  );
}
