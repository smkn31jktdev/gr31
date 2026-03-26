import type jsPDF from "jspdf";

export function drawCheck(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const size = Math.min(width, height) * 0.32;

  doc.setLineWidth(0.6);
  doc.setDrawColor(30, 30, 30);
  doc.line(cx - size * 0.9, cy, cx - size * 0.2, cy + size * 0.7);
  doc.line(cx - size * 0.2, cy + size * 0.7, cx + size, cy - size * 0.8);
  doc.setLineWidth(0.25);
}

export function drawCenteredText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  doc.text(text, x + width / 2, y + height / 2 + 1, { align: "center" });
}

export function createPdfFilename(
  section: string,
  student: { nama: string; nisn: string },
  selectedMonth: string,
): string {
  const safeName = student.nama.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const period = selectedMonth === "all" ? "semua-bulan" : selectedMonth;
  return `${section}_${safeName}_${student.nisn}_${period}.pdf`;
}
