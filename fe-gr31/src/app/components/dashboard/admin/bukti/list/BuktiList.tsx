import { X, Image as ImageIcon, ExternalLink, FileImage } from "lucide-react";
import { Bukti } from "../types";

interface BuktiListProps {
  loading: boolean;
  error: string | null;
  buktiList: Bukti[];
  openModal: (bukti: Bukti) => void;
}

export default function BuktiList({
  loading,
  error,
  buktiList,
  openModal,
}: BuktiListProps) {
  const formatBulan = (bulan: string) => {
    const [year, month] = bulan.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[var(--secondary)]">
            <FileImage className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Daftar Unggahan</h3>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
              <X className="w-8 h-8" />
            </div>
            <h3 className="text-red-900 font-medium mb-1">Gagal Memuat Data</h3>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : buktiList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">Belum ada bukti</h3>
            <p className="text-gray-500 text-sm">
              Belum ada siswa yang mengunggah bukti kegiatan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50/30">
            {buktiList.map((bukti) => (
              <div
                key={`${bukti.nisn}-${bukti.bulan}`}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {bukti.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {bukti.nama}
                      </p>
                      <p className="text-xs text-gray-500">{bukti.kelas}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                    {formatBulan(bukti.bulan)}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => openModal(bukti)}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Lihat Foto
                  </button>
                  {bukti.linkYouTube && (
                    <a
                      href={bukti.linkYouTube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Video YouTube
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
