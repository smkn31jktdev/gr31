"use client";

import { useState } from "react";
import AdminSidebar from "../layouts/sidebar";
import AdminNavbar from "../layouts/navbar";
import TambahSiswaHeader from "./header/TambahSiswaHeader";
import TambahSiswaForm from "./form/TambahSiswaForm";

export default function TambahSiswaContainer() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            <TambahSiswaHeader />
            <div className="w-full">
              <TambahSiswaForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
