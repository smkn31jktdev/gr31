import { Camera, Loader2, CheckCircle, Trash2 } from "lucide-react";

interface ProfilePictureProps {
  fotoProfil: string | null;
  name: string;
  email: string;
  uploadingPhoto: boolean;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePhotoDelete: () => Promise<void>;
}

export default function ProfilePicture({
  fotoProfil,
  name,
  email,
  uploadingPhoto,
  handlePhotoUpload,
  handlePhotoDelete,
}: ProfilePictureProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="relative group">
        {fotoProfil ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoProfil}
            alt="Foto Profil"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm ring-1 ring-gray-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-[var(--secondary)] border-4 border-white shadow-sm ring-1 ring-gray-100">
            {name ? name.charAt(0).toUpperCase() : "A"}
          </div>
        )}
        <label
          className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
            uploadingPhoto ? "opacity-100" : ""
          }`}
        >
          {uploadingPhoto ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
        </label>
      </div>
      <div className="text-center sm:text-left flex-1">
        <h2 className="text-xl font-bold text-gray-900">
          {name || "Administrator"}
        </h2>
        <p className="text-gray-500 text-sm mb-3">{email}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <CheckCircle className="w-3 h-3" />
            Akun Terverifikasi
          </span>
          {fotoProfil && (
            <button
              type="button"
              onClick={handlePhotoDelete}
              disabled={uploadingPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              Hapus Foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
