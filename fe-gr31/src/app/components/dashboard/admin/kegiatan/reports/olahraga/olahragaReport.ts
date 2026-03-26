import jsPDF from "jspdf";
import {
  formatDisplayDate,
  formatMonthLabel,
  loadPoppinsFont,
  renderPDFHeader,
} from "../../utils";
import type { OlahragaPdfRow, PdfParams } from "../types";

interface OlahragaPdfParams extends PdfParams {
  rows: OlahragaPdfRow[];
}

export async function downloadOlahragaStyledPdf(
  params: OlahragaPdfParams,
): Promise<void> {
  const { filename, student, selectedMonth, rows } = params;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await loadPoppinsFont(doc);

  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const tableWidth = 170;
  const columnWidths = [40, 45, 50, 35];
  const periodLabel =
    selectedMonth === "all" ? "Semua Bulan" : formatMonthLabel(selectedMonth);

  const drawHeader = (startY: number): number => {
    const headerHeight = 10;
    doc.setFillColor(238, 241, 245);
    doc.rect(marginX, startY, tableWidth, headerHeight, "F");

    doc.setFont("Poppins", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);

    let x = marginX + 1;
    doc.text("Hari/Tanggal", x + 2, startY + 6.5);
    x += columnWidths[0];
    doc.text("Jenis Olahraga", x + 2, startY + 6.5);
    x += columnWidths[1];
    doc.text("Deskripsi", x + 2, startY + 6.5);
    x += columnWidths[2];
    doc.text("Waktu", x + 2, startY + 6.5);

    doc.setDrawColor(208, 211, 216);
    doc.setLineWidth(0.3);
    doc.line(
      marginX,
      startY + headerHeight,
      marginX + tableWidth,
      startY + headerHeight,
    );

    return startY + headerHeight;
  };

  const drawPageTop = (): number => {
    renderPDFHeader(
      doc,
      "Olahraga",
      student.nama,
      student.kelas || "-",
      periodLabel,
    );
    return drawHeader(98);
  };

  let y = drawPageTop();
  doc.setFont("Poppins", "normal");
  doc.setFontSize(8.9);
  doc.setTextColor(28, 28, 28);

  for (const row of rows) {
    const values = [
      formatDisplayDate(row.tanggal),
      row.jenisOlahraga || "-",
      row.deskripsi || "-",
      row.waktu || "-",
    ];

    const cell0 = doc.splitTextToSize(values[0], columnWidths[0] - 4);
    const cell1 = doc.splitTextToSize(values[1], columnWidths[1] - 4);
    const cell2 = doc.splitTextToSize(values[2], columnWidths[2] - 4);
    const cell3 = doc.splitTextToSize(values[3], columnWidths[3] - 4);
    const lines = Math.max(
      cell0.length,
      cell1.length,
      cell2.length,
      cell3.length,
      1,
    );
    const rowHeight = Math.max(11, lines * 4.1 + 3);

    if (y + rowHeight > pageHeight - 14) {
      doc.addPage();
      y = drawPageTop();
      doc.setFont("Poppins", "normal");
      doc.setFontSize(8.9);
      doc.setTextColor(28, 28, 28);
    }

    let x = marginX;
    doc.text(cell0, x + 2, y + 7);
    x += columnWidths[0];
    doc.text(cell1, x + 2, y + 7);
    x += columnWidths[1];
    doc.text(cell2, x + 2, y + 7);
    x += columnWidths[2];
    doc.text(cell3, x + 2, y + 7);

    doc.setDrawColor(225, 228, 232);
    doc.setLineWidth(0.25);
    doc.line(marginX, y + rowHeight, marginX + tableWidth, y + rowHeight);

    y += rowHeight;
  }

  doc.save(filename);
}
