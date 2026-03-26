import { Trash2 } from "lucide-react";
import { PendingDelete } from "../types";

interface ConfirmDeleteModalProps {
  pendingDelete: PendingDelete | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  pendingDelete,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!pendingDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-rose-500">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Konfirmasi Penghapusan
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Apakah Anda yakin ingin menghapus data kegiatan ini?
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Siswa</span>
            <span className="font-semibold text-gray-900">
              {pendingDelete.studentName}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Bulan</span>
            <span className="font-semibold text-gray-900">
              {pendingDelete.monthName}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Total Data</span>
            <span className="font-bold text-rose-600">
              {pendingDelete.entryCount} Catatan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
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
            {isDeleting ? "..." : "Ya, Hapus Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
