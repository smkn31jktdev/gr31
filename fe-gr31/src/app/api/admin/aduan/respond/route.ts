import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

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

export async function POST(request: NextRequest) {
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
      message?: string;
    };

    const ticketId = (body.ticketId || "").trim();
    const message = (body.message || "").trim();

    if (!ticketId || !message) {
      return NextResponse.json(
        { success: false, error: "ticketId dan message wajib diisi" },
        { status: 400 },
      );
    }

    const response = await fetch(`${backendUrl}/v1/admin/aduan/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ ticketId, message }),
    });

    const data = (await parseResponseBody(response)) as {
      error?: string;
      aduan?: unknown;
    };
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `HTTP ${response.status}` },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      aduan: data?.aduan,
      message: "Balasan berhasil dikirim",
    });
  } catch (error) {
    console.error("[api/admin/aduan/respond] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
