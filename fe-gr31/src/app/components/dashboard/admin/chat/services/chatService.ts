import { Aduan, AduanStatus } from "@/types/aduan";

const API_BASE = "/api/admin/aduan";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function toArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, T>);
  }
  return [];
}

function normalizeAduan(raw: unknown): Aduan {
  const item = (raw || {}) as Record<string, unknown>;
  const messages = toArray<Record<string, unknown>>(item.messages).map(
    (msg) => ({
      id: String(msg.id || ""),
      from: String(msg.from || ""),
      role: String(msg.role || "student") as
        | "student"
        | "guru_wali"
        | "guru_bk"
        | "super_admin",
      message: String(msg.message || ""),
      timestamp: String(msg.timestamp || ""),
    }),
  );

  const statusHistory = toArray<Record<string, unknown>>(
    item.statusHistory,
  ).map((history) => ({
    status: String(history.status || "pending") as AduanStatus,
    updatedBy: String(history.updatedBy || ""),
    role: String(history.role || ""),
    updatedAt: String(history.updatedAt || ""),
    note: history.note ? String(history.note) : undefined,
  }));

  return {
    ticketId: String(item.ticketId || ""),
    nisn: String(item.nisn || ""),
    namaSiswa: String(item.namaSiswa || ""),
    kelas: String(item.kelas || ""),
    walas: String(item.walas || ""),
    messages,
    status: String(item.status || "pending") as AduanStatus,
    statusHistory,
    diteruskanKe: (item.diteruskanKe as Aduan["diteruskanKe"]) || null,
    createdAt: String(item.createdAt || ""),
    updatedAt: String(item.updatedAt || ""),
  };
}

export async function fetchAduanList(): Promise<{
  aduan: Aduan[];
  adminNama: string;
  isSuperAdmin: boolean;
}> {
  const res = await fetch(API_BASE, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Gagal mengambil data aduan");
  }

  return {
    aduan: toArray(data?.aduan).map(normalizeAduan),
    adminNama:
      typeof data?.adminNama === "string"
        ? data.adminNama
        : typeof data?.admin?.nama === "string"
          ? data.admin.nama
          : "",
    isSuperAdmin: Boolean(data?.isSuperAdmin),
  };
}

export async function fetchAduanRoom(ticketId: string): Promise<{
  aduan: Aduan;
  adminNama: string;
  isSuperAdmin: boolean;
}> {
  const ticket = ticketId.trim();
  if (!ticket) {
    throw new Error("ticketId wajib diisi");
  }

  const res = await fetch(
    `/api/admin/aduan/room?ticketId=${encodeURIComponent(ticket)}`,
    {
      headers: getAuthHeaders(),
    },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Gagal mengambil room chat aduan");
  }

  return {
    aduan: normalizeAduan(data?.aduan),
    adminNama:
      typeof data?.adminNama === "string"
        ? data.adminNama
        : typeof data?.admin?.nama === "string"
          ? data.admin.nama
          : "",
    isSuperAdmin: Boolean(data?.isSuperAdmin),
  };
}

export async function updateAduanStatus(
  ticketId: string,
  action: string,
  note?: string,
): Promise<{ success: boolean; status: string }> {
  const res = await fetch(API_BASE, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ticketId, action, note }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Gagal mengubah status aduan");
  return data;
}

export async function sendResponse(
  ticketId: string,
  message: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/respond`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ticketId, message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Gagal mengirim balasan");
  return data;
}

export function getStatusLabel(status: AduanStatus): string {
  switch (status) {
    case "pending":
      return "Menunggu tindakan guru wali";
    case "diteruskan":
      return "Sudah diteruskan ke Guru BK / Super Admin";
    case "ditindaklanjuti":
      return "Sedang ditindaklanjuti";
    case "selesai":
      return "Selesai ditangani";
    default:
      return "";
  }
}

export function getStatusColor(status: AduanStatus): string {
  switch (status) {
    case "pending":
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    case "diteruskan":
      return "bg-blue-50 border-blue-200 text-blue-700";
    case "ditindaklanjuti":
      return "bg-orange-50 border-orange-200 text-orange-700";
    case "selesai":
      return "bg-green-50 border-green-200 text-green-700";
    default:
      return "bg-gray-50 border-gray-200 text-gray-700";
  }
}

export function getStatusBadge(status: AduanStatus): string {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "diteruskan":
      return "Diteruskan";
    case "ditindaklanjuti":
      return "Ditindaklanjuti";
    case "selesai":
      return "Selesai";
    default:
      return status;
  }
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
