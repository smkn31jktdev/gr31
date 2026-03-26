import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.API_PROXY_TARGET || "http://localhost:8000";

function normalizeBearer(rawAuth: string | null): string | null {
  const value = rawAuth?.trim() || "";
  if (!value) return null;

  const token = value.replace(/^(bearer\s+)+/i, "").trim();
  if (!token) return null;

  return `Bearer ${token}`;
}

function getAuthHeader(request: NextRequest): string | null {
  return normalizeBearer(request.headers.get("authorization"));
}

export async function GET(request: NextRequest) {
  const authHeader = getAuthHeader(request);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const nisn = request.nextUrl.searchParams.get("nisn") || "";
    const params = new URLSearchParams();
    if (nisn) params.set("nisn", nisn);

    const response = await fetch(
      `${backendUrl}/v1/admin/delete?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/admin/delete] GET proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = getAuthHeader(request);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    const response = await fetch(`${backendUrl}/v1/admin/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/admin/delete] DELETE proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
