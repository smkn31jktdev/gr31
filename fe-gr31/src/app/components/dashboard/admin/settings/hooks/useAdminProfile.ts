import { useState, useEffect } from "react";
import type { MessageState } from "../types";

function resolvePhotoUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  // Gunakan proxy Next.js untuk uploads
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url.startsWith("/") ? `/api${url}` : `/api/${url}`;
}

export function useAdminProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<MessageState | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setMessage({
            type: "error",
            text: "Sesi admin tidak ditemukan. Silakan login lagi.",
          });
          window.location.href = "/page/login/admin";
          return;
        }

        const response = await fetch("/api/auth/admin/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data?.user ?? {};
          setName(user.nama || "");
          setEmail(user.email || "");
          setOriginalEmail(user.email || "");
          if (user.fotoProfil) {
            setFotoProfil(resolvePhotoUrl(user.fotoProfil));
          }
        } else {
          const errorData = await response.json();
          setMessage({
            type: "error",
            text: errorData.error || "Gagal memuat data admin",
          });
        }
      } catch (err: unknown) {
        console.error("Load admin data error:", err);
        setMessage({ type: "error", text: "Gagal memuat data admin" });
      } finally {
        setInitialLoading(false);
      }
    };

    loadAdminData();
  }, []);

  return {
    name,
    setName,
    email,
    setEmail,
    originalEmail,
    setOriginalEmail,
    fotoProfil,
    setFotoProfil,
    initialLoading,
    message,
    setMessage,
  };
}
