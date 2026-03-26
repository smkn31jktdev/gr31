import { FileImage, Link2, Upload, PlayCircle } from "lucide-react";
import Image from "next/image";
import { BuktiData } from "../types";

interface FormData {
  foto: File | null;
  linkYouTube: string;
}

interface BuktiFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  fotoPreview: string | null;
  handleFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleReset: () => void;
  isSubmitting: boolean;
  hasSubmittedThisMonth: boolean;
  submittedBukti: BuktiData | null;
  imageLoading: boolean;
  imageDataUrl: string | null;
}

export default function BuktiForm({
  formData,
  setFormData,
  fotoPreview,
  handleFotoChange,
  handleSubmit,
  handleReset,
  isSubmitting,
  hasSubmittedThisMonth,
  submittedBukti,
  imageLoading,
  imageDataUrl,
}: BuktiFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-blue-500" /> Foto Dokumentasi
          </h3>
          {hasSubmittedThisMonth && submittedBukti ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {imageLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : imageDataUrl ? (
                <Image
                  src={imageDataUrl}
                  alt="Bukti"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Tidak ada gambar
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  fotoPreview
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                {fotoPreview ? (
                  <div className="relative w-full h-full p-2">
                    <Image
                      src={fotoPreview}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold text-blue-500">
                        Klik upload
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG / JPG (MAX. 5MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={handleFotoChange}
                  disabled={hasSubmittedThisMonth}
                />
              </label>
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-red-500" /> Link Video / Konten
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Bisa pakai link Instagram, YouTube, TikTok, Google Drive, atau
            Facebook.
          </p>
          {hasSubmittedThisMonth && submittedBukti ? (
            submittedBukti.linkYouTube ? (
              <a
                href={submittedBukti.linkYouTube}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                <span className="text-sm font-medium truncate flex-1">
                  {submittedBukti.linkYouTube}
                </span>
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Tidak ada link video.
              </p>
            )
          ) : (
            <input
              type="url"
              className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-red-300 focus:ring-0 rounded-xl transition-all text-sm"
              placeholder="https://instagram.com/... atau platform lain"
              value={formData.linkYouTube}
              onChange={(e) =>
                setFormData({ ...formData, linkYouTube: e.target.value })
              }
            />
          )}
        </div>

        {!hasSubmittedThisMonth && (
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 rounded-xl bg-[var(--secondary)] text-white font-medium hover:bg-teal-600 transition-all shadow-sm shadow-teal-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Bukti"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
