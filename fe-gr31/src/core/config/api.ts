// API Configuration
const _devBaseUrl = "http://localhost:8000";
const _prodBaseUrl = "https://api.gr31.tech";

const envIsDevelopment = process.env.NEXT_PUBLIC_IS_DEVELOPMENT;
export const isDevelopment = envIsDevelopment
  ? envIsDevelopment === "true"
  : true;

// Optional override if you need full control from environment variables.
const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const apiVersion = "/v1";
export const baseUrl =
  envBaseUrl || (isDevelopment ? _devBaseUrl : _prodBaseUrl);

// Proxy-based endpoints (browser-side calls)
export const PROXY_ENDPOINTS = {
  auth: {
    adminLogin: "/api/auth/admin/login",
    adminMe: "/api/auth/admin/me",
    studentLogin: "/api/auth/student/login",
    studentMe: "/api/auth/student/me",
  },
  student: {
    kegiatan: "/api/student/kegiatan",
    kehadiran: "/api/student/kehadiran",
    bukti: "/api/student/bukti",
    aduan: "/api/student/aduan",
    logout: "/api/student/logout",
    refreshToken: "/api/student/refresh-token",
  },
  admin: {
    admins: "/api/admin/admins",
    students: "/api/admin/students",
    kegiatan: "/api/admin/kegiatan",
    profilePhoto: "/api/admin/profile-photo",
    kegiatanSummary: "/api/admin/kegiatan/summary",
    kehadiran: "/api/admin/kehadiran",
    aduan: "/api/admin/aduan",
    aduanUpdateStatus: "/api/admin/aduan/status",
    aduanRespond: "/api/admin/aduan/respond",
    refreshToken: "/api/admin/refresh-token",
  },
  piket: {
    kehadiran: "/api/piket/kehadiran",
  },
  ping: "/api/ping",
} as const;

// Direct API endpoints (server-side / SSR calls)
export const API_ENDPOINTS = {
  ping: `${apiVersion}/ping`,
  auth: {
    adminLogin: `${apiVersion}/admin/login`,
    adminMe: `${apiVersion}/admin/me`,
    studentLogin: `${apiVersion}/student/login`,
    studentMe: `${apiVersion}/student/me`,
  },
  student: {
    kegiatan: `${apiVersion}/student/kegiatan`,
    kehadiran: `${apiVersion}/student/kehadiran`,
    bukti: `${apiVersion}/student/bukti`,
    aduan: `${apiVersion}/student/aduan`,
    refreshToken: `${apiVersion}/student/refresh-token`,
  },
  admin: {
    admins: `${apiVersion}/admin/admins`,
    students: `${apiVersion}/admin/students`,
    kegiatanMonitoring: `${apiVersion}/admin/kegiatan`,
    profilePhoto: `${apiVersion}/admin/profile-photo`,
    kehadiranMonitoring: `${apiVersion}/admin/kehadiran`,
    aduanMonitoring: `${apiVersion}/admin/aduan`,
    aduanUpdateStatus: `${apiVersion}/admin/aduan/status`,
    aduanRespond: `${apiVersion}/admin/aduan/respond`,
    refreshToken: `${apiVersion}/admin/refresh-token`,
  },
  internal: {
    clientFind: "/internal/client-find",
    clientUpsert: "/internal/client-upsert",
    clientDelete: "/internal/client-delete",
  },
} as const;

export function toApiUrl(path: string): string {
  return `${baseUrl}${path}`;
}

export function createAuthHeaders(token?: string): HeadersInit {
  if (!token) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const API_NOTES = {
  deleteAdminOrStudent:
    "Saat ini route publik admin delete admin/siswa belum tersedia di be-gr31. Gunakan endpoint internal clientDelete hanya jika sudah punya internal auth dan payload filter yang sesuai.",
} as const;
