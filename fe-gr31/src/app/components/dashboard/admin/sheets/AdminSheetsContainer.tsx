"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import AdminSidebar from "@/app/components/dashboard/admin/layouts/sidebar";
import AdminNavbar from "@/app/components/dashboard/admin/layouts/navbar";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SheetsHeader from "./header/SheetsHeader";
import SheetsControls from "./controls/SheetsControls";
import SheetsPreview from "./preview/SheetsPreview";
import { SummaryBrief, SummaryMonthOption, SummaryResponse } from "./types";

export default function AdminSheetsContainer() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<SummaryBrief[]>([]);
  const [availableMonths, setAvailableMonths] = useState<SummaryMonthOption[]>(
    [],
  );
  const [totalSummaries, setTotalSummaries] = useState(0);
  const monthRef = useRef<string | null>(null);

  const updateMonth = useCallback((value: string) => {
    monthRef.current = value;
    setMonth(value);
  }, []);

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/admin?expired=1",
    tokenKey: "adminToken",
  });

  const fetchSummaries = useCallback(
    async (monthOverride?: string | null) => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          return null;
        }

        const monthToFetch = monthOverride ?? monthRef.current ?? undefined;
        const endpoint = monthToFetch
          ? `/api/admin/kegiatan/summary?month=${encodeURIComponent(
              monthToFetch,
            )}`
          : "/api/admin/kegiatan/summary";

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch summaries:", res.status);
          return null;
        }

        const data: SummaryResponse = await res.json();
        setSummaries(data.summaries || []);
        setAvailableMonths(data.availableMonths || []);

        const totalCount =
          typeof data.totalRecords === "number"
            ? data.totalRecords
            : (data.summaries?.length ?? 0);
        setTotalSummaries(totalCount);

        if (monthOverride === undefined) {
          if (!monthRef.current) {
            const fallbackMonth =
              data.selectedMonth || data.availableMonths?.[0]?.key || "";
            if (fallbackMonth) {
              updateMonth(fallbackMonth);
            }
          } else if (
            monthRef.current &&
            data.availableMonths &&
            data.availableMonths.length > 0 &&
            !data.availableMonths.some(
              (option) => option.key === monthRef.current,
            )
          ) {
            const fallbackMonth = data.availableMonths[0].key;
            updateMonth(fallbackMonth);
            void fetchSummaries(fallbackMonth);
          }
        }

        return data;
      } catch (error) {
        console.error("Fetch summaries error:", error);
        return null;
      }
    },
    [updateMonth],
  );

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const currentMonthLabel = useMemo(() => {
    if (!month) {
      return "-";
    }
    const match = availableMonths.find((item) => item.key === month);
    return match?.label ?? month;
  }, [availableMonths, month]);

  const filteredSummaries = useMemo(() => {
    if (!month) return summaries;
    return summaries.filter((s) => s.monthKey === month);
  }, [month, summaries]);

  const downloadCsv = async () => {
    const selectedMonth = monthRef.current ?? month;

    if (!selectedMonth) {
      setMessage("Silakan pilih bulan terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setMessage("Sesi berakhir. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `/api/admin/sheets/export?month=${encodeURIComponent(selectedMonth)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setMessage(err?.error || `Gagal membuat file (${res.status})`);
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename =
        res.headers.get("Content-Disposition")?.split("filename=")[1] ||
        `penilaian_${selectedMonth}.csv`;
      a.download = filename.replace(/"/g, "");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("File berhasil diunduh.");
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan saat mengunduh file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          onToggleSidebar={() => setIsSidebarCollapsed((s) => !s)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((s) => !s)}
        />

        <main className="flex-1 overflow-auto bg-gray-50/50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <SheetsHeader />

            <div className="flex flex-col gap-6">
              <SheetsControls
                month={month}
                loading={loading}
                message={message}
                availableMonths={availableMonths}
                filteredSummariesLength={filteredSummaries.length}
                totalSummaries={totalSummaries}
                currentMonthLabel={currentMonthLabel}
                updateMonth={updateMonth}
                fetchSummaries={fetchSummaries}
                downloadCsv={downloadCsv}
                monthRefCurrent={monthRef.current}
              />

              <SheetsPreview
                summaries={summaries}
                filteredSummaries={filteredSummaries}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
