"use client";

import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../layouts/sidebar";
import AdminNavbar from "../layouts/navbar";
import { useSnackbar } from "notistack";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { StudentItem, EditFormState } from "./types";
import EditSiswaHeader from "./header/EditSiswaHeader";
import EditSiswaTable from "./table/EditSiswaTable";
import EditSiswaModal from "./modal/EditSiswaModal";
import DeleteSiswaModal from "./modal/DeleteSiswaModal";

export default function EditSiswaContainer() {
  const { enqueueSnackbar } = useSnackbar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    nisn: "",
    nama: "",
    kelas: "",
    walas: "",
    password: "",
  });

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/admin?expired=1",
    tokenKey: "adminToken",
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Token admin tidak ditemukan. Silakan login kembali.");
          setStudents([]);
          return;
        }

        const response = await fetch("/api/admin/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Gagal memuat data siswa");
        }

        const data = (await response.json()) as {
          students?: StudentItem[];
          data?: StudentItem[];
        };

        const studentList = Array.isArray(data.students)
          ? data.students
          : Array.isArray(data.data)
            ? data.data
            : [];

        setStudents(studentList);
      } catch (err) {
        console.error("Fetch students error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data siswa",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return students;
    }

    const term = searchTerm.toLowerCase();
    return students.filter((student) => {
      return (
        student.nama.toLowerCase().includes(term) ||
        student.nisn.toLowerCase().includes(term) ||
        student.kelas.toLowerCase().includes(term) ||
        (student.walas?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [students, searchTerm]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleEditClick = (student: StudentItem) => {
    setSelectedStudent(student);
    setEditForm({
      nisn: student.nisn,
      nama: student.nama,
      kelas: student.kelas,
      walas: student.walas || "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedStudent(null);
    setEditForm({
      nisn: "",
      nama: "",
      kelas: "",
      walas: "",
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

  const handleUpdateStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStudent) {
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
        nisn: editForm.nisn.trim(),
        nama: editForm.nama.trim(),
        kelas: editForm.kelas.trim(),
        walas: editForm.walas.trim(),
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const response = await fetch(
        `/api/admin/students/${selectedStudent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui data siswa");
      }

      enqueueSnackbar("Data siswa berhasil diperbarui", {
        variant: "success",
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                nama: payload.nama,
                kelas: payload.kelas,
                nisn: payload.nisn,
                walas: payload.walas,
              }
            : student,
        ),
      );

      closeModal();
    } catch (err) {
      console.error("Update student error:", err);
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

  const handleDeleteClick = () => {
    if (!selectedStudent) {
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

  const handleConfirmDeleteStudent = async () => {
    if (!selectedStudent) {
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

      const response = await fetch(
        `/api/admin/students/${selectedStudent.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus siswa");
      }

      setStudents((prev) =>
        prev.filter((student) => student.id !== selectedStudent.id),
      );

      enqueueSnackbar("Siswa berhasil dihapus", {
        variant: "success",
      });

      closeModal();
    } catch (err) {
      console.error("Delete student error:", err);
      enqueueSnackbar(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus siswa",
        { variant: "error" },
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 overflow-auto bg-gray-50/50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <EditSiswaHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            <div className="w-full">
              <EditSiswaTable
                students={students}
                filteredStudents={filteredStudents}
                isLoading={isLoading}
                error={error}
                searchTerm={searchTerm}
                onEditClick={handleEditClick}
              />
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <EditSiswaModal
          selectedStudent={selectedStudent}
          editForm={editForm}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onFormChange={handleFormChange}
          onSubmit={handleUpdateStudent}
          onDeleteClick={handleDeleteClick}
        />
      )}

      {isDeleteConfirmOpen && (
        <DeleteSiswaModal
          selectedStudent={selectedStudent}
          isDeleting={isDeleting}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDeleteStudent}
        />
      )}
    </div>
  );
}
