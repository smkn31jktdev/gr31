import { Users, Search, Pencil } from "lucide-react";
import { StudentItem } from "../types";

interface EditSiswaTableProps {
  students: StudentItem[];
  filteredStudents: StudentItem[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onEditClick: (student: StudentItem) => void;
}

export default function EditSiswaTable({
  students,
  filteredStudents,
  isLoading,
  error,
  searchTerm,
  onEditClick,
}: EditSiswaTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Users className="w-4 h-4 text-[var(--secondary)]" />
          <span>Daftar Siswa</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs border border-gray-200">
            {students.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Guru Wali</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-700 text-sm">
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-6 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-40 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="mx-auto h-4 w-16 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="mx-auto h-8 w-20 rounded-full bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <p>
                      {searchTerm
                        ? "Tidak ditemukan data yang sesuai."
                        : "Belum ada data siswa."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.nisn}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {student.nama}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.kelas}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {student.walas || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        student.isOnline
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {student.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onEditClick(student)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all cursor-pointer"
                      title="Edit Siswa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
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
