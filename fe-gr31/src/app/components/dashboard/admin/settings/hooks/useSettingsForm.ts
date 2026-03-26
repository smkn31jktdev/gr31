import { useState } from "react";
import type { MessageState } from "../types";

export function useSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (
    name: string,
    email: string,
    newPassword: string,
    confirmPassword: string,
    currentPassword: string,
  ) => {
    if (!name.trim()) return "Nama diperlukan";
    if (!email.trim()) return "Email diperlukan";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Email tidak valid";
    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) return "Kata sandi baru minimal 8 karakter";
      if (newPassword !== confirmPassword) return "Kata sandi tidak cocok";
      if (!currentPassword)
        return "Kata sandi saat ini diperlukan untuk mengubah kata sandi";
    }
    return null;
  };

  const handleSave = async (
    e: React.FormEvent,
    name: string,
    email: string,
    originalEmail: string,
    setOriginalEmail: (email: string) => void,
    setMessage: (msg: MessageState | null) => void,
  ) => {
    e.preventDefault();
    setMessage(null);
    const err = validate(
      name,
      email,
      newPassword,
      confirmPassword,
      currentPassword,
    );
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setMessage({
          type: "error",
          text: "Sesi admin tidak ditemukan. Silakan login lagi.",
        });
        return;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          newEmail: email.trim() !== originalEmail ? email.trim() : undefined,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save settings");

      if (email.trim() !== originalEmail) {
        const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
        adminUser.email = email.trim();
        localStorage.setItem("adminUser", JSON.stringify(adminUser));
        setOriginalEmail(email.trim());
      }

      setMessage({
        type: "success",
        text: data?.message || "Pengaturan berhasil disimpan",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error(err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan pengaturan",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (
    setName: (name: string) => void,
    setEmail: (email: string) => void,
    setMessage: (msg: MessageState | null) => void,
  ) => {
    setMessage(null);
    setName("");
    setEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleSave,
    handleCancel,
  };
}
