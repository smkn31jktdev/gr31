import { CheckCircle2, XCircle } from "lucide-react";

export interface ActivityType {
  name: string;
  time: string;
  completed: boolean;
}

export default function ActivityRow({ activity }: { activity: ActivityType }) {
  return (
    <div
      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
        activity.completed ? "opacity-100" : "opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            activity.completed
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {activity.completed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{activity.name}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
      <div>
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
            activity.completed
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {activity.completed ? "Selesai" : "Belum"}
        </span>
      </div>
    </div>
  );
}
