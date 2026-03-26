import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

function normalizeBearer(rawAuth: string | null): string | null {
  const value = rawAuth?.trim() || "";
  if (!value) return null;

  const token = value.replace(/^(bearer\s+)+/i, "").trim();
  if (!token) return null;

  return `Bearer ${token}`;
}

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
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
      nama?: string;
      username?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const nama = (body.nama || body.username || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama wajib diisi" },
        { status: 400 },
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Email tidak valid" },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password minimal 8 karakter" },
        { status: 400 },
      );
    }

    const payload = {
      nama,
      email,
      password,
      role: body.role || "admin",
    };

    const response = await fetch(`${backendUrl}/v1/admin/admins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: unknown = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      const message =
        (data as { error?: string })?.error ||
        `Gagal mendaftarkan admin (HTTP ${response.status})`;
      return NextResponse.json(
        { success: false, error: message },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        (data as { message?: string })?.message || "Admin berhasil ditambahkan",
      data,
    });
  } catch (error) {
    console.error("[api/admin/register] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
