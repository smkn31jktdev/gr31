import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.API_PROXY_TARGET || "http://localhost:8000";

function normalizeBearer(rawAuth: string | null): string | null {
  const value = rawAuth?.trim() || "";
  if (!value) return null;

  const token = value.replace(/^(bearer\s+)+/i, "").trim();
  if (!token) return null;

  return `Bearer ${token}`;
}

export async function POST(request: NextRequest) {
  const authHeader = normalizeBearer(request.headers.get("authorization"));
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    const response = await fetch(`${backendUrl}/v1/admin/tambah-admin/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    let data: unknown = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { error: raw || `HTTP ${response.status}` };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/admin/tambah-admin/bulk] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
