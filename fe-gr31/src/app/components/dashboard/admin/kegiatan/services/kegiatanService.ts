import type { KegiatanApiResponse } from "../types";
import { formatDateForApi } from "../utils/index";

export async function fetchMonitoringData(): Promise<KegiatanApiResponse> {
  if (typeof window === "undefined") {
    throw new Error("Cannot fetch data during server-side rendering");
  }

  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("Sesi admin tidak ditemukan. Silakan login ulang.");
  }

  const now = new Date();
  const start = new Date(2000, 0, 1);
  const params = new URLSearchParams({
    dari: formatDateForApi(start),
    sampai: formatDateForApi(now),
  });

  const response = await fetch(`/api/admin/kegiatan?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload: KegiatanApiResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.error || `Gagal memuat monitoring (${response.status})`,
    );
  }

  return payload;
}
