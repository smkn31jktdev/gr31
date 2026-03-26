export default function SheetsHeader() {
  return (
    <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Rekap Data
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto md:mx-0">
          Unduh laporan penilaian bulanan siswa dalam format Excel (.csv).
        </p>
      </div>
    </div>
  );
}
