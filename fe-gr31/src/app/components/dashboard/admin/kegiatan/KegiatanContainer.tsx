"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import AdminSidebar from "../layouts/sidebar";
import AdminNavbar from "../layouts/navbar";
import { useMonitoringData, useActiveTab } from "./hooks";
import { TabContent } from "./components";

export default function KegiatanContainer() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { isLoading, errorMessage, monitoringData } = useMonitoringData();
  const { activeTab } = useActiveTab();

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
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
          <div className="flex flex-col gap-6 p-6 h-full min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {isLoading && (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                Memuat data monitoring kegiatan...
              </div>
            )}

            <div className="flex-1 w-full relative min-h-150">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <div className="flex flex-col gap-6 w-full pb-10">
                    <TabContent
                      activeTabId={activeTab.id}
                      monitoringData={monitoringData}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
