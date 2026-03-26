import { Search } from "lucide-react";

interface EditAdminHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function EditAdminHeader({
  searchTerm,
  onSearchChange,
}: EditAdminHeaderProps) {
  return (
    <div className="mb-8 md:mb-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="text-center md:text-left w-full md:w-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Edit Data Admin
        </h1>
        <p className="text-gray-500 text-sm md:text-base mx-auto md:mx-0">
          Kelola dan perbarui informasi admin yang terdaftar.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-[var(--secondary)] focus:outline-none focus:ring-4 focus:ring-[var(--secondary)]/10 transition-all shadow-sm placeholder:text-gray-400"
          placeholder="Cari nama atau email..."
        />
      </div>
    </div>
  );
}
