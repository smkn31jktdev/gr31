import { StudentData } from "../types";

interface BuktiStudentInfoProps {
  studentData: StudentData;
}

export default function BuktiStudentInfo({ studentData }: BuktiStudentInfoProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
      <h3 className="font-bold text-gray-900 mb-4">Informasi Siswa</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nama</label>
          <p className="font-medium text-gray-800">{studentData.nama}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">NISN</label>
          <p className="font-medium text-gray-800">{studentData.nisn}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Kelas</label>
          <p className="font-medium text-gray-800">{studentData.kelas}</p>
        </div>
      </div>
    </div>
  );
}
