import { School } from "lucide-react";

interface ProfileCardProps {
  studentData: { nama: string; nisn: string; kelas: string } | null;
  isLoadingStudent: boolean;
}

export default function ProfileCard({ studentData, isLoadingStudent }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[var(--secondary)] to-teal-400 opacity-10"></div>
      <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[var(--secondary)] to-teal-400 rounded-full flex items-center justify-center mb-4 shadow-sm text-white">
        <span className="text-2xl font-bold">
          {studentData?.nama ? studentData.nama.charAt(0).toUpperCase() : "?"}
        </span>
      </div>
      <h2 className="text-lg font-bold text-gray-900 line-clamp-1 relative z-10">
        {isLoadingStudent ? "Memuat..." : studentData?.nama || "Siswa"}
      </h2>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 relative z-10">
        <School className="w-3.5 h-3.5" />
        <span>
          {isLoadingStudent ? "..." : `${studentData?.kelas || "-"} • ${studentData?.nisn || "-"}`}
        </span>
      </div>
    </div>
  );
}
