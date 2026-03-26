import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

function getForwardAuthHeader(request: NextRequest): string | null {
  const raw = request.headers.get("authorization")?.trim() || "";
  if (!raw) return null;

  const token = raw.replace(/^(bearer\s+)+/i, "").trim();
  if (!token) return null;

  return `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  const authHeader = getForwardAuthHeader(request);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const search = request.nextUrl.searchParams;
    const month = search.get("month") || search.get("bulan") || "";
    const qs = month ? `?month=${encodeURIComponent(month)}` : "";

    const response = await fetch(`${backendUrl}/v1/student/bukti${qs}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/bukti][GET] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = getForwardAuthHeader(request);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Token tidak ditemukan" },
      { status: 401 },
    );
  }

  try {
    const incomingForm = await request.formData();
    const outgoingForm = new FormData();

    const foto = incomingForm.get("foto");
    if (foto instanceof File) {
      outgoingForm.append("foto", foto, foto.name);
    }

    const linkYouTube = incomingForm.get("linkYouTube");
    if (typeof linkYouTube === "string") {
      outgoingForm.append("linkYouTube", linkYouTube);
    }

    const response = await fetch(`${backendUrl}/v1/student/bukti`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: outgoingForm,
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/bukti][POST] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
