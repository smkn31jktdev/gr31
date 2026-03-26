import { CheckCircle } from "lucide-react";
import { BuktiData } from "../types";

interface BuktiHeaderProps {
  currentMonth: string;
  hasSubmittedThisMonth: boolean;
  submittedBukti: BuktiData | null;
}

export default function BuktiHeader({
  currentMonth,
  hasSubmittedThisMonth,
  submittedBukti,
}: BuktiHeaderProps) {
  return (
    <>
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Dokumentasi Kegiatan
        </h1>
        <p className="text-gray-500 text-sm">
          Kumpulkan bukti kegiatanmu untuk bulan{" "}
          <span className="font-semibold text-[var(--secondary)] whitespace-nowrap">
            {currentMonth}
          </span>
        </p>
      </div>

      {hasSubmittedThisMonth && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-800">Bukti Telah Dikumpulkan</h3>
            <p className="text-sm text-emerald-600 mt-1">
              Terima kasih! Kamu sudah mengumpulkan bukti kegiatan untuk bulan ini. Dikumpulkan pada:{" "}
              <span className="font-semibold">
                {submittedBukti && new Date(submittedBukti.createdAt).toLocaleDateString("id-ID")}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
