import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

type SheetRow = {
  no: number;
  nisn: string;
  nama: string;
  kelas: string;
  periode: string;
  bangunPagi: number;
  beribadahBerdoa: number;
  beribadahSholatFajar: number;
  beribadahSholatLimaWaktu: number;
  beribadahZikir: number;
  beribadahSholatDhuha: number;
  beribadahSholatRawatib: number;
  beribadahZakat: number;
  olahraga: number;
  makanSehat: number;
  belajarKitabSuci: number;
  belajarBukuBacaan: number;
  belajarBukuPelajaran: number;
  belajarTugas: number;
  belajarNilai: number;
  bermasyarakat: number;
  tidurCepat: number;
  ramadhanTarawih?: number;
  ramadhanPuasa?: number;
  nilaiMaks: number;
  nilaiPerolehan: number;
  nilaiAkhir: number;
};

type RawKegiatanRow = {
  nisn?: string;
  nama?: string;
  kelas?: string;
  tanggal?: string;
  bangunPagi?: {
    jam?: string;
    membacaDanBangunTidur?: boolean;
  };
  tidur?: {
    jam?: string;
    membacaDanMasTidur?: boolean;
  };
  beribadah?: {
    berdoaUntukDiriDanOrtu?: boolean;
    sholatFajar?: boolean;
    subuh?: boolean;
    sholatLimaWaktuBerjamaah?: boolean;
    dzuhur?: boolean;
    ashar?: boolean;
    maghrib?: boolean;
    isya?: boolean;
    zikirSesudahSholat?: boolean;
    sholatDhuha?: boolean;
    sholatSunahRawatib?: boolean;
    zakatInfaqSedekah?: string | number;
  };
  olahraga?: {
    jenisOlahraga?: string;
    deskripsi?: string;
    waktu?: string | number;
  };
  makanSehat?: {
    jenisMakanan?: string;
    jenisLaukSayur?: string;
    makanSayurAtauBuah?: boolean;
    minumSuplemen?: boolean;
    deskripsi?: string;
  };
  belajar?: {
    yaAtauTidak?: boolean;
    deskripsi?: string;
  };
  bermasyarakat?: {
    deskripsi?: string;
    tempat?: string;
    waktu?: string;
    paraf?: boolean;
  };
  ramadhan?: {
    sholatTarawihWitir?: boolean;
    berpuasa?: boolean;
  };
};

const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const backendUrl = getBackendUrl();

const HEADER_ROW_BASE_START = [
  "NO",
  "NISN",
  "NAMA SISWA",
  "KELAS",
  "PERIODE",
  "1 Bangun Pagi",
  "2a Berdoa",
  "2b Sholat Fajar",
  "2c Sholat 5 Waktu",
  "2d Zikir & Doa",
  "2e Sholat Dhuha",
  "2f Sholat Rawatib",
  "2g Zakat / Infaq / Sedekah",
];

const HEADER_ROW_RAMADHAN = [
  "2h Berpuasa (Ramadhan)",
  "2i Tarawih & Witir (Ramadhan)",
];

const HEADER_ROW_BASE_END = [
  "3 Berolahraga",
  "4 Makan Sehat",
  "5a Membaca Kitab Suci",
  "5b Membaca Buku Bacaan",
  "5c Membaca Buku Pelajaran",
  "5d Mengerjakan Tugas / PR",
  "5e Nilai Belajar",
  "6 Bermasyarakat",
  "7 Tidur Cepat",
];

const HEADER_ROW_FOOTER = ["Nilai Maks", "Nilai Perolehan", "Nilai Akhir (%)"];

function safeParseDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function monthKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string): string {
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
  return `${monthNames[monthIndex] || monthStr} ${yearStr}`;
}

function ratingFromRatio(ratio: number): number {
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio > 0) return 2;
  return 1;
}

function ratioFromEntries(entries: RawKegiatanRow[], selector: (entry: RawKegiatanRow) => boolean): number {
  if (entries.length === 0) return 0;
  let count = 0;
  for (const entry of entries) {
    if (selector(entry)) count += 1;
  }
  return count / entries.length;
}

function normalizeBelajarText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasBelajarKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalizeBelajarText(text);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function buildSheetRows(rows: RawKegiatanRow[], monthKey: string): SheetRow[] {
  const perStudent = new Map<string, { nisn: string; nama: string; kelas: string; entries: RawKegiatanRow[] }>();

  for (const row of rows) {
    const nisn = (row.nisn || "").trim();
    if (!nisn) continue;
    const nama = (row.nama || "-").trim() || "-";
    const kelas = (row.kelas || "-").trim() || "-";

    if (!perStudent.has(nisn)) {
      perStudent.set(nisn, { nisn, nama, kelas, entries: [row] });
    } else {
      const existing = perStudent.get(nisn)!;
      existing.nama = nama;
      existing.kelas = kelas;
      existing.entries.push(row);
    }
  }

  const sorted = Array.from(perStudent.values()).sort((a, b) =>
    a.nama.localeCompare(b.nama, "id-ID"),
  );

  const output: SheetRow[] = [];
  let counter = 1;

  for (const student of sorted) {
    const entries = student.entries;

    const bangunPagi = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.bangunPagi?.jam) || Boolean(entry.bangunPagi?.membacaDanBangunTidur),
      ),
    );

    const beribadahBerdoa = ratingFromRatio(
      ratioFromEntries(entries, (entry) => Boolean(entry.beribadah?.berdoaUntukDiriDanOrtu)),
    );
    const beribadahSholatFajar = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.beribadah?.sholatFajar) || Boolean(entry.beribadah?.subuh),
      ),
    );
    const beribadahSholatLimaWaktu = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.beribadah?.sholatLimaWaktuBerjamaah) ||
        Boolean(entry.beribadah?.subuh) ||
        Boolean(entry.beribadah?.dzuhur) ||
        Boolean(entry.beribadah?.ashar) ||
        Boolean(entry.beribadah?.maghrib) ||
        Boolean(entry.beribadah?.isya),
      ),
    );
    const beribadahZikir = ratingFromRatio(
      ratioFromEntries(entries, (entry) => Boolean(entry.beribadah?.zikirSesudahSholat)),
    );
    const beribadahSholatDhuha = ratingFromRatio(
      ratioFromEntries(entries, (entry) => Boolean(entry.beribadah?.sholatDhuha)),
    );
    const beribadahSholatRawatib = ratingFromRatio(
      ratioFromEntries(entries, (entry) => Boolean(entry.beribadah?.sholatSunahRawatib)),
    );
    const beribadahZakat = ratingFromRatio(
      ratioFromEntries(entries, (entry) => {
        const value = entry.beribadah?.zakatInfaqSedekah;
        if (typeof value === "number") return value > 0;
        if (typeof value === "string") return value.trim() !== "" && value.trim() !== "0";
        return false;
      }),
    );

    const olahraga = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.olahraga?.deskripsi) ||
        Boolean(entry.olahraga?.jenisOlahraga) ||
        Boolean(entry.olahraga?.waktu),
      ),
    );

    const makanSehat = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.makanSehat?.jenisMakanan) ||
        Boolean(entry.makanSehat?.jenisLaukSayur) ||
        Boolean(entry.makanSehat?.makanSayurAtauBuah) ||
        Boolean(entry.makanSehat?.minumSuplemen),
      ),
    );

    const belajarKitabSuci = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        hasBelajarKeyword(entry.belajar?.deskripsi || "", [
          "kitab suci",
          "alquran",
          "al quran",
          "alqur'an",
          "injil",
          "weda",
          "tripitaka",
        ]),
      ),
    );
    const belajarBukuBacaan = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        hasBelajarKeyword(entry.belajar?.deskripsi || "", [
          "buku bacaan",
          "novel",
          "hobby",
          "hobi",
          "sejarah",
        ]),
      ),
    );
    const belajarBukuPelajaran = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        hasBelajarKeyword(entry.belajar?.deskripsi || "", [
          "buku pelajaran",
          "mata pelajaran",
          "pelajaran",
        ]),
      ),
    );
    const belajarTugas = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        hasBelajarKeyword(entry.belajar?.deskripsi || "", [
          "mengerjakan tugas",
          "tugas",
          "pr",
          "pekerjaan rumah",
        ]),
      ),
    );
    const belajarNilai = ratingFromRatio(
      ratioFromEntries(entries, (entry) => Boolean(entry.belajar?.yaAtauTidak)),
    );

    const bermasyarakat = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.bermasyarakat?.deskripsi) ||
        Boolean(entry.bermasyarakat?.tempat) ||
        Boolean(entry.bermasyarakat?.waktu) ||
        Boolean(entry.bermasyarakat?.paraf),
      ),
    );

    const tidurCepat = ratingFromRatio(
      ratioFromEntries(entries, (entry) =>
        Boolean(entry.tidur?.jam) || Boolean(entry.tidur?.membacaDanMasTidur),
      ),
    );

    const ramadhanEntries = entries.filter((entry) => Boolean(entry.ramadhan));
    const hasRamadhanData = ramadhanEntries.length > 0;
    const ramadhanPuasa = hasRamadhanData
      ? ratingFromRatio(
          ratioFromEntries(ramadhanEntries, (entry) =>
            Boolean(entry.ramadhan?.berpuasa),
          ),
        )
      : undefined;
    const ramadhanTarawih = hasRamadhanData
      ? ratingFromRatio(
          ratioFromEntries(ramadhanEntries, (entry) =>
            Boolean(entry.ramadhan?.sholatTarawihWitir),
          ),
        )
      : undefined;

    const nilaiMaks = hasRamadhanData ? 100 : 90;
    let nilaiPerolehan =
      bangunPagi +
      beribadahBerdoa +
      beribadahSholatFajar +
      beribadahSholatLimaWaktu +
      beribadahZikir +
      beribadahSholatDhuha +
      beribadahSholatRawatib +
      beribadahZakat +
      olahraga +
      makanSehat +
      belajarKitabSuci +
      belajarBukuBacaan +
      belajarBukuPelajaran +
      belajarTugas +
      bermasyarakat +
      tidurCepat;

    if (hasRamadhanData && ramadhanPuasa && ramadhanTarawih) {
      nilaiPerolehan += ramadhanPuasa + ramadhanTarawih;
    }

    const nilaiAkhir = Math.round((nilaiPerolehan / nilaiMaks) * 100);

    output.push({
      no: counter,
      nisn: student.nisn,
      nama: student.nama,
      kelas: student.kelas,
      periode: formatMonthLabel(monthKey),
      bangunPagi,
      beribadahBerdoa,
      beribadahSholatFajar,
      beribadahSholatLimaWaktu,
      beribadahZikir,
      beribadahSholatDhuha,
      beribadahSholatRawatib,
      beribadahZakat,
      olahraga,
      makanSehat,
      belajarKitabSuci,
      belajarBukuBacaan,
      belajarBukuPelajaran,
      belajarTugas,
      belajarNilai,
      bermasyarakat,
      tidurCepat,
      ramadhanPuasa,
      ramadhanTarawih,
      nilaiMaks,
      nilaiPerolehan,
      nilaiAkhir,
    });

    counter += 1;
  }

  return output;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: SheetRow[]): string {
  const hasAnyRamadhanData = rows.some(
    (row) => row.ramadhanPuasa !== undefined && row.ramadhanTarawih !== undefined,
  );

  const headerRow = hasAnyRamadhanData
    ? [
        ...HEADER_ROW_BASE_START,
        ...HEADER_ROW_RAMADHAN,
        ...HEADER_ROW_BASE_END,
        ...HEADER_ROW_FOOTER,
      ]
    : [...HEADER_ROW_BASE_START, ...HEADER_ROW_BASE_END, ...HEADER_ROW_FOOTER];

  const matrix: string[][] = [];
  matrix.push([""]);
  matrix.push(headerRow.map(escapeCsvValue));

  for (const row of rows) {
    const baseStart = [
      row.no,
      row.nisn,
      row.nama,
      row.kelas,
      row.periode,
      row.bangunPagi,
      row.beribadahBerdoa,
      row.beribadahSholatFajar,
      row.beribadahSholatLimaWaktu,
      row.beribadahZikir,
      row.beribadahSholatDhuha,
      row.beribadahSholatRawatib,
      row.beribadahZakat,
    ];

    const ramadhan = hasAnyRamadhanData
      ? [row.ramadhanPuasa ?? "-", row.ramadhanTarawih ?? "-"]
      : [];

    const baseEnd = [
      row.olahraga,
      row.makanSehat,
      row.belajarKitabSuci,
      row.belajarBukuBacaan,
      row.belajarBukuPelajaran,
      row.belajarTugas,
      row.belajarNilai,
      row.bermasyarakat,
      row.tidurCepat,
    ];

    const footer = [row.nilaiMaks, row.nilaiPerolehan, row.nilaiAkhir];

    matrix.push([...baseStart, ...ramadhan, ...baseEnd, ...footer].map(escapeCsvValue));
  }

  // Prefix BOM so Excel opens UTF-8 content correctly.
  return `\uFEFF${matrix.map((row) => row.join(",")).join("\r\n")}`;
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
    const now = new Date();
    const selectedMonth =
      month ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr, 10);
    const monthNumber = parseInt(monthStr, 10);
    const firstDay = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
    const lastDay = new Date(year, monthNumber, 0);
    const lastDayStr = `${year}-${String(monthNumber).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

    const params = new URLSearchParams({
      dari: firstDay,
      sampai: lastDayStr,
    });

    const upstreamResponse = await fetch(
      `${backendUrl}/v1/admin/kegiatan?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        cache: "no-store",
      },
    );

    if (!upstreamResponse.ok) {
      const upstreamError = await upstreamResponse.json().catch(() => null);
      return NextResponse.json(
        { error: upstreamError?.error || "Gagal mengambil data rekap." },
        { status: upstreamResponse.status },
      );
    }

    const rawData = (await upstreamResponse.json()) as {
      data?: RawKegiatanRow[];
    };

    const monthRows = (rawData.data || []).filter((row) => {
      const parsedDate = safeParseDate(row.tanggal);
      if (!parsedDate) return false;
      return monthKeyFromDate(parsedDate) === selectedMonth;
    });

    const sheetRows = buildSheetRows(monthRows, selectedMonth);
    const csv = toCsv(sheetRows);

    const filename = `penilaian_akhir_${selectedMonth}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${filename}`,
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
