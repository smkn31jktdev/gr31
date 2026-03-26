import { Suspense } from "react";
import DashboardContainer from "@/app/components/dashboard/admin/dashboard/DashboardContainer";

export const metadata = {
  title: "Dashboard Admin — GR31 SMKN 31 Jakarta",
  description:
    "Dashboard akses admin untuk mengelola pengguna, memonitor rapor karakter, dan laporan lainnya.",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <DashboardContainer />
    </Suspense>
  );
}
