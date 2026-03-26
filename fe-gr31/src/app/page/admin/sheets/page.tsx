import { Metadata } from "next";
import { Suspense } from "react";
import AdminSheetsContainer from "@/app/components/dashboard/admin/sheets/AdminSheetsContainer";

export const metadata: Metadata = {
  title: "Sheets Admin | Dashboard",
  description: "Manajemen lembar penilaian admin",
};

export default function AdminSheetsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <AdminSheetsContainer />
    </Suspense>
  );
}
