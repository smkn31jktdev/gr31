import { useEffect, useState, useMemo } from "react";
import type { AdminItem } from "../types";

export function useAdminList(isAllowed: boolean | null) {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isAllowed !== true) return;

    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Token admin tidak ditemukan. Silakan login kembali.");
          setAdmins([]);
          return;
        }

        const response = await fetch("/api/admin/admins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Gagal memuat data admin");
        }

        const data = (await response.json()) as {
          admins?: AdminItem[];
          data?: AdminItem[];
        };

        const adminList = Array.isArray(data.admins)
          ? data.admins
          : Array.isArray(data.data)
            ? data.data
            : [];

        setAdmins(adminList);
      } catch (err) {
        console.error("Fetch admins error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data admin",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [isAllowed]);

  const filteredAdmins = useMemo(() => {
    if (!searchTerm.trim()) {
      return admins;
    }

    const term = searchTerm.toLowerCase();
    return admins.filter((admin) => {
      return (
        admin.nama.toLowerCase().includes(term) ||
        admin.email.toLowerCase().includes(term)
      );
    });
  }, [admins, searchTerm]);

  return {
    admins,
    setAdmins,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredAdmins,
  };
}
