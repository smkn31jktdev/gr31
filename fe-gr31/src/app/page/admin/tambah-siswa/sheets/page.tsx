"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/dashboard/admin/layouts/sidebar";
import AdminNavbar from "@/app/components/dashboard/admin/layouts/navbar";
import { SnackbarProvider } from "notistack";
import AdminSheetsContainer from "@/app/components/dashboard/admin/tambah-siswa/sheets/AdminSheetsContainer";

function SheetsImportLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((s) => !s);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((s) => !s);
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
          <AdminSheetsContainer />
        </main>
      </div>
    </div>
  );
}

export default function SheetsImportPage() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <SheetsImportLayout />
    </SnackbarProvider>
  );
}
