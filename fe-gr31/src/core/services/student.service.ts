import { API_ENDPOINTS, PROXY_ENDPOINTS } from "@/core/config";
import { apiRequest, proxyRequest } from "@/core/services/http";

// Payload Types

export type KegiatanPayload = {
  tanggal: string;
  section: string;
  data: Record<string, unknown>;
};

export type KehadiranPayload = {
  tanggal: string;
  kehadiran: {
    status: string;
    alasanTidakHadir?: string;
    koordinat?: {
      lat: number;
      lng: number;
    };
    jarak?: number;
    akurasi?: number;
  };
};

export type AduanPayload = {
  ticketId?: string;
  message: string;
};

export type StudentKehadiranQuery = {
  tanggal?: string;
  bulan?: string;
};

// Student Service (Direct API calls)

export const studentService = {
  upsertKegiatan(token: string, payload: KegiatanPayload) {
    return apiRequest<{ message: string; data: unknown }>(
      API_ENDPOINTS.student.kegiatan,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  getKegiatan(token: string, tanggal?: string) {
    return apiRequest<{ kegiatan: unknown }>(API_ENDPOINTS.student.kegiatan, {
      method: "GET",
      token,
      query: { tanggal },
    });
  },

  upsertKehadiran(token: string, payload: KehadiranPayload) {
    return apiRequest<{ message: string; data: unknown }>(
      API_ENDPOINTS.student.kehadiran,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  getKehadiran(token: string, query: StudentKehadiranQuery = {}) {
    return apiRequest<unknown>(API_ENDPOINTS.student.kehadiran, {
      method: "GET",
      token,
      query,
    });
  },

  createOrReplyAduan(token: string, payload: AduanPayload) {
    return apiRequest<{ success?: boolean; message?: string; aduan: unknown }>(
      API_ENDPOINTS.student.aduan,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  getAduan(token: string) {
    return apiRequest<{ aduan: unknown[]; total: number }>(
      API_ENDPOINTS.student.aduan,
      {
        method: "GET",
        token,
      },
    );
  },
};

// Student Service (Proxy calls for client components)
export const studentProxyService = {
  upsertKegiatan(token: string, payload: KegiatanPayload) {
    return proxyRequest<{ message: string; data: unknown }>(
      PROXY_ENDPOINTS.student.kegiatan,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  getKegiatan(token: string, tanggal?: string) {
    return proxyRequest<{ kegiatan: unknown }>(
      PROXY_ENDPOINTS.student.kegiatan,
      {
        method: "GET",
        token,
        query: { tanggal },
      },
    );
  },

  upsertKehadiran(token: string, payload: KehadiranPayload) {
    return proxyRequest<{ message: string; data: unknown }>(
      PROXY_ENDPOINTS.student.kehadiran,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  getKehadiran(token: string, query: StudentKehadiranQuery = {}) {
    return proxyRequest<unknown>(PROXY_ENDPOINTS.student.kehadiran, {
      method: "GET",
      token,
      query,
    });
  },

  createOrReplyAduan(token: string, payload: AduanPayload) {
    return proxyRequest<{
      success?: boolean;
      message?: string;
      aduan: unknown;
    }>(PROXY_ENDPOINTS.student.aduan, {
      method: "POST",
      token,
      body: payload,
    });
  },

  getAduan(token: string) {
    return proxyRequest<{ aduan: unknown[]; total: number }>(
      PROXY_ENDPOINTS.student.aduan,
      {
        method: "GET",
        token,
      },
    );
  },
};
