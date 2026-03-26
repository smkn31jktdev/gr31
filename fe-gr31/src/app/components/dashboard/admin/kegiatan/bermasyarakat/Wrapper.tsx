"use client";

import { useCallback, useMemo, useState } from "react";

import { extractMonthKeys, filterEntriesByMonth } from "../utils";
import { createPdfFilename, downloadBermasyarakatStyledPdf } from "../report";

import BermasyarakatDetailModal from "./DetailModal";
import BermasyarakatStudentList from "./StudentList";
import {
  BERMASYARAKAT_DESKRIPSI_MAP,
  type BermasyarakatStudent,
} from "@/lib/interface/kegiatan/bermasyarakat";

interface BermasyarakatWrapperProps {
  students: BermasyarakatStudent[];
}

export default function BermasyarakatWrapper({
  students,
}: BermasyarakatWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<BermasyarakatStudent | null>(null);
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
      jenisKegiatan:
        BERMASYARAKAT_DESKRIPSI_MAP[entry.jenisKegiatan] ||
        entry.jenisKegiatan ||
        "-",
      tempat: entry.tempat || "-",
      waktu: entry.waktu || "-",
    }));

    void downloadBermasyarakatStyledPdf({
      filename: createPdfFilename(
        "bermasyarakat",
        selectedStudent,
        selectedMonth,
      ),
      student: selectedStudent,
      selectedMonth,
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  return (
    <>
      <BermasyarakatStudentList
        students={students}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
      />

      {selectedStudent && (
        <BermasyarakatDetailModal
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


