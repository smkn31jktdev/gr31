import { AdminRow } from "../types";

interface PreviewTableProps {
  rows: AdminRow[];
}

export default function PreviewTable({ rows }: PreviewTableProps) {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Password
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  Belum ada data dimuat. Klik tombol &quot;Muat Data
                  Sheet&quot;.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                    {r.nama}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {r.email}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-400 whitespace-nowrap">
                    {r.password}
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
