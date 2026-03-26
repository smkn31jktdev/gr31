import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.API_PROXY_TARGET || "http://localhost:8000";

function normalizeBearer(rawAuth: string | null): string | null {
  const value = rawAuth?.trim() || "";
  if (!value) return null;

  const token = value.replace(/^(bearer\s+)+/i, "").trim();
  if (
    !token ||
    token.toLowerCase() === "null" ||
    token.toLowerCase() === "undefined"
  ) {
    return null;
  }

  return `Bearer ${token}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { error: raw };
  }
}

export async function GET(request: NextRequest) {
  const authHeader = normalizeBearer(request.headers.get("authorization"));
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  const ticketId = request.nextUrl.searchParams.get("ticketId")?.trim() || "";
  if (!ticketId) {
    return NextResponse.json(
      { success: false, error: "ticketId wajib diisi" },
      { status: 400 },
    );
  }

  try {
    const url = `${backendUrl}/v1/admin/aduan/room?ticketId=${encodeURIComponent(ticketId)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await parseResponseBody(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/admin/aduan/room] GET proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
