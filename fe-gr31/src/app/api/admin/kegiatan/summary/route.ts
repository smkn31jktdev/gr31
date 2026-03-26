import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

const INDICATOR_DEFINITIONS = [
  { id: "bangunPagi", label: "Bangun Pagi" },
  { id: "tidur", label: "Tidur" },
  { id: "beribadah", label: "Beribadah" },
  { id: "makanSehat", label: "Makan Sehat" },
  { id: "olahraga", label: "Olahraga" },
  { id: "bermasyarakat", label: "Bermasyarakat" },
  { id: "belajar", label: "Belajar" },
] as const;

function computeRating(section: Record<string, unknown> | undefined): number {
  if (!section || typeof section !== "object") return 0;

  const values = Object.values(section);
  if (values.length === 0) return 0;

  let filled = 0;
  for (const v of values) {
    if (v === true) filled++;
    else if (typeof v === "string" && v.trim() !== "" && v !== "00:00")
      filled++;
    else if (typeof v === "number" && v > 0) filled++;
  }

  const ratio = filled / values.length;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  if (ratio > 0) return 1;
  return 0;
}

function computeNote(section: Record<string, unknown> | undefined): string {
  if (!section) return "Belum diisi";
  const rating = computeRating(section);
  if (rating === 0) return "Belum diisi";
  if (rating >= 4) return "Sangat Baik";
  if (rating >= 3) return "Baik";
  if (rating >= 2) return "Cukup";
  return "Kurang";
}

function getMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-");
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
  const monthIndex = parseInt(monthStr, 10) - 1;
  return `${monthNames[monthIndex]} ${yearStr}`;
}

interface RawKegiatanRow {
  nisn: string;
  nama: string;
  kelas: string;
  walas?: string;
  tanggal: string;
  [key: string]: unknown;
}

interface IndicatorSummary {
  id: string;
  label: string;
  rating: number;
  note: string;
}

interface StudentMonthSummary {
  nisn: string;
  nama: string;
  kelas: string;
  walas: string;
  monthLabel: string;
  monthKey: string;
  indicators: IndicatorSummary[];
}

function buildSummaries(
  rows: RawKegiatanRow[],
  monthKey: string,
): StudentMonthSummary[] {
  const studentMap = new Map<
    string,
    {
      nisn: string;
      nama: string;
      kelas: string;
      walas: string;
      sectionAccum: Map<string, { totalRating: number; count: number }>;
    }
  >();

  for (const row of rows) {
    if (!studentMap.has(row.nisn)) {
      studentMap.set(row.nisn, {
        nisn: row.nisn,
        nama: row.nama,
        kelas: row.kelas,
        walas: (row.walas as string) ?? "",
        sectionAccum: new Map(),
      });
    }
    const entry = studentMap.get(row.nisn)!;
    entry.nama = row.nama;
    entry.kelas = row.kelas;

    for (const def of INDICATOR_DEFINITIONS) {
      const sectionData = row[def.id] as Record<string, unknown> | undefined;
      const rating = computeRating(sectionData);
      if (rating > 0) {
        const acc = entry.sectionAccum.get(def.id) ?? {
          totalRating: 0,
          count: 0,
        };
        acc.totalRating += rating;
        acc.count += 1;
        entry.sectionAccum.set(def.id, acc);
      }
    }
  }

  const summaries: StudentMonthSummary[] = [];

  for (const entry of studentMap.values()) {
    const indicators: IndicatorSummary[] = INDICATOR_DEFINITIONS.map((def) => {
      const acc = entry.sectionAccum.get(def.id);
      const avgRating = acc ? Math.round(acc.totalRating / acc.count) : 0;
      return {
        id: def.id,
        label: def.label,
        rating: avgRating,
        note: computeNote(
          avgRating > 0
            ? ({ _r: avgRating } as unknown as Record<string, unknown>)
            : undefined,
        ),
      };
    });

    for (const ind of indicators) {
      if (ind.rating === 0) ind.note = "Belum diisi";
      else if (ind.rating >= 4) ind.note = "Sangat Baik";
      else if (ind.rating >= 3) ind.note = "Baik";
      else if (ind.rating >= 2) ind.note = "Cukup";
      else ind.note = "Kurang";
    }

    summaries.push({
      nisn: entry.nisn,
      nama: entry.nama,
      kelas: entry.kelas,
      walas: entry.walas,
      monthLabel: getMonthLabel(monthKey),
      monthKey,
      indicators,
    });
  }

  summaries.sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
  return summaries;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedMonth = searchParams.get("month");
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const now = new Date();
    const targetMonth =
      requestedMonth ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [yearStr, monthStr] = targetMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0);
    const lastDayStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

    // Fetch raw kegiatan data from backend
    const params = new URLSearchParams({
      dari: firstDay,
      sampai: lastDayStr,
    });

    const backendResponse = await fetch(
      `${backendUrl}/v1/admin/kegiatan?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error:
            (errorData as { error?: string }).error ||
            "Gagal memuat data kegiatan",
        },
        { status: backendResponse.status },
      );
    }

    const rawData = (await backendResponse.json()) as {
      data?: RawKegiatanRow[];
      total?: number;
    };
    const rows: RawKegiatanRow[] = rawData.data || [];

    // Build summaries
    const summaries = buildSummaries(rows, targetMonth);

    // Determine available months (last 12 months)
    const availableMonths: { key: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      availableMonths.push({ key, label: getMonthLabel(key) });
    }

    return NextResponse.json({
      summaries,
      availableMonths,
      selectedMonth: targetMonth,
    });
  } catch (error) {
    console.error("[api/admin/kegiatan/summary] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses data rangkuman" },
      { status: 500 },
    );
  }
}
