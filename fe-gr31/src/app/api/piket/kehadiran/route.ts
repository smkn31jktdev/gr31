import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

function normalizeAuthorizationHeader(raw: string | null): string {
  if (!raw) return "";

  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/^bearer\s+/i.test(trimmed)) {
    const token = trimmed.replace(/^bearer\s+/i, "").trim();
    return token ? `Bearer ${token}` : "";
  }

  return `Bearer ${trimmed}`;
}

export async function GET(request: NextRequest) {
  const tokenFromHeader = request.headers.get("authorization");
  const authHeader = normalizeAuthorizationHeader(tokenFromHeader);

  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const search = request.nextUrl.searchParams.toString();
    const targetUrl = `${backendUrl}/v1/admin/kehadiran${search ? `?${search}` : ""}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/piket/kehadiran] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
