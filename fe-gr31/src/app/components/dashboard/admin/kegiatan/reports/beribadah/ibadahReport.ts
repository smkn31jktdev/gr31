import jsPDF from "jspdf";
import { formatMonthLabel, loadPoppinsFont } from "../../utils";
import { drawCheck } from "../helpers";
import type { IbadahPdfRow, PdfParams } from "../types";

interface IbadahPdfParams extends PdfParams {
  rows: IbadahPdfRow[];
}

function shortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

function formatZis(raw: string): string {
  const text = String(raw || "").trim();
  if (!text) return "-";

  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return text;

  const amount = Number(digits);
  if (Number.isNaN(amount)) return text;

  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

export async function downloadIbadahStyledPdf(
  params: IbadahPdfParams,
): Promise<void> {
  const { filename, student, selectedMonth, rows } = params;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await loadPoppinsFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const tableWidth = pageWidth - marginX * 2;
  const columnWidths = [28, 19, 16, 21, 16, 16, 20, 22];
  const periodLabel =
    selectedMonth === "all" ? "Semua Bulan" : formatMonthLabel(selectedMonth);

  const drawPageTop = (): number => {
    doc.setFont("Poppins", "bold");
    doc.setFontSize(11);
    doc.setTextColor(70, 75, 85);
    doc.text("SMK NEGERI 31 JAKARTA", pageWidth / 2, 16, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(27, 172, 122);
    doc.text("JURNAL KEBIASAAN BAIK", pageWidth / 2, 28, { align: "center" });

    doc.setDrawColor(185, 190, 195);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 52, 31.5, pageWidth / 2 + 52, 31.5);

    doc.setFont("Poppins", "normal");
    doc.setFontSize(10);
    doc.setTextColor(76, 85, 99);
    doc.text("Beribadah", pageWidth / 2, 40, { align: "center" });

    const cardY = 50;
    const cardHeight = 32;
    doc.setFillColor(239, 242, 246);
    doc.roundedRect(marginX, cardY, tableWidth, cardHeight, 5, 5, "F");
    doc.setFillColor(27, 172, 122);
    doc.roundedRect(marginX, cardY, 3.8, cardHeight, 2, 2, "F");

    doc.setFont("Poppins", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(95, 102, 114);
    doc.text("Nama Siswa", marginX + 12, cardY + 12);
    doc.text("Kelas", marginX + 12, cardY + 24);
    doc.text("Periode", marginX + 95, cardY + 12);

    doc.setFont("Poppins", "bold");
    doc.setTextColor(39, 44, 52);
    doc.text(student.nama || "-", marginX + 47, cardY + 12);
    doc.text(student.kelas || "-", marginX + 47, cardY + 24);
    doc.text(periodLabel, marginX + 115, cardY + 12);

    const sectionY = cardY + cardHeight + 18;
    doc.setFillColor(38, 72, 185);
    doc.circle(marginX + 4, sectionY, 2.9, "F");
    doc.setFont("Poppins", "bold");
    doc.setFontSize(13);
    doc.setTextColor(38, 72, 185);
    doc.text("IBADAH HARIAN", marginX + 11, sectionY + 2.2);

    doc.setFillColor(200, 220, 245);
    doc.roundedRect(marginX + 56, sectionY - 5, 34, 10, 3, 3, "F");
    doc.setFont("Poppins", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(38, 72, 185);
    doc.text(`${rows.length} hari`, marginX + 60, sectionY + 1.8);

    const headerY = sectionY + 11;
    doc.setFillColor(38, 72, 185);
    doc.roundedRect(marginX, headerY, tableWidth, 10.5, 2.5, 2.5, "F");

    doc.setFont("Poppins", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(255, 255, 255);

    const headers = [
      "Tanggal",
      "Berdoa",
      "Fajar",
      "5 Waktu",
      "Zikir",
      "Dhuha",
      "Rawatib",
      "ZIS",
    ];

    let x = marginX;
    for (let i = 0; i < headers.length; i += 1) {
      doc.text(headers[i], x + 2.2, headerY + 6.8);
      x += columnWidths[i];
    }

    return headerY + 11.4;
  };

  let y = drawPageTop();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const displayDate = shortDate(row.tanggal);
    const zis = formatZis(row.zisNominal);
    const dateLines = doc.splitTextToSize(displayDate, columnWidths[0] - 4);
    const zisLines = doc.splitTextToSize(zis, columnWidths[7] - 4);
    const lines = Math.max(dateLines.length, zisLines.length, 1);
    const rowHeight = Math.max(8.5, lines * 3.8 + 2.6);

    if (y + rowHeight > pageHeight - 12) {
      doc.addPage();
      y = drawPageTop();
    }

    if (i % 2 === 0) {
      doc.setFillColor(242, 245, 249);
      doc.rect(marginX, y, tableWidth, rowHeight, "F");
    }

    doc.setFont("Poppins", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(66, 74, 89);

    let x = marginX;
    doc.text(dateLines, x + 2, y + 5.6);
    x += columnWidths[0];

    const boolValues = [
      row.berdoa,
      row.fajar,
      row.limaWaktu,
      row.zikir,
      row.dhuha,
      row.rawatib,
    ];

    for (let c = 0; c < boolValues.length; c += 1) {
      if (boolValues[c]) {
        drawCheck(doc, x, y, columnWidths[c + 1], rowHeight);
      }
      x += columnWidths[c + 1];
    }

    doc.setTextColor(66, 74, 89);
    doc.text(zisLines, x + 2, y + 5.6);

    doc.setDrawColor(224, 228, 235);
    doc.setLineWidth(0.25);
    doc.line(marginX, y + rowHeight, marginX + tableWidth, y + rowHeight);

    y += rowHeight;
  }

  doc.save(filename);
}
