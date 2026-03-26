import LoginStudent from "@/app/components/login/student/LoginStudent";

export const metadata = {
  title: "Login Siswa — GR31 SMKN 31 Jakarta",
  description:
    "Halaman masuk untuk siswa SMKN 31 Jakarta. Terapkan dan monitoring kebiasaan baik setiap hari.",
};

export default function StudentLoginPage() {
  return <LoginStudent />;
}
