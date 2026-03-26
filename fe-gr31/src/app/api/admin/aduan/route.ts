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

  try {
    const response = await fetch(`${backendUrl}/v1/admin/aduan`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await parseResponseBody(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/admin/aduan] GET proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authHeader = normalizeBearer(request.headers.get("authorization"));
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      ticketId?: string;
      action?: string;
      note?: string;
    };

    const ticketId = (body.ticketId || "").trim();
    const action = (body.action || "").trim();
    const note = (body.note || "").trim();

    if (!ticketId || !action) {
      return NextResponse.json(
        { success: false, error: "ticketId dan action wajib diisi" },
        { status: 400 },
      );
    }

    const response = await fetch(`${backendUrl}/v1/admin/aduan/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ ticketId, action, note }),
    });

    const data = (await parseResponseBody(response)) as {
      error?: string;
      aduan?: { status?: string };
    };
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `HTTP ${response.status}` },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: data?.aduan?.status || action,
      aduan: data?.aduan,
    });
  } catch (error) {
    console.error("[api/admin/aduan] PATCH proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

