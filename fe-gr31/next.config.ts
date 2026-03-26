import type { NextConfig } from "next";

const backendUrl = process.env.API_PROXY_TARGET || "http://localhost:8000";

const nextConfig: NextConfig = {
  // Disable WebSocket HMR untuk development di VPS
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  async rewrites() {
    return [
      // Student routes
      {
        source: "/api/student/kegiatan",
        destination: `${backendUrl}/v1/student/kegiatan`,
      },
      {
        source: "/api/student/kehadiran",
        destination: `${backendUrl}/v1/student/kehadiran`,
      },
      {
        source: "/api/student/aduan",
        destination: `${backendUrl}/v1/student/aduan`,
      },
      {
        source: "/api/student/bukti",
        destination: `${backendUrl}/v1/student/bukti`,
      },
      {
        source: "/api/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },

      // Admin routes
      {
        source: "/api/admin/admins",
        destination: `${backendUrl}/v1/admin/admins`,
      },
      {
        source: "/api/admin/students",
        destination: `${backendUrl}/v1/admin/students`,
      },
      {
        source: "/api/admin/kegiatan",
        destination: `${backendUrl}/v1/admin/kegiatan`,
      },
      {
        source: "/api/admin/kehadiran",
        destination: `${backendUrl}/v1/admin/kehadiran`,
      },
      {
        source: "/api/admin/aduan",
        destination: `${backendUrl}/v1/admin/aduan`,
      },
      {
        source: "/api/admin/aduan/status",
        destination: `${backendUrl}/v1/admin/aduan/status`,
      },
      {
        source: "/api/admin/aduan/respond",
        destination: `${backendUrl}/v1/admin/aduan/respond`,
      },
      {
        source: "/api/admin/settings",
        destination: `${backendUrl}/v1/admin/settings`,
      },
      {
        source: "/api/admin/profile-photo",
        destination: `${backendUrl}/v1/admin/profile-photo`,
      },

      // Auth login routes (public, no guard)
      {
        source: "/api/auth/admin/login",
        destination: `${backendUrl}/v1/admin/login`,
      },
      {
        source: "/api/auth/student/login",
        destination: `${backendUrl}/v1/student/login`,
      },

      // Piket routes (alias to admin endpoints)
      {
        source: "/api/piket/kehadiran",
        destination: `${backendUrl}/v1/admin/kehadiran`,
      },

      // Refresh token routes
      {
        source: "/api/student/refresh-token",
        destination: `${backendUrl}/v1/student/refresh-token`,
      },
      {
        source: "/api/admin/refresh-token",
        destination: `${backendUrl}/v1/admin/refresh-token`,
      },

      // Ping
      {
        source: "/api/ping",
        destination: `${backendUrl}/v1/ping`,
      },
    ];
  },
};

export default nextConfig;
