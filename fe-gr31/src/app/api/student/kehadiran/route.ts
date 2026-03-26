import { NextRequest, NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const authHeader = request.headers.get("authorization");

  const tanggal = request.nextUrl.searchParams.get("tanggal") || "";
  const bulan = request.nextUrl.searchParams.get("bulan") || "";

  try {
    const params = new URLSearchParams();
    if (tanggal) params.set("tanggal", tanggal);
    if (bulan) params.set("bulan", bulan);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(
      `${backendUrl}/v1/student/kehadiran?${params.toString()}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/kehadiran] GET proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${backendUrl}/v1/student/kehadiran`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/kehadiran] POST proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
