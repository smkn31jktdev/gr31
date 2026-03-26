"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AdminNavbar from "../layouts/navbar";
import AdminSidebar from "../layouts/sidebar";
import {
  FeedbackState,
  MonthOption,
  PendingDelete,
  StudentOption,
  StudentResponse,
} from "./types";
import DeleteHeader from "./header/DeleteHeader";
import DeleteForm from "./form/DeleteForm";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";

export default function DeleteContainer() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  useEffect(() => {
    if (!isLoadingStudents) {
      return;
    }

    const failSafeId = window.setTimeout(() => {
      if (!isMountedRef.current) {
        return;
      }
      setIsLoadingStudents(false);
      setFeedback(
        (prev) =>
          prev ?? {
            type: "error",
            text: "Memuat daftar siswa terlalu lama. Periksa koneksi ke backend lalu coba ulang.",
          },
      );
    }, 15000);

    return () => window.clearTimeout(failSafeId);
  }, [isLoadingStudents]);

  useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          if (active && isMountedRef.current) {
            setFeedback({
              type: "error",
              text: "Token admin tidak ditemukan. Silakan login kembali.",
            });
          }
          return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 12000);

        let response: Response;
        let payload: unknown = {};
        try {
          response = await fetch("/api/admin/students", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          payload = await response.json().catch(() => ({}));
        } finally {
          window.clearTimeout(timeoutId);
        }

        if (!response.ok) {
          const payloadError = (payload as { error?: string })?.error;
          throw new Error(payloadError || "Gagal mengambil daftar siswa");
        }

        const payloadMap = payload as {
          students?: unknown;
          data?: unknown;
        };

        const studentRows = Array.isArray(payloadMap.students)
          ? payloadMap.students
          : Array.isArray(payloadMap.data)
            ? payloadMap.data
            : null;

        if (!Array.isArray(studentRows)) {
          throw new Error("Format respons siswa tidak valid");
        }

        if (!active || !isMountedRef.current) {
          return;
        }

        const mappedStudents: StudentOption[] = studentRows.map(
          (student: StudentResponse) => ({
            value: student.nisn,
            label: student.nama,
            description: `${student.kelas || "-"} • NISN ${student.nisn}`,
            nama: student.nama,
            kelas: student.kelas,
            nisn: student.nisn,
          }),
        );

        setStudents(mappedStudents);
      } catch (error) {
        if (!active || !isMountedRef.current) {
          return;
        }

        const message =
          error instanceof Error
            ? error.name === "AbortError"
              ? "Permintaan daftar siswa timeout. Cek koneksi backend/API lalu coba lagi."
              : error.message
            : "Terjadi kesalahan saat memuat daftar siswa.";
        setFeedback({ type: "error", text: message });
      } finally {
        if (active && isMountedRef.current) {
          setIsLoadingStudents(false);
        }
      }
    };

    void fetchStudents();

    return () => {
      active = false;
    };
  }, []);

  const fetchMonthsForStudent = useCallback(
    async (nisn: string, options: { clearFeedback?: boolean } = {}) => {
      if (options.clearFeedback) {
        setFeedback(null);
      }

      setIsLoadingMonths(true);
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          if (isMountedRef.current) {
            setFeedback({
              type: "error",
              text: "Token admin tidak ditemukan. Silakan login kembali.",
            });
          }
          return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 12000);

        let response: Response;
        let payload: unknown = {};
        try {
          response = await fetch(
            `/api/admin/delete?nisn=${encodeURIComponent(nisn)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          payload = await response.json().catch(() => ({}));
        } finally {
          window.clearTimeout(timeoutId);
        }

        if (!response.ok) {
          const payloadError = (payload as { error?: string })?.error;
          throw new Error(payloadError || "Gagal mengambil data bulan");
        }

        const payloadMap = payload as {
          months?: unknown;
          data?: unknown;
        };

        const rawMonths = Array.isArray(payloadMap.months)
          ? payloadMap.months
          : Array.isArray(payloadMap.data)
            ? payloadMap.data
            : [];

        const monthsData: MonthOption[] = rawMonths.map(
          (month: { key?: string; label?: string; entryCount?: number }) => ({
            key: month.key || "",
            label: month.label || month.key || "",
            entryCount:
              typeof month.entryCount === "number" ? month.entryCount : 0,
          }),
        );

        if (!isMountedRef.current) {
          return;
        }

        setMonths(monthsData);

        if (options.clearFeedback) {
          if (monthsData.length === 0) {
            setFeedback({
              type: "info",
              text: "Tidak ada data kegiatan untuk siswa ini.",
            });
          } else {
            setFeedback(null);
          }
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        setMonths([]);

        const message =
          error instanceof Error
            ? error.name === "AbortError"
              ? "Permintaan data bulan timeout. Cek koneksi backend/API lalu coba lagi."
              : error.message
            : "Terjadi kesalahan saat mengambil data bulan.";
        setFeedback({ type: "error", text: message });
      } finally {
        if (isMountedRef.current) {
          setIsLoadingMonths(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedStudent) {
      setMonths([]);
      setSelectedMonth("");
      return;
    }

    setSelectedMonth("");
    void fetchMonthsForStudent(selectedStudent, { clearFeedback: true });
  }, [selectedStudent, fetchMonthsForStudent]);

  const selectedStudentMeta = useMemo(
    () => students.find((student) => student.value === selectedStudent) ?? null,
    [students, selectedStudent],
  );

  const selectedMonthMeta = useMemo(
    () => months.find((month) => month.key === selectedMonth) ?? null,
    [months, selectedMonth],
  );

  const monthSelectOptions = useMemo(
    () =>
      months.map((month) => ({
        value: month.key,
        label: month.label,
        description: `${month.entryCount} catatan`,
      })),
    [months],
  );

  const feedbackClassName = useMemo(() => {
    if (!feedback) {
      return "";
    }

    if (feedback.type === "success") {
      return "border-green-200 bg-green-50 text-green-700";
    }
    if (feedback.type === "error") {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }
    return "border-blue-200 bg-blue-50 text-blue-700";
  }, [feedback]);

  const handleDeleteSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedStudent || !selectedMonth) {
        setFeedback({
          type: "error",
          text: "Pilih siswa dan bulan sebelum menghapus data.",
        });
        return;
      }

      const studentMeta = selectedStudentMeta;
      const monthMeta = selectedMonthMeta;

      const studentName = studentMeta?.nama || "siswa ini";
      const monthName = monthMeta?.label || selectedMonth;
      const entryCount = monthMeta?.entryCount || 0;

      setPendingDelete({
        studentName,
        monthName,
        entryCount,
      });
      setShowConfirmModal(true);
    },
    [selectedMonth, selectedMonthMeta, selectedStudent, selectedStudentMeta],
  );

  const confirmDelete = useCallback(async () => {
    setShowConfirmModal(false);

    if (!selectedStudent || !selectedMonth) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setFeedback({
        type: "error",
        text: "Token admin tidak ditemukan. Silakan login kembali.",
      });
      setPendingDelete(null);
      return;
    }

    const studentMeta = selectedStudentMeta;
    const monthMeta = selectedMonthMeta;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nisn: selectedStudent,
          month: selectedMonth,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Gagal menghapus data kegiatan.");
      }

      const deletedCount =
        typeof payload.deletedCount === "number" ? payload.deletedCount : 0;
      const successMessage =
        payload.message ||
        `Berhasil menghapus ${deletedCount} catatan kegiatan ${
          studentMeta?.nama ?? "siswa"
        } untuk bulan ${monthMeta?.label ?? selectedMonth}.`;

      setFeedback({ type: "success", text: successMessage });
      setSelectedMonth("");
      await fetchMonthsForStudent(selectedStudent);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus data kegiatan.";
      setFeedback({ type: "error", text: message });
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }, [
    fetchMonthsForStudent,
    selectedMonth,
    selectedMonthMeta,
    selectedStudent,
    selectedStudentMeta,
  ]);

  const cancelDelete = useCallback(() => {
    setShowConfirmModal(false);
    setPendingDelete(null);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
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
            <DeleteHeader />

            <div className="w-full">
              <DeleteForm
                students={students}
                selectedStudent={selectedStudent}
                setSelectedStudent={setSelectedStudent}
                isLoadingStudents={isLoadingStudents}
                selectedStudentMeta={selectedStudentMeta}
                months={monthSelectOptions}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                isLoadingMonths={isLoadingMonths}
                selectedMonthMeta={selectedMonthMeta}
                feedback={feedback}
                feedbackClassName={feedbackClassName}
                isDeleting={isDeleting}
                onSubmit={handleDeleteSubmit}
              />
            </div>
          </div>
        </main>
      </div>

      {showConfirmModal && pendingDelete && (
        <ConfirmDeleteModal
          pendingDelete={pendingDelete}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
