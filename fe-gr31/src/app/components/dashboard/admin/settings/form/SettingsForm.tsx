import { User, Shield, Info, Lock, X, Save, Loader2 } from "lucide-react";

interface SettingsFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handleSave: (e: React.FormEvent) => void;
  handleCancel: () => void;
  loading: boolean;
}

export default function SettingsForm({
  name,
  setName,
  email,
  setEmail,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleSave,
  handleCancel,
  loading,
}: SettingsFormProps) {
  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Section 1: Personal Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4">
          <User className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">
            Informasi Pribadi
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
              placeholder="Nama Lengkap"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
              placeholder="nama@sekolah.sch.id"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Security */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4">
          <Shield className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">Keamanan</h3>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 flex gap-3 text-orange-800 text-sm mb-6">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p>
            Kosongkan kolom di bawah jika Anda tidak ingin mengubah kata sandi
            saat ini.
          </p>
        </div>

        <div className="space-y-5 w-full">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
                placeholder="••••••••"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Konfirmasi Kata Sandi
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-8 flex flex-col md:flex-row gap-6 items-center justify-end border-t border-gray-100">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-500 font-medium hover:text-red-500 transition-colors group text-sm cursor-pointer"
        >
          <X className="w-5 h-5 group-hover:text-red-500 transition-colors" />
          <span>Batalkan</span>
        </button>

        <div className="hidden md:block w-px h-8 bg-gray-200"></div>

        <button
          type="submit"
          disabled={loading}
          className="group relative flex items-center gap-3 px-6 py-2.5 rounded-xl bg-[var(--secondary)] text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-[var(--secondary)]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Simpan Perubahan</span>
          <div className="bg-white/20 rounded-full p-1 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
