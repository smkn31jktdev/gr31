"use client";

import { useCallback, useMemo, useState } from "react";

import {
  extractMonthKeys,
  filterEntriesByMonth,
  formatDisplayDate,
} from "../utils";
import { createPdfFilename, downloadBangunTidurStyledPdf } from "../report";

import TidurDetailModal from "./DetailModal";
import TidurStudentList from "./StudentList";
import type { TidurStudent } from "@/lib/interface/kegiatan/tidur";

interface TidurWrapperProps {
  students: TidurStudent[];
}

export default function TidurWrapper({ students }: TidurWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<TidurStudent | null>(
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
      entry.jamTidur || "-",
      entry.berdoa ? "Ya" : "Tidak",
    ]);

    void downloadBangunTidurStyledPdf({
      filename: createPdfFilename("tidur", selectedStudent, selectedMonth),
      title: "Tidur Cukup",
      student: selectedStudent,
      selectedMonth,
      headers: ["Tanggal", "Jam Tidur", "Berdoa"],
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  return (
    <>
      <TidurStudentList
        students={students}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
      />

      {selectedStudent && (
        <TidurDetailModal
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


