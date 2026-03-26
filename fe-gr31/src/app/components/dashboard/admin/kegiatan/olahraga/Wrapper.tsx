"use client";

import { useCallback, useMemo, useState } from "react";

import { extractMonthKeys, filterEntriesByMonth } from "../utils";
import { createPdfFilename, downloadOlahragaStyledPdf } from "../report";

import OlahragaDetailModal from "./DetailModal";
import OlahragaStudentList from "./StudentList";
import type { OlahragaStudent } from "@/lib/interface/kegiatan/olahraga";

interface OlahragaWrapperProps {
  students: OlahragaStudent[];
}

export default function OlahragaWrapper({ students }: OlahragaWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<OlahragaStudent | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const availableMonths = useMemo(
    () => extractMonthKeys(selectedStudent?.entries ?? []),
    [selectedStudent],
  );

  const filteredEntries = useMemo(
    () => filterEntriesByMonth(selectedStudent?.entries ?? [], selectedMonth),
    [selectedStudent, selectedMonth],
  );

  const handleDownload = useCallback(() => {
    if (!selectedStudent) return;
    const rows = filteredEntries.map((entry) => ({
      tanggal: entry.tanggal,
      jenisOlahraga: entry.jenisOlahraga || "-",
      deskripsi: entry.deskripsi || "-",
      waktu: entry.waktu ? `${entry.waktu} Menit` : "-",
    }));

    void downloadOlahragaStyledPdf({
      filename: createPdfFilename("olahraga", selectedStudent, selectedMonth),
      student: selectedStudent,
      selectedMonth,
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  return (
    <>
      <OlahragaStudentList
        students={students}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
      />

      {selectedStudent && (
        <OlahragaDetailModal
          student={selectedStudent}
          filteredEntries={filteredEntries}
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          onMonthChange={setSelectedMonth}
          onDownloadPDF={handleDownload}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
}


