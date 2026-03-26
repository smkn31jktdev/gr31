import { useState } from "react";
import { UserPlus, Save } from "lucide-react";
import { useSnackbar } from "notistack";

export default function TambahAdminForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const raw = await response.text();
      let result: { error?: string; message?: string } = {};
      try {
        result = raw
          ? (JSON.parse(raw) as { error?: string; message?: string })
          : {};
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      enqueueSnackbar(result.message || "Admin berhasil ditambahkan!", {
        variant: "success",
      });
      setFormData({
        nama: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Submit error:", error);
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menambahkan admin",
        {
          variant: "error",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-6">
          <UserPlus className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">
            Informasi Admin Baru
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Guru */}
          <div className="space-y-2">
            <label
              htmlFor="nama"
              className="text-sm font-semibold text-gray-700"
            >
              Nama Guru
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
              placeholder="Masukkan nama guru"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
              placeholder="Masukkan email"
            />
          </div>

          {/* Password */}
          <div className="md:col-span-2 space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all outline-none placeholder:text-gray-400"
              placeholder="Masukkan password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className={`group relative flex items-center gap-3 px-6 py-2.5 rounded-xl bg-[var(--secondary)] text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-[var(--secondary)]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              loading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span>Simpan Admin</span>
            <div className="bg-white/20 rounded-full p-1 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              <Save className="w-4 h-4" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
