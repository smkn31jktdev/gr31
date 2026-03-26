"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import AdminSidebar from "../layouts/sidebar";
import AdminNavbar from "../layouts/navbar";
import TambahAdminHeader from "./header/TambahAdminHeader";
import TambahAdminForm from "./form/TambahAdminForm";

export default function TambahAdminContainer() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("adminToken");
      if (!token) {
        enqueueSnackbar("Anda tidak memiliki akses ke halaman ini", {
          variant: "error",
        });
        setIsAllowed(false);
        router.replace("/page/admin");
        return;
      }

      try {
        const res = await fetch("/api/auth/admin/me", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          enqueueSnackbar("Anda tidak memiliki akses ke halaman ini", {
            variant: "error",
          });
          router.replace("/page/login/admin");
          return;
        }
        const data = await res.json();
        if (data?.user?.email !== "smkn31jktdev@gmail.com") {
          enqueueSnackbar("Anda tidak memiliki akses ke halaman ini", {
            variant: "error",
          });
          setIsAllowed(false);
          router.replace("/login/admin");
          return;
        }
        setIsAllowed(true);
      } catch {
        enqueueSnackbar("Terjadi kesalahan autentikasi", { variant: "error" });
        setIsAllowed(false);
        router.replace("/page/admin");
      }
    };

    checkAuth();
  }, [router, enqueueSnackbar]);

  if (isAllowed === null) {
    return null;
  }

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
            <TambahAdminHeader />
            <div className="w-full">
              <TambahAdminForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
