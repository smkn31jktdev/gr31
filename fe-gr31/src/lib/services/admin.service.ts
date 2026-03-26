import { API_ENDPOINTS, PROXY_ENDPOINTS } from "@/core/config";
import { apiRequest, proxyRequest } from "@/core/services/http";

// Payload Types

export type CreateAdminPayload = {
  nama: string;
  email: string;
  password: string;
  role: string;
};

export type CreateStudentPayload = {
  nisn: string;
  nama: string;
  kelas: string;
  walas: string;
  email: string;
  password: string;
};

export type MonitoringQuery = {
  nisn?: string;
  kelas?: string;
  tanggal?: string;
  dari?: string;
  sampai?: string;
  status?: string;
  ticketId?: string;
};

export type AdminFilter = {
  email?: string;
  role?: string;
};

export type StudentFilter = {
  nisn?: string;
  kelas?: string;
};

export type UpdateAduanStatusPayload = {
  ticketId: string;
  status: string;
  diteruskanKe?: string;
};

export type ReplyAduanPayload = {
  ticketId: string;
  message: string;
};

export type InternalDeletePayload = Record<string, unknown>;

// Admin Service (Direct API calls for server-side / legacy)

export const adminService = {
  createAdmin(token: string, payload: CreateAdminPayload) {
    return apiRequest<{ message: string; admin: unknown }>(
      API_ENDPOINTS.admin.admins,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  listAdmins(token: string, query: AdminFilter = {}) {
    return apiRequest<{ data: unknown[]; total: number }>(
      API_ENDPOINTS.admin.admins,
      {
        method: "GET",
        token,
        query,
      },
    );
  },

  createStudent(token: string, payload: CreateStudentPayload) {
    return apiRequest<{ message: string; student: unknown }>(
      API_ENDPOINTS.admin.students,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  listStudents(token: string, query: StudentFilter = {}) {
    return apiRequest<{ data: unknown[]; total: number }>(
      API_ENDPOINTS.admin.students,
      {
        method: "GET",
        token,
        query,
      },
    );
  },

  monitorKegiatan(token: string, query: MonitoringQuery = {}) {
    return apiRequest<unknown>(API_ENDPOINTS.admin.kegiatanMonitoring, {
      method: "GET",
      token,
      query,
    });
  },

  monitorKehadiran(token: string, query: MonitoringQuery = {}) {
    return apiRequest<unknown>(API_ENDPOINTS.admin.kehadiranMonitoring, {
      method: "GET",
      token,
      query,
    });
  },

  monitorAduan(token: string, query: MonitoringQuery = {}) {
    return apiRequest<{ aduan: unknown[]; total: number }>(
      API_ENDPOINTS.admin.aduanMonitoring,
      {
        method: "GET",
        token,
        query,
      },
    );
  },

  updateAduanStatus(token: string, payload: UpdateAduanStatusPayload) {
    return apiRequest<{ message: string; aduan: unknown }>(
      API_ENDPOINTS.admin.aduanUpdateStatus,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  replyAduan(token: string, payload: ReplyAduanPayload) {
    return apiRequest<{ message: string; aduan: unknown }>(
      API_ENDPOINTS.admin.aduanRespond,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  internalDeleteClientData(
    internalToken: string,
    payload: InternalDeletePayload,
  ) {
    return apiRequest<unknown>(API_ENDPOINTS.internal.clientDelete, {
      method: "DELETE",
      token: internalToken,
      body: payload,
    });
  },
};

// Admin Service (Proxy calls for client components)

export const adminProxyService = {
  createAdmin(token: string, payload: CreateAdminPayload) {
    return proxyRequest<{ message: string; admin: unknown }>(
      PROXY_ENDPOINTS.admin.admins,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  listAdmins(token: string, query: AdminFilter = {}) {
    return proxyRequest<{ data: unknown[]; total: number }>(
      PROXY_ENDPOINTS.admin.admins,
      {
        method: "GET",
        token,
        query,
      },
    );
  },

  createStudent(token: string, payload: CreateStudentPayload) {
    return proxyRequest<{ message: string; student: unknown }>(
      PROXY_ENDPOINTS.admin.students,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  listStudents(token: string, query: StudentFilter = {}) {
    return proxyRequest<{ data: unknown[]; total: number }>(
      PROXY_ENDPOINTS.admin.students,
      {
        method: "GET",
        token,
        query,
      },
    );
  },

  monitorKegiatan(token: string, query: MonitoringQuery = {}) {
    return proxyRequest<unknown>(PROXY_ENDPOINTS.admin.kegiatan, {
      method: "GET",
      token,
      query,
    });
  },

  monitorKehadiran(token: string, query: MonitoringQuery = {}) {
    return proxyRequest<unknown>(PROXY_ENDPOINTS.admin.kehadiran, {
      method: "GET",
      token,
      query,
    });
  },

  monitorAduan(token: string, query: MonitoringQuery = {}) {
    return proxyRequest<{ aduan: unknown[]; total: number }>(
      PROXY_ENDPOINTS.admin.aduan,
      {
        method: "GET",
        token,
        query,
      },
    );
  },

  updateAduanStatus(token: string, payload: UpdateAduanStatusPayload) {
    return proxyRequest<{ message: string; aduan: unknown }>(
      PROXY_ENDPOINTS.admin.aduanUpdateStatus,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },

  replyAduan(token: string, payload: ReplyAduanPayload) {
    return proxyRequest<{ message: string; aduan: unknown }>(
      PROXY_ENDPOINTS.admin.aduanRespond,
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  },
};
