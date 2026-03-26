"use client";

import { useCallback, useMemo, useState } from "react";

import {
  extractMonthKeys,
  filterEntriesByMonth,
  formatDisplayDate,
} from "../utils";
import { createPdfFilename, downloadBangunTidurStyledPdf } from "../report";

import BangunDetailModal from "./DetailModal";
import BangunStudentList from "./StudentList";
import type { BangunStudent } from "@/lib/interface/kegiatan/bangun";

interface BangunWrapperProps {
  students: BangunStudent[];
}

export default function BangunWrapper({ students }: BangunWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<BangunStudent | null>(
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
    const rows = filteredEntries.map((entry) => [
      formatDisplayDate(entry.tanggal),
      entry.jamBangun || "-",
      entry.berdoa ? "Ya" : "Tidak",
    ]);

    void downloadBangunTidurStyledPdf({
      filename: createPdfFilename("bangun", selectedStudent, selectedMonth),
      title: "Bangun Pagi",
      student: selectedStudent,
      selectedMonth,
      headers: ["Tanggal", "Jam Bangun", "Berdoa"],
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  return (
    <>
      <BangunStudentList
        students={students}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
      />

      {selectedStudent && (
        <BangunDetailModal
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


