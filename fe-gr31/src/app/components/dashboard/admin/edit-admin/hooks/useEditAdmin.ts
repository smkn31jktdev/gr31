import { useState } from "react";
import { useSnackbar } from "notistack";
import type { AdminItem, EditFormState } from "../types";

export function useEditAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAdmin, setSelectedAdmin] = useState<AdminItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    nama: "",
    email: "",
    password: "",
  });

  const handleEditClick = (admin: AdminItem) => {
    setSelectedAdmin(admin);
    setEditForm({
      nama: admin.nama,
      email: admin.email,
      password: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setEditForm({
      nama: "",
      email: "",
      password: "",
    });
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateAdmin = async (
    event: React.FormEvent,
    setAdmins: React.Dispatch<React.SetStateAction<AdminItem[]>>,
  ) => {
    event.preventDefault();
    if (!selectedAdmin) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        enqueueSnackbar("Sesi berakhir. Silakan login ulang.", {
          variant: "error",
        });
        return;
      }

      const payload: Record<string, string> = {
        nama: editForm.nama.trim(),
        email: editForm.email.trim(),
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const response = await fetch(`/api/admin/admins/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui data admin");
      }

      enqueueSnackbar("Data admin berhasil diperbarui", {
        variant: "success",
      });

      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === selectedAdmin.id
            ? {
                ...admin,
                nama: payload.nama,
                email: payload.email,
              }
            : admin,
        ),
      );

      closeModal();
    } catch (err) {
      console.error("Update admin error:", err);
      enqueueSnackbar(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui data",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedAdmin,
    isModalOpen,
    isSubmitting,
    editForm,
    handleEditClick,
    closeModal,
    handleFormChange,
    handleUpdateAdmin,
  };
}
