"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/app/components/dashboard/student/sidebar";
import StudentNavbar from "@/app/components/dashboard/student/navbar";
import { useGeolocation } from "@/app/components/dashboard/student/kegiatan/daily/useGeolocation";
import { ReasonModal } from "@/app/components/dashboard/student/kegiatan/daily/ReasonModal";
import { FloatingChat } from "@/app/components/dashboard/student/chat";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import DashboardHeader from "@/app/components/dashboard/student/dashboard/header/DashboardHeader";
import ProfileCard from "@/app/components/dashboard/student/dashboard/profile/ProfileCard";
import ProgressCard from "@/app/components/dashboard/student/dashboard/progress/ProgressCard";
import ActivitiesList from "@/app/components/dashboard/student/dashboard/activities/ActivitiesList";

interface KegiatanData {
  bangunPagi?: {
    jam: string;
    membacaDanBangunTidur: boolean;
  };
  tidur?: {
    jam: string;
    membacaDanMasTidur: boolean;
  };
  beribadah?: {
    berdoaUntukDiriDanOrtu?: boolean;
    sholatFajar?: boolean;
    sholatLimaWaktuBerjamaah?: boolean;
    zikirSesudahSholat?: boolean;
    sholatDhuha?: boolean;
    sholatSunahRawatib?: boolean;
    zakatInfaqSedekah?: string;
  };
  makanSehat?: {
    jenisMakanan: string;
    jenisLaukSayur: string;
    minumSuplemen: boolean;
  };
  olahraga?: {
    deskripsi: string;
    waktu: string;
  };
  bermasyarakat?: {
    deskripsi: string;
    tempat: string;
    waktu: string;
    paraf: boolean;
  };
  belajar?: {
    yaAtauTidak: boolean;
    deskripsi: string;
  };
}

type KegiatanBeribadah = NonNullable<KegiatanData["beribadah"]>;

const BERIBADAH_BOOLEAN_KEYS: Array<
  Exclude<keyof KegiatanBeribadah, "zakatInfaqSedekah">
> = [
  "berdoaUntukDiriDanOrtu",
  "sholatFajar",
  "sholatLimaWaktuBerjamaah",
  "zikirSesudahSholat",
  "sholatDhuha",
  "sholatSunahRawatib",
];

export default function StudentDashboard() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [kegiatan, setKegiatan] = useState<KegiatanData | null>(null);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(true);
  const [studentData, setStudentData] = useState<{
    nama: string;
    nisn: string;
    kelas: string;
  } | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  const {
    isInsideSchoolBounds,
    locationMessage,
    isDevToolsOpen,
    isLoadingLocation,
    verifyLocation,
  } = useGeolocation();

  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [kehadiranStatus, setKehadiranStatus] = useState<{
    status: "hadir" | "tidak_hadir" | "belum";
    alasanTidakHadir?: string;
  }>({ status: "belum" });
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (snackbar) {
      setSnackbarVisible(true);
      const timer = setTimeout(() => setSnackbarVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  const submitReason = async (reasonText: string) => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        router.push("/page/login/siswa");
        return;
      }

      const today = new Date();
      const tanggal = today.toISOString().split("T")[0];

      const response = await fetch("/api/student/kehadiran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tanggal,
          kehadiran: {
            status: "tidak_hadir",
            alasanTidakHadir: reasonText,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan kehadiran");
      }

      setKehadiranStatus({
        status: "tidak_hadir",
        alasanTidakHadir: reasonText,
      });
      setSnackbar({
        message: data.message || "Data kehadiran berhasil disimpan",
        type: "success",
      });
    } catch (error) {
      setSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan data kehadiran",
        type: "error",
      });
    } finally {
      setIsReasonModalOpen(false);
    }
  };

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/siswa?expired=1",
    tokenKey: "studentToken",
  });

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("id-ID", options));
  }, []);

  const fetchKegiatanHariIni = useCallback(async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        router.push("/page/login/siswa");
        return;
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayString = `${year}-${month}-${day}`;
      const response = await fetch(
        `/api/student/kegiatan?tanggal=${todayString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch kegiatan");
      }

      const data = await response.json();
      setKegiatan((data.kegiatan as KegiatanData) || {});
    } catch (error) {
      console.error("Error fetching kegiatan:", error);
      setKegiatan({} as KegiatanData);
    } finally {
      setIsLoadingKegiatan(false);
    }
  }, [router]);

  const fetchStudentData = useCallback(async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        router.push("/page/login/siswa");
        return;
      }

      const response = await fetch("/api/auth/student/me", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      setStudentData({
        nama: data.student.nama,
        nisn: data.student.nisn,
        kelas: data.student.kelas,
      });
    } catch (error) {
      console.error("Error fetching student data:", error);
      router.push("/page/login/siswa");
    } finally {
      setIsLoadingStudent(false);
    }
  }, [router]);

  const getActivities = () => {
    if (!kegiatan) return [];

    const activities = [];

    // Bangun Pagi
    if (kegiatan.bangunPagi?.jam) {
      activities.push({
        name: "Bangun Pagi",
        time: `Jam ${kegiatan.bangunPagi.jam}`,
        completed: true,
      });
    } else {
      activities.push({
        name: "Bangun Pagi",
        time: "--:--",
        completed: false,
      });
    }

    // Beribadah
    const beribadahData = kegiatan.beribadah;
    const hasBeribadah = beribadahData
      ? BERIBADAH_BOOLEAN_KEYS.some((key) => Boolean(beribadahData[key])) ||
        Boolean(beribadahData.zakatInfaqSedekah)
      : false;
    if (hasBeribadah) {
      activities.push({
        name: "Beribadah",
        time: "Tercatat",
        completed: true,
      });
    } else {
      activities.push({
        name: "Beribadah",
        time: "-",
        completed: false,
      });
    }

    // Makan Sehat
    if (
      kegiatan.makanSehat?.jenisMakanan ||
      kegiatan.makanSehat?.jenisLaukSayur
    ) {
      let desc = "Tercatat";
      const mealTypeMap: Record<string, string> = {
        sahur: "Sahur",
        sarapan: "Sarapan",
        siang: "Siang",
        malam: "Malam",
      };
      if (kegiatan.makanSehat.jenisMakanan) {
        desc =
          mealTypeMap[kegiatan.makanSehat.jenisMakanan] ||
          kegiatan.makanSehat.jenisMakanan;
      }

      activities.push({
        name: "Makan Sehat",
        time: desc,
        completed: true,
      });
    } else {
      activities.push({
        name: "Makan Sehat",
        time: "-",
        completed: false,
      });
    }

    // Olahraga
    if (kegiatan.olahraga?.deskripsi) {
      activities.push({
        name: "Olahraga",
        time: `${kegiatan.olahraga.waktu || "0"} menit`,
        completed: true,
      });
    } else {
      activities.push({
        name: "Olahraga",
        time: "-",
        completed: false,
      });
    }

    // Belajar
    if (kegiatan.belajar?.yaAtauTidak) {
      activities.push({
        name: "Belajar",
        time: "Tercatat",
        completed: true,
      });
    } else {
      activities.push({
        name: "Belajar",
        time: "-",
        completed: false,
      });
    }

    // Bermasyarakat
    if (kegiatan.bermasyarakat?.deskripsi) {
      activities.push({
        name: "Bermasyarakat",
        time: "Tercatat",
        completed: true,
      });
    } else {
      activities.push({
        name: "Bermasyarakat",
        time: "-",
        completed: false,
      });
    }

    // Tidur
    if (kegiatan.tidur?.jam) {
      activities.push({
        name: "Tidur",
        time: `Jam ${kegiatan.tidur.jam}`,
        completed: true,
      });
    } else {
      activities.push({
        name: "Tidur",
        time: "--:--",
        completed: false,
      });
    }

    return activities;
  };

  const fetchKehadiranHariIni = useCallback(async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) return;

      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      const response = await fetch(
        `/api/student/kehadiran?tanggal=${todayString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.kehadiran) {
          setKehadiranStatus({
            status: data.kehadiran.status,
            alasanTidakHadir: data.kehadiran.alasanTidakHadir || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching kehadiran:", error);
    }
  }, []);

  useEffect(() => {
    fetchKegiatanHariIni();
    fetchStudentData();
    fetchKehadiranHariIni();
  }, [fetchKegiatanHariIni, fetchStudentData, fetchKehadiranHariIni]);

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
    <div className="flex h-screen bg-gray-50 font-poppins text-gray-800">
      {/* Sidebar */}
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <StudentNavbar
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full mx-auto space-y-6">
            <DashboardHeader currentDate={currentDate} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfileCard
                studentData={studentData}
                isLoadingStudent={isLoadingStudent}
              />
              <ProgressCard
                activities={getActivities()}
                isLoadingKegiatan={isLoadingKegiatan}
              />
            </div>

            <ActivitiesList
              activities={getActivities()}
              isLoadingKegiatan={isLoadingKegiatan}
              locationMessage={locationMessage}
              isLoadingLocation={isLoadingLocation}
              isInsideSchoolBounds={isInsideSchoolBounds}
              isDevToolsOpen={isDevToolsOpen}
              verifyLocation={verifyLocation}
              kehadiranStatus={kehadiranStatus}
              onOpenReasonModal={() => setIsReasonModalOpen(true)}
            />
          </div>
        </main>
      </div>

      <ReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        onSubmit={submitReason}
      />

      {/* Snackbar Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 transform transition-all duration-300 z-[100] ${
          snackbarVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"
        }`}
      >
        {snackbar && (
          <div
            className={`px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border ${
              snackbar.type === "success"
                ? "bg-white text-emerald-600 border-emerald-100"
                : "bg-white text-rose-600 border-rose-100"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                snackbar.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="font-medium text-sm text-gray-800">
              {snackbar.message}
            </span>
          </div>
        )}
      </div>

      <FloatingChat />
    </div>
  );
}
