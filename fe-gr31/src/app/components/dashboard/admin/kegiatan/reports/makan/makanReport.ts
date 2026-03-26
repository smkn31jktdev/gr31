import jsPDF from "jspdf";
import {
  formatDisplayDate,
  formatMonthLabel,
  loadPoppinsFont,
  renderPDFHeader,
} from "../../utils";
import { drawCheck, drawCenteredText } from "../helpers";
import type { MakanSehatPdfRow, PdfParams } from "../types";

interface MakanPdfParams extends PdfParams {
  rows: MakanSehatPdfRow[];
}

export async function downloadMakanSehatStyledPdf(
  params: MakanPdfParams,
): Promise<void> {
  const { filename, student, selectedMonth, rows } = params;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await loadPoppinsFont(doc);

  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const columnWidths = [40, 30, 35, 30, 17.5, 17.5];
  const periodLabel =
    selectedMonth === "all" ? "Semua Bulan" : formatMonthLabel(selectedMonth);

  const drawHeader = (startY: number): number => {
    const h1 = 8;
    const h2 = 8;
    const mergedH = h1 + h2;

    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.setFillColor(236, 241, 247);

    let x = marginX;
    for (let i = 0; i < 4; i += 1) {
      doc.rect(x, startY, columnWidths[i], mergedH, "FD");
      x += columnWidths[i];
    }

    const suplemenX = x;
    const suplemenW = columnWidths[4] + columnWidths[5];
    doc.rect(suplemenX, startY, suplemenW, h1, "FD");
    doc.rect(suplemenX, startY + h1, columnWidths[4], h2, "FD");
    doc.rect(
      suplemenX + columnWidths[4],
      startY + h1,
      columnWidths[5],
      h2,
      "FD",
    );

    doc.setFont("Poppins", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(35, 35, 35);

    drawCenteredText(
      doc,
      "Hari/Tanggal",
      marginX,
      startY,
      columnWidths[0],
      mergedH,
    );
    drawCenteredText(
      doc,
      "Jenis Makanan",
      marginX + columnWidths[0],
      startY,
      columnWidths[1],
      mergedH,
    );
    drawCenteredText(
      doc,
      "Makan Lauk",
      marginX + columnWidths[0] + columnWidths[1],
      startY,
      columnWidths[2],
      mergedH,
    );
    drawCenteredText(
      doc,
      "Sayur/Buah",
      marginX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      startY,
      columnWidths[3],
      mergedH,
    );
    drawCenteredText(doc, "Minum Suplemen?", suplemenX, startY, suplemenW, h1);
    drawCenteredText(doc, "YA", suplemenX, startY + h1, columnWidths[4], h2);
    drawCenteredText(
      doc,
      "TIDAK",
      suplemenX + columnWidths[4],
      startY + h1,
      columnWidths[5],
      h2,
    );

    return startY + mergedH;
  };

  const drawPageTop = (): number => {
    renderPDFHeader(
      doc,
      "Makan Sehat",
      student.nama,
      student.kelas || "-",
      periodLabel,
    );
    return drawHeader(98);
  };

  let y = drawPageTop();

  doc.setFont("Poppins", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(25, 25, 25);
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.25);

  for (const row of rows) {
    const values = [
      formatDisplayDate(row.tanggal),
      row.jenisMakanan || "-",
      row.jenisLauk || "-",
      "",
      "",
      "",
    ];

    const wrapped0 = doc.splitTextToSize(values[0], columnWidths[0] - 3);
    const wrapped1 = doc.splitTextToSize(values[1], columnWidths[1] - 3);
    const wrapped2 = doc.splitTextToSize(values[2], columnWidths[2] - 3);
    const lineCount = Math.max(
      wrapped0.length,
      wrapped1.length,
      wrapped2.length,
      1,
    );
    const rowHeight = Math.max(9, lineCount * 3.8 + 3);

    if (y + rowHeight > pageHeight - 14) {
      doc.addPage();
      y = drawPageTop();
      doc.setFont("Poppins", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(25, 25, 25);
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.25);
    }

    let x = marginX;
    for (let i = 0; i < columnWidths.length; i += 1) {
      doc.rect(x, y, columnWidths[i], rowHeight);
      x += columnWidths[i];
    }

    doc.text(wrapped0, marginX + 2, y + 5);
    doc.text(wrapped1, marginX + columnWidths[0] + 2, y + 5);
    doc.text(wrapped2, marginX + columnWidths[0] + columnWidths[1] + 2, y + 5);
    drawCenteredText(
      doc,
      values[3],
      marginX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      y,
      columnWidths[3],
      rowHeight,
    );
    const sayurX =
      marginX + columnWidths[0] + columnWidths[1] + columnWidths[2];
    const suplemenYaX = sayurX + columnWidths[3];
    const suplemenTidakX = suplemenYaX + columnWidths[4];

    if (row.makanSayurAtauBuah) {
      drawCheck(doc, sayurX, y, columnWidths[3], rowHeight);
    }

    if (row.minumSuplemen) {
      drawCheck(doc, suplemenYaX, y, columnWidths[4], rowHeight);
    } else {
      drawCheck(doc, suplemenTidakX, y, columnWidths[5], rowHeight);
    }

    y += rowHeight;
  }

  doc.save(filename);
}
