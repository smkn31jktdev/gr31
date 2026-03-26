"use client";

import { useCallback, useMemo, useState } from "react";

import { extractMonthKeys, filterEntriesByMonth } from "../utils";
import {
  createPdfFilename,
  downloadIbadahStyledPdf,
  downloadPdfReport,
} from "../report";

import HarianDetailModal from "./HarianDetailModal";
import RamadhanDetailModal from "./RamadhanDetailModal";
import BeribadahStudentList from "./StudentList";
import type { BeribadahStudent, RamadhanStudent } from "@/lib/interface/kegiatan/beribadah";

interface BeribadahWrapperProps {
  students: BeribadahStudent[];
}

export default function BeribadahWrapper({ students }: BeribadahWrapperProps) {
  const [viewMode, setViewMode] = useState<"harian" | "ramadhan">("harian");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStudent, setSelectedStudent] =
    useState<BeribadahStudent | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedRamadhanStudent, setSelectedRamadhanStudent] =
    useState<RamadhanStudent | null>(null);

  const ramadhanStudents: RamadhanStudent[] = [];

  const availableMonths = useMemo(
    () => extractMonthKeys(selectedStudent?.entries ?? []),
    [selectedStudent],
  );

  const filteredEntries = useMemo(
    () => filterEntriesByMonth(selectedStudent?.entries ?? [], selectedMonth),
    [selectedStudent, selectedMonth],
  );

  const handleDownloadHarian = useCallback(() => {
    if (!selectedStudent) return;

    const rows = filteredEntries.map((entry) => ({
      tanggal: entry.tanggal,
      berdoa: entry.berdoaUntukDiriDanOrtu,
      fajar: entry.sholatFajar,
      limaWaktu: entry.sholatLimaWaktuBerjamaah,
      zikir: entry.zikirSesudahSholat,
      dhuha: entry.sholatDhuha,
      rawatib: entry.sholatSunahRawatib,
      zisNominal: entry.zakatInfaqSedekah || "",
    }));

    void downloadIbadahStyledPdf({
      filename: createPdfFilename("beribadah", selectedStudent, selectedMonth),
      student: selectedStudent,
      selectedMonth,
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  const handleDownloadRamadhan = useCallback(() => {
    if (!selectedRamadhanStudent) return;

    const rows = selectedRamadhanStudent.entries.map((entry) => [
      entry.tanggal,
      entry.ramadhanDay ? String(entry.ramadhanDay) : "-",
      entry.sholatTarawihWitir ? "Ya" : "Tidak",
      entry.berpuasa ? "Ya" : "Tidak",
    ]);

    downloadPdfReport({
      filename: createPdfFilename(
        "ramadhan",
        {
          nama: selectedRamadhanStudent.nama,
          nisn: selectedRamadhanStudent.nisn,
        },
        "all",
      ),
      title: "Laporan Kegiatan Ramadhan",
      student: {
        nama: selectedRamadhanStudent.nama,
        nisn: selectedRamadhanStudent.nisn,
        kelas: selectedRamadhanStudent.kelas,
      },
      selectedMonth: "all",
      headers: ["Tanggal", "Hari Ramadhan", "Tarawih & Witir", "Berpuasa"],
      rows,
    });
  }, [selectedRamadhanStudent]);

  return (
    <>
      <BeribadahStudentList
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        error={null}
        students={students}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
        ramadhanStudents={ramadhanStudents}
        onSelectRamadhanStudent={setSelectedRamadhanStudent}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={[]}
        period={null}
      />

      {selectedStudent && (
        <HarianDetailModal
          student={selectedStudent}
          filteredEntries={filteredEntries}
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          onMonthChange={setSelectedMonth}
          onDownloadPDF={handleDownloadHarian}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {selectedRamadhanStudent && (
        <RamadhanDetailModal
          student={selectedRamadhanStudent}
          onDownloadPDF={handleDownloadRamadhan}
          onClose={() => setSelectedRamadhanStudent(null)}
        />
      )}
    </>
  );
}


