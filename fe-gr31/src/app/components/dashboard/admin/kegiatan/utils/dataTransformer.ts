import type { RawKegiatanRow, StudentBucket } from "../types";
import type { BangunStudent } from "../bangun";
import type { BeribadahStudent } from "../beribadah";
import type { MakanStudent } from "../makan";
import type { BelajarStudent } from "../belajar";
import type { BermasyarakatStudent } from "../bermasyarakat";
import type { OlahragaStudent } from "../olahraga";
import type { TidurStudent } from "../tidur";
import { toIsoDate, studentKey } from "./formatters";

export interface MonitoringState {
  bangun: BangunStudent[];
  beribadah: BeribadahStudent[];
  makan: MakanStudent[];
  belajar: BelajarStudent[];
  bermasyarakat: BermasyarakatStudent[];
  olahraga: OlahragaStudent[];
  tidur: TidurStudent[];
}

export const EMPTY_STATE: MonitoringState = {
  bangun: [],
  beribadah: [],
  makan: [],
  belajar: [],
  bermasyarakat: [],
  olahraga: [],
  tidur: [],
};

function upsertStudent<
  T extends { nisn: string; nama: string; kelas: string; entries: unknown[] },
>(map: Map<string, T>, base: StudentBucket, create: () => T): T {
  const key = studentKey(base.nisn, base.nama);
  const existing = map.get(key);
  if (existing) {
    existing.nama = base.nama;
    existing.kelas = base.kelas;
    return existing;
  }

  const created = create();
  map.set(key, created);
  return created;
}

function byName<T extends { nama: string }>(a: T, b: T): number {
  return a.nama.localeCompare(b.nama, "id-ID");
}

function sortEntriesByTanggal<T extends { tanggal: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const da = new Date(a.tanggal).getTime();
    const db = new Date(b.tanggal).getTime();
    if (Number.isNaN(da) && Number.isNaN(db)) {
      return a.tanggal.localeCompare(b.tanggal);
    }
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;
    return da - db;
  });
}

function sortStudentsEntries<T extends { entries: Array<{ tanggal: string }> }>(
  students: T[],
): T[] {
  return students.map((student) => ({
    ...student,
    entries: sortEntriesByTanggal(student.entries),
  }));
}

export function buildMonitoringState(rows: RawKegiatanRow[]): MonitoringState {
  const bangunMap = new Map<string, BangunStudent>();
  const beribadahMap = new Map<string, BeribadahStudent>();
  const makanMap = new Map<string, MakanStudent>();
  const belajarMap = new Map<string, BelajarStudent>();
  const bermasyarakatMap = new Map<string, BermasyarakatStudent>();
  const olahragaMap = new Map<string, OlahragaStudent>();
  const tidurMap = new Map<string, TidurStudent>();

  for (const row of rows) {
    const tanggal = row.tanggal || "";
    const normalizedDate = tanggal ? toIsoDate(tanggal) : "";

    const base: StudentBucket = {
      nisn: row.nisn || "-",
      nama: row.nama || "Tanpa Nama",
      kelas: row.kelas || "-",
    };

    if (row.bangunPagi) {
      const target = upsertStudent(bangunMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        jamBangun: row.bangunPagi.jam || "",
        berdoa: Boolean(row.bangunPagi.membacaDanBangunTidur),
      });
    }

    if (row.beribadah) {
      const target = upsertStudent(beribadahMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        berdoaUntukDiriDanOrtu: row.beribadah.berdoaUntukDiriDanOrtu ?? false,
        sholatFajar: row.beribadah.sholatFajar ?? row.beribadah.subuh ?? false,
        sholatLimaWaktuBerjamaah:
          row.beribadah.sholatLimaWaktuBerjamaah ??
          Boolean(
            row.beribadah.subuh ||
            row.beribadah.dzuhur ||
            row.beribadah.ashar ||
            row.beribadah.maghrib ||
            row.beribadah.isya,
          ),
        zikirSesudahSholat: row.beribadah.zikirSesudahSholat ?? false,
        sholatDhuha: row.beribadah.sholatDhuha ?? false,
        sholatSunahRawatib: row.beribadah.sholatSunahRawatib ?? false,
        zakatInfaqSedekah:
          row.beribadah.zakatInfaqSedekah !== undefined
            ? String(row.beribadah.zakatInfaqSedekah)
            : "",
      });
    }

    if (row.makanSehat) {
      const target = upsertStudent(makanMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        jenisMakanan:
          row.makanSehat.jenisMakanan || row.makanSehat.deskripsi || "",
        jenisLaukSayur: row.makanSehat.jenisLaukSayur || "",
        makanSayurAtauBuah: Boolean(row.makanSehat.makanSayurAtauBuah),
        minumSuplemen: Boolean(row.makanSehat.minumSuplemen),
      });
    }

    if (row.belajar) {
      const target = upsertStudent(belajarMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        yaAtauTidak: Boolean(row.belajar.yaAtauTidak),
        deskripsi: row.belajar.deskripsi || "",
      });
    }

    if (row.bermasyarakat) {
      const target = upsertStudent(bermasyarakatMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        jenisKegiatan: row.bermasyarakat.deskripsi || "",
        tempat: row.bermasyarakat.tempat || "",
        waktu: row.bermasyarakat.waktu || "",
        paraf: Boolean(row.bermasyarakat.paraf),
      });
    }

    if (row.olahraga) {
      const target = upsertStudent(olahragaMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        jenisOlahraga: row.olahraga.jenisOlahraga || "",
        deskripsi: row.olahraga.deskripsi || "",
        waktu:
          row.olahraga.waktu !== undefined ? String(row.olahraga.waktu) : "",
      });
    }

    if (row.tidur) {
      const target = upsertStudent(tidurMap, base, () => ({
        ...base,
        entries: [],
      }));
      target.entries.push({
        tanggal: normalizedDate,
        jamTidur: row.tidur.jam || "",
        berdoa: Boolean(row.tidur.membacaDanMasTidur),
      });
    }
  }

  return {
    bangun: sortStudentsEntries(Array.from(bangunMap.values()).sort(byName)),
    beribadah: sortStudentsEntries(
      Array.from(beribadahMap.values()).sort(byName),
    ),
    makan: sortStudentsEntries(Array.from(makanMap.values()).sort(byName)),
    belajar: sortStudentsEntries(Array.from(belajarMap.values()).sort(byName)),
    bermasyarakat: sortStudentsEntries(
      Array.from(bermasyarakatMap.values()).sort(byName),
    ),
    olahraga: sortStudentsEntries(
      Array.from(olahragaMap.values()).sort(byName),
    ),
    tidur: sortStudentsEntries(Array.from(tidurMap.values()).sort(byName)),
  };
}
