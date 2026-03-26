import {
  X,
  Image as ImageIcon,
  ExternalLink,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import Image from "next/image";
import { Bukti } from "../types";

interface BuktiModalProps {
  selectedBukti: Bukti | null;
  isModalOpen: boolean;
  closeModal: () => void;
  imageLoading: boolean;
  imageDataUrl: string | null;
  downloadImage: () => void;
}

export default function BuktiModal({
  selectedBukti,
  isModalOpen,
  closeModal,
  imageLoading,
  imageDataUrl,
  downloadImage,
}: BuktiModalProps) {
  if (!isModalOpen || !selectedBukti) return null;

  const formatBulan = (bulan: string) => {
    const [year, month] = bulan.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detail Bukti</h3>
            <p className="text-sm text-gray-500">
              {selectedBukti.nama} • {formatBulan(selectedBukti.bulan)}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Col: Image */}
            <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm min-h-[300px] flex items-center justify-center relative">
              {imageLoading ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full" />
                  <span className="text-xs">Memuat...</span>
                </div>
              ) : imageDataUrl ? (
                <div className="relative w-full h-full min-h-[400px]">
                  <Image
                    src={imageDataUrl}
                    alt="Preview Bukti"
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400 py-20">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Gambar tidak tersedia</p>
                </div>
              )}
            </div>

            {/* Right Col: Info & Actions */}
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Nama Siswa
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {selectedBukti.nama}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    NISN
                  </label>
                  <p className="text-gray-900 font-medium font-mono">
                    {selectedBukti.nisn}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Kelas
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedBukti.kelas}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Bulan
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatBulan(selectedBukti.bulan)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm">
                  Tautan & Aksi
                </h4>
                {selectedBukti.linkYouTube ? (
                  <div className="space-y-2">
                    <a
                      href={selectedBukti.linkYouTube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-medium truncate">
                        Buka di YouTube
                      </div>
                    </a>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(selectedBukti.linkYouTube)
                      }
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors w-full"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-medium">Salin Link</div>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Tidak ada link YouTube.
                  </p>
                )}

                {imageDataUrl && (
                  <button
                    onClick={downloadImage}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--secondary)] text-white font-medium hover:bg-teal-700 transition-colors shadow-sm mt-4"
                  >
                    <Download className="w-4 h-4" />
                    Download Foto
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={closeModal}
            className="px-6 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
