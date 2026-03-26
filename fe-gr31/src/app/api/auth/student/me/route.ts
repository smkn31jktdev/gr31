import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

function getForwardAuthHeader(request: NextRequest): string | null {
  const raw = request.headers.get("authorization")?.trim() || "";
  if (!raw) return null;

  const token = raw.replace(/^(bearer\s+)+/i, "").trim();
  if (!token) return null;

  return `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const authHeader = getForwardAuthHeader(request);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Backend expects POST for /v1/student/me
    const response = await fetch(`${backendUrl}/v1/student/me`, {
      method: "POST",
      headers,
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/auth/student/me] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

// Support POST for backward compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}
