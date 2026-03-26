import { NextRequest, NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL || "http://localhost:8000";

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
  const tanggal = request.nextUrl.searchParams.get("tanggal") || "";

  try {
    const params = new URLSearchParams();
    if (tanggal) params.set("tanggal", tanggal);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
      console.log("[api/student/kegiatan] GET - Forwarding auth header:", authHeader.substring(0, 20) + "...");
    } else {
      console.warn("[api/student/kegiatan] GET - No auth header found!");
    }

    const url = `${backendUrl}/v1/student/kegiatan?${params.toString()}`;
    console.log("[api/student/kegiatan] GET - Fetching:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("[api/student/kegiatan] GET - Response status:", response.status);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/kegiatan] GET proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const authHeader = getForwardAuthHeader(request);

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
      console.log("[api/student/kegiatan] POST - Forwarding auth header:", authHeader.substring(0, 20) + "...");
    } else {
      console.warn("[api/student/kegiatan] POST - No auth header found!");
    }

    const url = `${backendUrl}/v1/student/kegiatan`;
    console.log("[api/student/kegiatan] POST - Fetching:", url);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log("[api/student/kegiatan] POST - Response status:", response.status);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/kegiatan] POST proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const authHeader = getForwardAuthHeader(request);

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
      console.log("[api/student/kegiatan] PUT - Forwarding auth header:", authHeader.substring(0, 20) + "...");
    } else {
      console.warn("[api/student/kegiatan] PUT - No auth header found!");
    }

    const url = `${backendUrl}/v1/student/kegiatan`;
    console.log("[api/student/kegiatan] PUT - Fetching:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    console.log("[api/student/kegiatan] PUT - Response status:", response.status);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/kegiatan] PUT proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const authHeader = getForwardAuthHeader(request);
  const tanggal = request.nextUrl.searchParams.get("tanggal") || "";
  const section = request.nextUrl.searchParams.get("section") || "";

  try {
    const params = new URLSearchParams();
    if (tanggal) params.set("tanggal", tanggal);
    if (section) params.set("section", section);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
      console.log("[api/student/kegiatan] DELETE - Forwarding auth header:", authHeader.substring(0, 20) + "...");
    } else {
      console.warn("[api/student/kegiatan] DELETE - No auth header found!");
    }

    const url = `${backendUrl}/v1/student/kegiatan?${params.toString()}`;
    console.log("[api/student/kegiatan] DELETE - Fetching:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    console.log("[api/student/kegiatan] DELETE - Response status:", response.status);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/kegiatan] DELETE proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
