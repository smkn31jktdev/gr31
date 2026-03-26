import { Mail, User, Users } from "lucide-react";

interface StatusCardsProps {
  adminName: string;
  adminEmail: string;
  studentCount: number;
  adminLoading: boolean;
}

export default function StatusCards({
  adminName,
  adminEmail,
  studentCount,
  adminLoading,
}: StatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Admin Profile */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <User className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-0.5">
            Admin Aktif
          </p>
          {adminLoading ? (
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-base font-bold text-gray-900 truncate">
              {adminName || "Admin"}
            </p>
          )}
        </div>
      </div>

      {/* Total Students */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
          <Users className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-0.5">
            Total Siswa
          </p>
          {adminLoading ? (
            <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-base font-bold text-gray-900">
              {studentCount} Siswa
            </p>
          )}
        </div>
      </div>

      {/* Admin Email */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
          <Mail className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-0.5">
            Email Terdaftar
          </p>
          {adminLoading ? (
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p
              className="text-base font-bold text-gray-900 truncate"
              title={adminEmail}
            >
              {adminEmail || "-"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
