import { MapPin, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ActivityRow, { ActivityType } from "./ActivityRow";

interface ActivitiesListProps {
  activities: ActivityType[];
  isLoadingKegiatan: boolean;
  locationMessage: string;
  isLoadingLocation: boolean;
  isInsideSchoolBounds: boolean;
  isDevToolsOpen: boolean;
  verifyLocation: () => void;
  kehadiranStatus: { status: "hadir" | "tidak_hadir" | "belum"; alasanTidakHadir?: string };
  onOpenReasonModal: () => void;
}

export default function ActivitiesList({
  activities,
  isLoadingKegiatan,
  locationMessage,
  isLoadingLocation,
  isInsideSchoolBounds,
  isDevToolsOpen,
  verifyLocation,
  kehadiranStatus,
  onOpenReasonModal,
}: ActivitiesListProps) {
  const router = useRouter();
  const isWeekendDay = [0, 6].includes(new Date().getDay());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Aktivitas Hari Ini
            {!isWeekendDay && (
              <button
                onClick={verifyLocation}
                className="text-gray-400 hover:text-[var(--secondary)] transition-colors"
                title="Refresh Lokasi"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}
          </h3>
          <p
            className={`text-xs mt-1 font-medium ${
              isWeekendDay
                ? "text-orange-500"
                : isLoadingLocation
                  ? "text-gray-500"
                  : isInsideSchoolBounds && !isDevToolsOpen
                    ? "text-emerald-600"
                    : "text-rose-500"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 inline mr-1" />{" "}
            {isWeekendDay ? "Pengisian Bebas Lokasi (Hari Libur)" : locationMessage}
          </p>
        </div>
        {isWeekendDay ? (
          <button
            onClick={() => router.push("/page/siswa/kegiatan")}
            className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-[var(--secondary)] text-white text-sm font-medium hover:bg-teal-600 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            Isi Kegiatan &rarr;
          </button>
        ) : kehadiranStatus.status !== "belum" ? (
          <div className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200 flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {kehadiranStatus.status === "hadir"
                ? "Sudah Absen Hadir"
                : `Tidak Hadir: ${kehadiranStatus.alasanTidakHadir}`}
            </span>
          </div>
        ) : isInsideSchoolBounds && !isDevToolsOpen ? (
          <button
            onClick={() => router.push("/page/siswa/kegiatan")}
            className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-[var(--secondary)] text-white text-sm font-medium hover:bg-teal-600 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            Isi Kegiatan &rarr;
          </button>
        ) : (
          <button
            onClick={onOpenReasonModal}
            disabled={isLoadingLocation}
            className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation
              ? "Memeriksa Lokasi..."
              : "Isi Alasan Tidak Hadir"}
          </button>
        )}
      </div>

      <div className="p-0">
        {isLoadingKegiatan ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--secondary)] border-t-transparent rounded-full mx-auto mb-2"></div>
            Memuat data...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50">
            <div className="divide-y divide-gray-50">
              {activities.slice(0, 4).map((activity, idx) => (
                <ActivityRow key={idx} activity={activity} />
              ))}
            </div>
            <div className="divide-y divide-gray-50">
              {activities.slice(4).map((activity, idx) => (
                <ActivityRow key={idx} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
