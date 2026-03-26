import { Pencil, X, Trash, Loader2, Save } from "lucide-react";
import { AdminItem, EditFormState } from "../types";

interface EditAdminModalProps {
  isOpen: boolean;
  selectedAdmin: AdminItem | null;
  editForm: EditFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onFormChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onDeleteRequest: () => void;
}

export default function EditAdminModal({
  isOpen,
  selectedAdmin,
  editForm,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit,
  onDeleteRequest,
}: EditAdminModalProps) {
  if (!isOpen || !selectedAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Pencil className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Edit Data Admin
              </h2>
              <p className="text-sm text-gray-500">
                Perbarui informasi untuk {selectedAdmin.nama}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="edit-admin-form" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Nama Guru
                </label>
                <input
                  name="nama"
                  value={editForm.nama}
                  onChange={onFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
                  placeholder="Nama Lengkap Guru"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={onFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
                  placeholder="Email Admin"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password Baru{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={editForm.password}
                  onChange={onFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                />
              </div>
            </div>

            {/* Danger Zone - only show for non-super admin accounts */}
            {selectedAdmin.email !== "smkn31jktdev@gmail.com" && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                      <Trash className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-700">
                        Hapus Data Admin
                      </p>
                      <p className="text-xs text-rose-600/80">
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onDeleteRequest}
                    className="px-4 py-2 bg-white text-rose-600 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                  >
                    Hapus Permanen
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            form="edit-admin-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--secondary)] text-white font-bold text-sm rounded-xl hover:brightness-110 shadow-lg shadow-[var(--secondary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
