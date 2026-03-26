import { Trash, Loader2 } from "lucide-react";
import { AdminItem } from "../types";

interface DeleteAdminModalProps {
  isOpen: boolean;
  selectedAdmin: AdminItem | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteAdminModal({
  isOpen,
  selectedAdmin,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteAdminModalProps) {
  if (!isOpen || !selectedAdmin) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-rose-500">
            <Trash className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Hapus Data Admin?
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Apakah anda yakin ingin menghapus data admin{" "}
            <span className="font-bold text-gray-800">
              {selectedAdmin?.nama}
            </span>
            ? Data yang dihapus tidak dapat dikembalikan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 bg-gray-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Ya, Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
