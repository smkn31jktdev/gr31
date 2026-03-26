import { Table } from "lucide-react";

export default function InfoBlock() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-900 text-sm">
      <Table className="w-5 h-5 flex-shrink-0 text-blue-500" />
      <div>
        <p className="font-semibold mb-1">Panduan Import</p>
        <p className="opacity-80">
          Pastikan Google Sheet Anda dapat diakses oleh publik atau service
          account. Struktur kolom harus sesuai dengan format yang ditentukan
          (Nama, Email, Password).
        </p>
      </div>
    </div>
  );
}
