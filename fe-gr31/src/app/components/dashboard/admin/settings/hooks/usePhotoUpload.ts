import { useState } from "react";
import { PROXY_ENDPOINTS, baseUrl } from "@/core/config";
import type { MessageState } from "../types";

function resolvePhotoUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

export function usePhotoUpload() {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFotoProfil: (foto: string | null) => void,
    setMessage: (msg: MessageState | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "File harus berupa gambar JPG, PNG, atau WebP",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran file maksimal 2MB" });
      return;
    }

    try {
      setUploadingPhoto(true);
      setMessage(null);
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("foto", file);

      const res = await fetch(PROXY_ENDPOINTS.admin.profilePhoto, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal mengunggah foto");

      setFotoProfil(resolvePhotoUrl(data.fotoProfil));
      setMessage({
        type: "success",
        text: data.message || "Foto profil berhasil diperbarui",
      });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengunggah foto",
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handlePhotoDelete = async (
    setFotoProfil: (foto: string | null) => void,
    setMessage: (msg: MessageState | null) => void,
  ) => {
    try {
      setUploadingPhoto(true);
      setMessage(null);
      const token = localStorage.getItem("adminToken");

      const res = await fetch(PROXY_ENDPOINTS.admin.profilePhoto, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal menghapus foto");

      setFotoProfil(null);
      setMessage({
        type: "success",
        text: data.message || "Foto profil berhasil dihapus",
      });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus foto",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  return {
    uploadingPhoto,
    handlePhotoUpload,
    handlePhotoDelete,
  };
}
