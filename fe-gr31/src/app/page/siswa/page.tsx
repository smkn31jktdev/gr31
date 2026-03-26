import StudentDashboard from "@/app/components/dashboard/student/dashboard/StudentDashboard";

export const metadata = {
  title: "Dashboard Siswa — GR31 SMKN 31 Jakarta",
  description: "Dashboard akses siswa untuk melihat dan mengisi rapor karakter.",
};

export default function SiswaPage() {
  return <StudentDashboard />;
}
