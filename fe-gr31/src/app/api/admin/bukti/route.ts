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

export async function GET(request: NextRequest) {
  const authHeader = normalizeBearer(request.headers.get("authorization"));

  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token admin tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const month = request.nextUrl.searchParams.get("month") || "";
    const kelas = request.nextUrl.searchParams.get("kelas") || "";
    const nisn = request.nextUrl.searchParams.get("nisn") || "";

    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (kelas) params.set("kelas", kelas);
    if (nisn) params.set("nisn", nisn);

    const backendResponse = await fetch(
      `${backendUrl}/v1/admin/bukti?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      const message =
        (errorData as { error?: string }).error ||
        "Gagal memuat data bukti dari backend";
      return NextResponse.json(
        { success: false, error: message },
        { status: backendResponse.status },
      );
    }
    const payload = await backendResponse.json();
    const list = Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];

    return NextResponse.json(list);
  } catch (error) {
    console.error("[api/admin/bukti] error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat memuat bukti" },
      { status: 500 },
    );
  }
}
