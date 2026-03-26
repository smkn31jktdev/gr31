"use client";

import { useCallback, useMemo, useState } from "react";

import { extractMonthKeys, filterEntriesByMonth } from "../utils";
import { createPdfFilename, downloadBelajarStyledPdf } from "../report";

import BelajarDetailModal from "./DetailModal";
import BelajarStudentList from "./StudentList";
import type { BelajarStudent } from "@/lib/interface/kegiatan/belajar";

interface BelajarWrapperProps {
  students: BelajarStudent[];
}

export default function BelajarWrapper({ students }: BelajarWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<BelajarStudent | null>(
    null,
  );
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
      dilakukan: entry.yaAtauTidak ? "Ya" : "Tidak",
      jenisKegiatanBelajar: entry.deskripsi || "-",
    }));

    void downloadBelajarStyledPdf({
      filename: createPdfFilename("belajar", selectedStudent, selectedMonth),
      student: selectedStudent,
      selectedMonth,
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  return (
    <>
      <BelajarStudentList
        students={students}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
      />

      {selectedStudent && (
        <BelajarDetailModal
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


