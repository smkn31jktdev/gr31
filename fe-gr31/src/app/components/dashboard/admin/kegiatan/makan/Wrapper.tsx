"use client";

import { useCallback, useMemo, useState } from "react";

import { extractMonthKeys, filterEntriesByMonth } from "../utils";
import { createPdfFilename, downloadMakanSehatStyledPdf } from "../report";

import MakanDetailModal from "./DetailModal";
import MakanStudentList from "./StudentList";
import type { MakanStudent } from "@/lib/interface/kegiatan/makan";

interface MakanWrapperProps {
  students: MakanStudent[];
}

export default function MakanWrapper({ students }: MakanWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<MakanStudent | null>(
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
      jenisMakanan: entry.jenisMakanan || "-",
      jenisLauk: entry.jenisLaukSayur || "-",
      makanSayurAtauBuah: Boolean(entry.makanSayurAtauBuah),
      minumSuplemen: Boolean(entry.minumSuplemen),
    }));

    void downloadMakanSehatStyledPdf({
      filename: createPdfFilename("makan", selectedStudent, selectedMonth),
      student: selectedStudent,
      selectedMonth,
      rows,
    });
  }, [filteredEntries, selectedMonth, selectedStudent]);

  return (
    <>
      <MakanStudentList
        students={students}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSelectedMonth("all");
        }}
      />

      {selectedStudent && (
        <MakanDetailModal
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


