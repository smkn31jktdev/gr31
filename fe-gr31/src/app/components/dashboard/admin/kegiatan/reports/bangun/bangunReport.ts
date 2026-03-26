import jsPDF from "jspdf";
import {
  formatMonthLabel,
  loadPoppinsFont,
  renderPDFHeader,
} from "../../utils";

interface BangunPdfParams {
  filename: string;
  title: string;
  student: { nama: string; kelas?: string };
  selectedMonth: string;
  headers: [string, string, string];
  rows: string[][];
}

export async function downloadBangunTidurStyledPdf(
  params: BangunPdfParams,
): Promise<void> {
  const { filename, title, student, selectedMonth, headers, rows } = params;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await loadPoppinsFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const tableWidth = pageWidth - marginX * 2;
  const columnWidths = [tableWidth * 0.33, tableWidth * 0.3, tableWidth * 0.37];

  const periodLabel =
    selectedMonth === "all" ? "Semua Bulan" : formatMonthLabel(selectedMonth);

  const drawTableHeader = (y: number): number => {
    doc.setFillColor(245, 245, 245);
    doc.rect(marginX, y - 5.5, tableWidth, 8.5, "F");

    doc.setFont("Poppins", "bold");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);

    let x = marginX + 2;
    doc.text(headers[0], x, y);
    x += columnWidths[0];
    doc.text(headers[1], x, y);
    x += columnWidths[1];
    doc.text(headers[2], x, y);

    return y + 4.5;
  };

  const drawPageTop = (): number => {
    renderPDFHeader(
      doc,
      title,
      student.nama,
      student.kelas || "-",
      periodLabel,
    );
    return drawTableHeader(98);
  };

  let y = drawPageTop();
  doc.setFont("Poppins", "normal");
  doc.setFontSize(9.5);

  for (const row of rows) {
    const col0 = doc.splitTextToSize(row[0] || "-", columnWidths[0] - 4);
    const col1 = doc.splitTextToSize(row[1] || "-", columnWidths[1] - 4);
    const col2 = doc.splitTextToSize(row[2] || "-", columnWidths[2] - 4);
    const lineCount = Math.max(col0.length, col1.length, col2.length);
    const rowHeight = Math.max(8, lineCount * 4.5 + 2);

    if (y + rowHeight > pageHeight - 16) {
      doc.addPage();
      y = drawPageTop();
      doc.setFont("Poppins", "normal");
      doc.setFontSize(9.5);
    }

    let x = marginX + 2;
    doc.text(col0, x, y);
    x += columnWidths[0];
    doc.text(col1, x, y);
    x += columnWidths[1];
    doc.text(col2, x, y);

    doc.setDrawColor(224, 224, 224);
    doc.line(
      marginX,
      y + rowHeight - 2,
      marginX + tableWidth,
      y + rowHeight - 2,
    );

    y += rowHeight;
  }

  doc.save(filename);
}
