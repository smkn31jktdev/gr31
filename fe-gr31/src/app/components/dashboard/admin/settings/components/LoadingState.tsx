import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-[var(--secondary)] animate-spin mb-4" />
      <p className="text-gray-500 text-sm">Memuat pengaturan...</p>
    </div>
  );
}
