import { Activity } from "lucide-react";

interface ProgressCardProps {
  activities: { completed: boolean }[];
  isLoadingKegiatan: boolean;
}

export default function ProgressCard({ activities, isLoadingKegiatan }: ProgressCardProps) {
  const completedCount = activities.filter((a) => a.completed).length;
  const progressPercent = isLoadingKegiatan ? 0 : (completedCount / 7) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:col-span-2 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Progres Harian
            </h3>
            <p className="text-xs text-gray-500">
              Selesaikan kebiasaan baikmu
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">
            {isLoadingKegiatan ? "-" : completedCount}
          </span>
          <span className="text-gray-400 text-sm">/7</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[var(--secondary)] h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-gray-400 mt-2">
          {isLoadingKegiatan
            ? "Sedang memuat data..."
            : completedCount === 7
              ? "Luar biasa! Semua kegiatan selesai!"
              : "Ayo selesaikan kegiatanmu!"}
        </p>
      </div>
    </div>
  );
}
