import jsPDF from "jspdf";
import { formatMonthLabel } from "../../utils";

interface GenericPdfParams {
  filename: string;
  title: string;
  student: { nama: string; nisn: string; kelas?: string };
  selectedMonth: string;
  headers: string[];
  rows: string[][];
}

export function downloadPdfReport(params: GenericPdfParams): void {
  const { filename, title, student, selectedMonth, headers, rows } = params;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 10;
  const maxLineWidth = pageWidth - marginX * 2;

  let y = 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, marginX, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const periodLabel =
    selectedMonth === "all" ? "Semua Bulan" : formatMonthLabel(selectedMonth);
  doc.text(`Nama: ${student.nama}`, marginX, y);
  doc.text(`NISN: ${student.nisn}`, marginX + 70, y);
  doc.text(`Kelas: ${student.kelas || "-"}`, marginX + 130, y);
  y += 5;
  doc.text(`Periode: ${periodLabel}`, marginX, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  const headerLine = headers.join(" | ");
  const headerWrapped = doc.splitTextToSize(headerLine, maxLineWidth);
  doc.text(headerWrapped, marginX, y);
  y += headerWrapped.length * 5;

  doc.setFont("helvetica", "normal");
  for (const row of rows) {
    const line = row.join(" | ");
    const wrapped = doc.splitTextToSize(line, maxLineWidth);

    if (y + wrapped.length * 5 > pageHeight - 10) {
      doc.addPage();
      y = 12;
    }

    doc.text(wrapped, marginX, y);
    y += wrapped.length * 5;
  }

  doc.save(filename);
}
