import { NextRequest, NextResponse } from "next/server";

interface SummaryBrief {
  nisn: string;
  nama: string;
  kelas?: string;
  monthKey?: string;
  monthLabel?: string;
}

interface SummaryResponse {
  summaries?: SummaryBrief[];
  selectedMonth?: string | null;
}

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: SummaryBrief[]): string {
  const header = ["NISN", "Nama", "Kelas", "Bulan"];
  const lines = rows.map((row) =>
    [
      row.nisn || "-",
      row.nama || "-",
      row.kelas || "-",
      row.monthLabel || row.monthKey || "-",
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(","),
  );

  // Prefix BOM so Excel opens UTF-8 content correctly.
  return `\uFEFF${header.join(",")}\n${lines.join("\n")}`;
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get("month")?.trim();
  if (month && !MONTH_PATTERN.test(month)) {
    return NextResponse.json(
      { error: "Format month tidak valid. Gunakan YYYY-MM." },
      { status: 400 },
    );
  }

  try {
    const summaryUrl = new URL("/api/admin/kegiatan/summary", request.url);
    if (month) {
      summaryUrl.searchParams.set("month", month);
    }

    const summaryResponse = await fetch(summaryUrl.toString(), {
      headers: { Authorization: token },
      cache: "no-store",
    });

    if (!summaryResponse.ok) {
      const upstreamError = await summaryResponse.json().catch(() => null);
      return NextResponse.json(
        { error: upstreamError?.error || "Gagal mengambil data rekap." },
        { status: summaryResponse.status },
      );
    }

    const data: SummaryResponse = await summaryResponse.json();
    const selectedMonth = month || data.selectedMonth || "all";
    const rows = (data.summaries || []).filter((row) => {
      if (!month) return true;
      return row.monthKey === month;
    });

    const csv = toCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=penilaian_${selectedMonth}.csv`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/admin/sheets/export] error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat CSV." },
      { status: 500 },
    );
  }
}
