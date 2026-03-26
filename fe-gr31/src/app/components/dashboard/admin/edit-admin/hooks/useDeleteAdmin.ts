import { useState } from "react";
import { useSnackbar } from "notistack";
import type { AdminItem } from "../types";

export function useDeleteAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDeleteRequest = (selectedAdmin: AdminItem | null) => {
    if (!selectedAdmin) {
      return;
    }
    // Prevent deleting super admin
    if (selectedAdmin.email === "smkn31jktdev@gmail.com") {
      enqueueSnackbar("Super admin tidak dapat dihapus", { variant: "error" });
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteAdmin = async (
    selectedAdmin: AdminItem | null,
    setAdmins: React.Dispatch<React.SetStateAction<AdminItem[]>>,
    closeModal: () => void,
  ) => {
    if (!selectedAdmin) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        enqueueSnackbar("Sesi berakhir. Silakan login ulang.", {
          variant: "error",
        });
        return;
      }

      const response = await fetch(`/api/admin/admins/${selectedAdmin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus admin");
      }

      setAdmins((prev) =>
        prev.filter((admin) => admin.id !== selectedAdmin.id),
      );

      enqueueSnackbar("Admin berhasil dihapus", {
        variant: "success",
      });

      closeModal();
    } catch (err) {
      console.error("Delete admin error:", err);
      enqueueSnackbar(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus admin",
        { variant: "error" },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    handleDeleteRequest,
    handleCancelDelete,
    handleConfirmDeleteAdmin,
  };
}
