import { FormEvent } from "react";
import Select from "@/app/components/ui/Select";
import { Trash2 } from "lucide-react";
import { FeedbackState, StudentOption } from "../types";

interface DeleteFormProps {
  students: StudentOption[];
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  isLoadingStudents: boolean;
  selectedStudentMeta: StudentOption | null;
  months: { value: string; label: string; description: string }[];
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  isLoadingMonths: boolean;
  selectedMonthMeta: { entryCount: number } | null;
  feedback: FeedbackState;
  feedbackClassName: string;
  isDeleting: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export default function DeleteForm({
  students,
  selectedStudent,
  setSelectedStudent,
  isLoadingStudents,
  selectedStudentMeta,
  months,
  selectedMonth,
  setSelectedMonth,
  isLoadingMonths,
  selectedMonthMeta,
  feedback,
  feedbackClassName,
  isDeleting,
  onSubmit,
}: DeleteFormProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
      {feedback && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${feedbackClassName}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              feedback.type === "error" ? "bg-rose-500" : "bg-green-500"
            }`}
          ></div>
          {feedback.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="student"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Pilih Siswa
          </label>
          <Select
            value={selectedStudent}
            onChange={setSelectedStudent}
            options={students}
            placeholder={
              isLoadingStudents
                ? "Memuat daftar siswa..."
                : "Cari nama siswa..."
            }
            className="w-full"
            disabled={isLoadingStudents || students.length === 0}
            searchable
          />
          {isLoadingStudents && (
            <p className="mt-2 text-xs text-gray-500">
              Mengambil daftar siswa...
            </p>
          )}
          {selectedStudentMeta && (
            <p className="mt-2 text-xs text-gray-400">
              {selectedStudentMeta.kelas || "Kelas belum diatur"} • NISN{" "}
              {selectedStudentMeta.nisn}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="month"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Pilih Bulan
          </label>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={months}
            placeholder={
              selectedStudent
                ? isLoadingMonths
                  ? "Memuat data bulan..."
                  : months.length === 0
                    ? "Tidak ada data bulan"
                    : "Pilih bulan kegiatan"
                : "Pilih siswa terlebih dahulu"
            }
            className="w-full"
            disabled={
              !selectedStudent || isLoadingMonths || months.length === 0
            }
            searchable
          />
          {selectedMonthMeta && (
            <p className="mt-2 text-xs text-blue-600 font-medium">
              Ditemukan {selectedMonthMeta.entryCount} catatan kegiatan.
            </p>
          )}
        </div>

        {/* Danger Zone Block */}
        <div className="pt-4 mt-6 border-t border-gray-100">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl text-rose-600 shadow-sm border border-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Area Berbahaya
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Tindakan ini akan{" "}
                  <span className="font-semibold text-rose-600">
                    menghapus permanen
                  </span>{" "}
                  semua catatan kegiatan untuk siswa dan bulan yang dipilih.
                  Data yang dihapus tidak dapat dikembalikan.
                </p>
                <button
                  type="submit"
                  disabled={
                    !selectedStudent ||
                    !selectedMonth ||
                    isDeleting ||
                    isLoadingMonths
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Memproses..." : "Hapus Data Kegiatan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
