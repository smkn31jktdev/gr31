import LoginAdmin from "@/app/components/login/admin/LoginAdmin";

export const metadata = {
  title: "Login Admin — GR31 SMKN 31 Jakarta",
  description:
    "Halaman masuk untuk admin, guru piket, dan guru BK SMKN 31 Jakarta. Monitoring kegiatan dan kehadiran siswa.",
};

export default function AdminLoginPage() {
  return <LoginAdmin />;
}
