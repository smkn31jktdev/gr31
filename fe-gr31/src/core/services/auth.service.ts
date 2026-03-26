import { API_ENDPOINTS, PROXY_ENDPOINTS } from "@/core/config";
import { apiRequest, proxyRequest } from "@/core/services/http";

// Payload Types

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type StudentLoginPayload = {
  nisn: string;
  password: string;
};

// Response Types

export type AuthLoginResponse = {
  token: string;
  admin?: {
    id: string;
    nama: string;
    email: string;
  };
  student?: {
    id: string;
    nisn: string;
    nama: string;
  };
};

export type AdminMeResponse = {
  user: {
    id: string;
    nama: string;
    email: string;
  };
};

export type StudentMeResponse = {
  student: {
    id: string;
    nama: string;
    nisn: string;
    kelas: string;
    email: string | null;
  };
};

export type RefreshTokenResponse = {
  token: string;
};

// Auth Service (Direct API calls for server-side / legacy)

export const authService = {
  adminLogin(payload: AdminLoginPayload) {
    return apiRequest<AuthLoginResponse>(API_ENDPOINTS.auth.adminLogin, {
      method: "POST",
      body: payload,
    });
  },

  studentLogin(payload: StudentLoginPayload) {
    return apiRequest<AuthLoginResponse>(API_ENDPOINTS.auth.studentLogin, {
      method: "POST",
      body: payload,
    });
  },

  adminMe(token: string) {
    return apiRequest<AdminMeResponse>(API_ENDPOINTS.auth.adminMe, {
      method: "POST",
      token,
    });
  },

  studentMe(token: string) {
    return apiRequest<StudentMeResponse>(API_ENDPOINTS.auth.studentMe, {
      method: "POST",
      token,
    });
  },

  adminRefreshToken(token: string) {
    return apiRequest<RefreshTokenResponse>(API_ENDPOINTS.admin.refreshToken, {
      method: "POST",
      token,
    });
  },

  studentRefreshToken(token: string) {
    return apiRequest<RefreshTokenResponse>(
      API_ENDPOINTS.student.refreshToken,
      {
        method: "POST",
        token,
      },
    );
  },
};

// Auth Service (Proxy calls for client components)

export const authProxyService = {
  adminLogin(payload: AdminLoginPayload) {
    return proxyRequest<AuthLoginResponse>(PROXY_ENDPOINTS.auth.adminLogin, {
      method: "POST",
      body: payload,
    });
  },

  studentLogin(payload: StudentLoginPayload) {
    return proxyRequest<AuthLoginResponse>(PROXY_ENDPOINTS.auth.studentLogin, {
      method: "POST",
      body: payload,
    });
  },

  adminMe() {
    return proxyRequest<AdminMeResponse>(PROXY_ENDPOINTS.auth.adminMe);
  },

  studentMe() {
    return proxyRequest<StudentMeResponse>(PROXY_ENDPOINTS.auth.studentMe);
  },
};
