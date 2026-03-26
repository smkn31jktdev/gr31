import { FileSpreadsheet } from "lucide-react";
import { SummaryBrief } from "../types";

interface SheetsPreviewProps {
  summaries: SummaryBrief[];
  filteredSummaries: SummaryBrief[];
}

export default function SheetsPreview({
  summaries,
  filteredSummaries,
}: SheetsPreviewProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center gap-3">
        <FileSpreadsheet className="w-5 h-5 text-gray-400" />
        <h3 className="font-bold text-gray-900">Preview Data</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Nama Siswa</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Periode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  Belum ada data yang dimuat.
                </td>
              </tr>
            ) : filteredSummaries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  Tidak ada data untuk bulan ini.
                </td>
              </tr>
            ) : (
              filteredSummaries.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                    {s.nisn}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {s.nama}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{s.kelas || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {s.monthLabel || s.monthKey}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
