"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";
import SheetsHeader from "./header/SheetsHeader";
import SheetsGuide from "./guide/SheetsGuide";
import SheetsActions from "./actions/SheetsActions";
import SheetsTable from "./table/SheetsTable";
import { StudentRow } from "./types";

export default function AdminSheetsContainer() {
  const { enqueueSnackbar } = useSnackbar();
  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/1NgHOR1NWzE9KCfzmSZwwnJ7gcz-G8V0R1PrIfS-Nql0/edit?usp=sharing";

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  function extractSheetId(url: string) {
    try {
      const m = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }

  const handleLoad = async () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      enqueueSnackbar("Sheet ID tidak valid", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const res = await fetch("/api/admin/tambah-siswa/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sheetId, range: "B6:F" }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Sheets fetch failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      const values: string[][] = data.values || [];

      const mapped = values.map((r) => ({
        nisn: r[0] ? String(r[0]).trim() : "",
        nama: r[1] ? String(r[1]).trim() : "",
        kelas: r[2] ? String(r[2]).trim() : "",
        walas: r[3] ? String(r[3]).trim() : "",
        password: r[4] ? String(r[4]).trim() : "",
      }));

      setRows(mapped);
      enqueueSnackbar(`${mapped.length} baris berhasil dimuat`, {
        variant: "success",
      });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      enqueueSnackbar(`Gagal memuat sheet: ${message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!rows.length) {
      enqueueSnackbar("Tidak ada data untuk diimpor", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const res = await fetch("/api/admin/tambah-siswa/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ students: rows }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || JSON.stringify(j));
      enqueueSnackbar(j.message || "Import berhasil", { variant: "success" });
      setRows([]);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      enqueueSnackbar(`Import gagal: ${message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <SheetsHeader />
      <div className="w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="space-y-6">
            <SheetsGuide />
            <SheetsActions
              sheetUrl={sheetUrl}
              loading={loading}
              rowsCount={rows.length}
              onLoad={handleLoad}
              onImport={handleImport}
            />
            <SheetsTable rows={rows} />
          </div>
        </div>
      </div>
    </div>
  );
}
