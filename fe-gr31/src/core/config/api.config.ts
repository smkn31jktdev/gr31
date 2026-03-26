// API Configuration

const getBackendUrlFromEnv = (): string => {
  if (typeof window === "undefined") {
    return process.env.API_PROXY_TARGET || "http://localhost:8000";
  }

  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  const isDevelopment = process.env.NEXT_PUBLIC_IS_DEVELOPMENT === "true";

  if (isDevelopment) {
    return "http://localhost:8000";
  }

  return "https://api-gr31.smkn31jkt.sch.id";
};

export const API_CONFIG = {
  BACKEND_URL: getBackendUrlFromEnv(),
  IS_DEVELOPMENT: process.env.NEXT_PUBLIC_IS_DEVELOPMENT === "true",
} as const;

export const getBackendUrl = (): string => {
  return API_CONFIG.BACKEND_URL;
};
