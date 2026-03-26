"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../layouts/sidebar";
import AdminNavbar from "../layouts/navbar";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import {
  SummaryTable,
  SummaryDetailModal,
  useSummaryData,
} from "@/app/components/dashboard/admin/kegiatan/summary/bulanan";
import {
  SemesterTable,
  SemesterDetailModal,
  useSemesterData,
} from "@/app/components/dashboard/admin/kegiatan/summary/semester";

import { Student } from "./types";
import DashboardHeader from "./header/DashboardHeader";
import StatusCards from "./cards/StatusCards";
import StudentList from "./students/StudentList";

const SUPER_ADMIN_EMAIL = "smkn31jktdev@gmail.com";

const normalizeIdentity = (value?: string | null): string =>
  value?.trim().toLowerCase() ?? "";

const normalizeName = (value?: string | null): string =>
  normalizeIdentity(value)
    .replace(
      /\b(mr|mrs|ms|dr|prof|bpk|ibu|pak|bu|ust|ustadz|ustadzah|hj|h\.)\b/g,
      "",
    )
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeRole = (role?: string | null): string =>
  normalizeIdentity(role)
    .replace(/[\s-]+/g, "_")
    .trim();

const isSuperAdminRole = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === "super_admin" || normalized === "superadmin";
};

const isSuperAdminEmail = (email?: string | null): boolean =>
  normalizeIdentity(email) === SUPER_ADMIN_EMAIL;

const belongsToAdmin = (
  walas?: string | null,
  adminName?: string | null,
): boolean => {
  const normalizedWalas = normalizeName(walas);
  const normalizedAdminName = normalizeName(adminName);

  if (!normalizedWalas || !normalizedAdminName) {
    return false;
  }

  if (normalizedWalas === normalizedAdminName) {
    return true;
  }

  return (
    normalizedWalas.includes(normalizedAdminName) ||
    normalizedAdminName.includes(normalizedWalas)
  );
};

export default function DashboardContainer() {
  const router = useRouter();

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/admin?expired=1",
    tokenKey: "adminToken",
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [adminLoading, setAdminLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const intervalsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    summaries,
    summaryLoading,
    summaryMonths,
    selectedSummaryMonth,
    selectedSummary,
    isSummaryModalOpen,
    handleSummaryMonthChange,
    openSummaryModal,
    closeSummaryModal,
  } = useSummaryData();

  const {
    semesterSummaries,
    loading: semesterLoading,
    semesterOptions,
    selectedSemester,
    selectedDetail: selectedSemesterDetail,
    isDetailOpen: isSemesterDetailOpen,
    handleSemesterChange,
    openDetail: openSemesterDetail,
    closeDetail: closeSemesterDetail,
  } = useSemesterData();

  const isSuperAdmin = useMemo(
    () => isSuperAdminRole(adminRole) || isSuperAdminEmail(adminEmail),
    [adminRole, adminEmail],
  );

  const filteredSummaries = useMemo(
    () =>
      isSuperAdmin
        ? summaries
        : summaries.filter((summary) =>
            belongsToAdmin(summary.walas, adminName),
          ),
    [isSuperAdmin, summaries, adminName],
  );

  const filteredSemesterSummaries = useMemo(
    () =>
      isSuperAdmin
        ? semesterSummaries
        : semesterSummaries.filter((summary) =>
            belongsToAdmin(summary.walas, adminName),
          ),
    [isSuperAdmin, semesterSummaries, adminName],
  );

  const filteredSelectedSummary = useMemo(() => {
    if (!selectedSummary) {
      return null;
    }
    return isSuperAdmin || belongsToAdmin(selectedSummary.walas, adminName)
      ? selectedSummary
      : null;
  }, [selectedSummary, isSuperAdmin, adminName]);

  const filteredSelectedSemesterDetail = useMemo(() => {
    if (!selectedSemesterDetail) {
      return null;
    }
    return isSuperAdmin ||
      belongsToAdmin(selectedSemesterDetail.walas, adminName)
      ? selectedSemesterDetail
      : null;
  }, [selectedSemesterDetail, isSuperAdmin, adminName]);

  useEffect(() => {
    let isMounted = true;

    const fetchAdmin = async (): Promise<{
      nama: string;
      email: string;
      role?: string;
    } | null> => {
      try {
        setAdminLoading(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/page/login/admin");
          return null;
        }

        const response = await fetch("/api/auth/admin/me", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("adminToken");
            router.push("/page/login/admin");
          }
          throw new Error("Failed to authenticate admin");
        }

        const data = await response.json();
        if (isMounted) {
          setAdminName(data.user.nama);
          setAdminEmail(data.user.email);
          setAdminRole(data.user.role ?? "");
        }
        return {
          nama: data.user.nama,
          email: data.user.email,
          role: data.user.role,
        };
      } catch (error) {
        console.error("Error fetching admin:", error);
        return null;
      } finally {
        if (isMounted) setAdminLoading(false);
      }
    };

    const fetchStudents = async (
      admin: { nama: string; email: string; role?: string } | null,
      isBackground = false,
    ) => {
      try {
        if (!isBackground) {
          setStudentsLoading(true);
        }
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/page/login/admin");
          return;
        }

        const response = await fetch("/api/admin/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("adminToken");
            router.push("/page/login/admin");
          }
          throw new Error("Failed to fetch students");
        }

        if (isMounted) {
          const data = await response.json();
          const allStudents: Student[] = Array.isArray(data.data)
            ? data.data
            : [];

          const isSuperAdmin =
            isSuperAdminRole(admin?.role) || isSuperAdminEmail(admin?.email);

          // Super admin sees all students; other admins (wali kelas) see only their students
          const filtered = isSuperAdmin
            ? allStudents
            : allStudents.filter((s) => belongsToAdmin(s.walas, admin?.nama));

          setStudents(filtered);
          setStudentCount(filtered.length);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        if (isMounted && !isBackground) {
          setStudentsLoading(false);
        }
      }
    };

    fetchAdmin().then((admin) => {
      fetchStudents(admin, false);

      const interval = setInterval(() => fetchStudents(admin, true), 300000);
      intervalsRef.current = interval;
    });

    return () => {
      isMounted = false;
      if (intervalsRef.current) clearInterval(intervalsRef.current);
    };
  }, [router]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () =>
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

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
            <DashboardHeader />

            <div className="flex flex-col gap-6 xl:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex-1 space-y-6">
                <StatusCards
                  adminName={adminName}
                  adminEmail={adminEmail}
                  studentCount={studentCount}
                  adminLoading={adminLoading}
                />

                <SummaryTable
                  summaries={filteredSummaries}
                  summaryLoading={summaryLoading}
                  summaryMonths={summaryMonths}
                  selectedSummaryMonth={selectedSummaryMonth}
                  onMonthChange={handleSummaryMonthChange}
                  onSelectSummary={openSummaryModal}
                />

                <SemesterTable
                  summaries={filteredSemesterSummaries}
                  loading={semesterLoading}
                  semesterOptions={semesterOptions}
                  selectedSemester={selectedSemester}
                  onSemesterChange={handleSemesterChange}
                  onSelectSummary={openSemesterDetail}
                />
              </div>

              <StudentList
                students={students}
                studentsLoading={studentsLoading}
              />
            </div>
          </div>
        </main>
      </div>

      {isSummaryModalOpen && filteredSelectedSummary && (
        <SummaryDetailModal
          summary={filteredSelectedSummary}
          onClose={closeSummaryModal}
        />
      )}

      {isSemesterDetailOpen && filteredSelectedSemesterDetail && (
        <SemesterDetailModal
          summary={filteredSelectedSemesterDetail}
          onClose={closeSemesterDetail}
        />
      )}
    </div>
  );
}
