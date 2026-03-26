"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";
import UrlInput from "./UrlInput";
import InfoBlock from "./InfoBlock";
import ActionButtons from "./ActionButtons";
import PreviewTable from "./PreviewTable";
import { AdminRow } from "./types";

export default function AdminSheetsContainer() {
  const { enqueueSnackbar } = useSnackbar();
  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/1NgHOR1NWzE9KCfzmSZwwnJ7gcz-G8V0R1PrIfS-Nql0/edit?usp=sharing";
  const [rows, setRows] = useState<AdminRow[]>([]);
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

      const res = await fetch("/api/admin/tambah-admin/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sheetId, range: "B6:D" }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Sheets fetch failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      const values: string[][] = data.values || [];

      const mapped = values.map((r) => ({
        nama: r[0] ? String(r[0]).trim() : "",
        email: r[1] ? String(r[1]).trim() : "",
        password: r[2] ? String(r[2]).trim() : "",
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

      const res = await fetch("/api/admin/tambah-admin/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ admins: rows }),
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
      <div className="mb-8 md:mb-10 w-full text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Import Admin (Excel/Sheet)
        </h1>
        <p className="text-gray-500 text-sm md:text-base mx-auto md:mx-0">
          Import data admin secara massal dari Google Spreadsheet.
        </p>
      </div>
      <div className="w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="space-y-6">
            <InfoBlock />
            <UrlInput sheetUrl={sheetUrl} />
            <ActionButtons
              loading={loading}
              rowsCount={rows.length}
              onLoad={handleLoad}
              onImport={handleImport}
            />
            <PreviewTable rows={rows} />
          </div>
        </div>
      </div>
    </div>
  );
}
