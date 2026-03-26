"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/app/components/dashboard/student/sidebar";
import StudentNavbar from "@/app/components/dashboard/student/navbar";
import BuktiHeader from "./header/BuktiHeader";
import BuktiStudentInfo from "./info/BuktiStudentInfo";
import BuktiForm from "./form/BuktiForm";
import { StudentData, BuktiData } from "./types";

export default function BuktiSiswaContainer() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData>({
    nama: "",
    nisn: "",
    kelas: "",
  });

  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    foto: null as File | null,
    linkYouTube: "",
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [hasSubmittedThisMonth, setHasSubmittedThisMonth] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [submittedBukti, setSubmittedBukti] = useState<BuktiData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudentData = useCallback(async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        router.push("/page/login/siswa");
        return;
      }
      const response = await fetch("/api/auth/student/me", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setStudentData({
        nama: data.student.nama,
        nisn: data.student.nisn,
        kelas: data.student.kelas,
      });
    } catch {
      router.push("/page/login/siswa");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const checkExistingBukti = useCallback(async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) return;
      const now = new Date();
      const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const response = await fetch(`/api/student/bukti?bulan=${bulan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const singleBukti = data?.bukti || data?.data?.[0] || null;
      if (singleBukti) {
        setHasSubmittedThisMonth(true);
        setSubmittedBukti(singleBukti);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchStudentData();
    checkExistingBukti();

    const now = new Date();
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    setCurrentMonth(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
  }, [fetchStudentData, checkExistingBukti]);

  const loadImage = async (fotoPath: string) => {
    if (!fotoPath || !fotoPath.startsWith("/uploads/bukti/")) {
      setImageDataUrl(null);
      return;
    }
    setImageLoading(true);
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) return;
      const filename = fotoPath.split("/").pop();
      const response = await fetch(`/api/uploads/bukti/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      setImageDataUrl(dataUrl);
    } catch {
      setImageDataUrl(null);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (submittedBukti?.foto) {
      loadImage(submittedBukti.foto);
    }
  }, [submittedBukti]);

  useEffect(() => {
    if (snackbar) {
      setSnackbarVisible(true);
      const hideTimer = setTimeout(() => setSnackbarVisible(false), 3000);
      return () => clearTimeout(hideTimer);
    }
  }, [snackbar]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () =>
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSubmittedThisMonth) return;
    if (!formData.foto) {
      setSnackbar({ message: "Silakan upload foto bukti", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        router.push("/page/login/siswa");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("foto", formData.foto);
      formDataToSend.append("linkYouTube", formData.linkYouTube);

      const response = await fetch("/api/student/bukti", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan bukti");

      setSnackbar({ message: data.message, type: "success" });
      setHasSubmittedThisMonth(true);
      if (data?.bukti) {
        setSubmittedBukti(data.bukti);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Gagal";
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ foto: null, linkYouTube: "" });
    setFotoPreview(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, foto: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">
        <span className="loading loading-spinner loading-lg"></span> Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-poppins text-gray-800">
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentNavbar
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full mx-auto space-y-6">
            <BuktiHeader
              currentMonth={currentMonth}
              hasSubmittedThisMonth={hasSubmittedThisMonth}
              submittedBukti={submittedBukti}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BuktiStudentInfo studentData={studentData} />

              <BuktiForm
                formData={formData}
                setFormData={setFormData}
                fotoPreview={fotoPreview}
                handleFotoChange={handleFotoChange}
                handleSubmit={handleSubmit}
                handleReset={handleReset}
                isSubmitting={isSubmitting}
                hasSubmittedThisMonth={hasSubmittedThisMonth}
                submittedBukti={submittedBukti}
                imageLoading={imageLoading}
                imageDataUrl={imageDataUrl}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Snackbar */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 transform transition-all duration-300 z-[100] ${
          snackbarVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"
        }`}
      >
        {snackbar && (
          <div
            className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              snackbar.type === "success"
                ? "bg-gray-900 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <span>{snackbar.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
