import { CheckCircle, Info } from "lucide-react";
import type { MessageState } from "../types";

interface AlertMessageProps {
  message: MessageState;
}

export function AlertMessage({ message }: AlertMessageProps) {
  return (
    <div
      className={`w-full mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
        message.type === "success"
          ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
          : "bg-red-50 border border-red-100 text-red-700"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <Info className="w-5 h-5" />
      )}
      <p className="font-medium text-sm">{message.text}</p>
    </div>
  );
}
