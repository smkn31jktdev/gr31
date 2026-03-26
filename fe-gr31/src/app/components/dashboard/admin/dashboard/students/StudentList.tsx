"use client";

import { useState, useMemo } from "react";
import { Users, Search, X } from "lucide-react";
import { Student } from "../types";

interface StudentListProps {
  students: Student[];
  studentsLoading: boolean;
}

export default function StudentList({
  students = [],
  studentsLoading,
}: StudentListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.walas?.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <div className="w-full xl:w-96 flex-shrink-0 xl:sticky xl:top-8 self-start h-[600px] xl:h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            List Siswa
          </h3>
          {!studentsLoading && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              {students.length} siswa
            </span>
          )}
        </div>

        {/* Search */}
        {!studentsLoading && students.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, kelas, NISN, atau wali..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all placeholder:text-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {search && (
              <p className="text-xs text-gray-400 mt-1.5 px-1">
                Ditemukan {filtered.length} dari {students.length} siswa
              </p>
            )}
          </div>
        )}

        {/* Student list */}
        <div className="p-2 flex-1 min-h-0 overflow-y-auto">
          {studentsLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-2 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">
                {search ? "Tidak ada siswa yang cocok" : "Belum ada siswa terdaftar"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 bg-blue-400">
                    {student.nama.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[var(--secondary)] transition-colors">
                      {student.nama}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {student.kelas}
                      {student.walas && (
                        <span className="text-gray-300"> · {student.walas}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
