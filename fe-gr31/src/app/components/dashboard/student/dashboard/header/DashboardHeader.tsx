import { CalendarDays, Clock } from "lucide-react";

interface DashboardHeaderProps {
  currentDate: string;
}

export default function DashboardHeader({ currentDate }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
          <CalendarDays className="w-4 h-4" />
          {currentDate}
        </p>
      </div>
      <div className="hidden md:block">
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--secondary)]" />
          <span className="text-sm font-medium text-gray-600">
            Selamat Beraktivitas!
          </span>
        </div>
      </div>
    </div>
  );
}
