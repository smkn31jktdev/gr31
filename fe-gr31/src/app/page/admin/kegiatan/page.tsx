import { Suspense } from "react";
import KegiatanContainer from "@/app/components/dashboard/admin/kegiatan/KegiatanContainer";

export const metadata = {
  title: "Monitor Kegiatan Siswa — Admin GR31",
  description:
    "Pantau jurnal kebiasaan baik siswa secara real-time dan interaktif.",
};

export default function KegiatanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <KegiatanContainer />
    </Suspense>
  );
}
