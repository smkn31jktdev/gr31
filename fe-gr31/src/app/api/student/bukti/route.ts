import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

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
  const month =
    request.nextUrl.searchParams.get("month") ||
    request.nextUrl.searchParams.get("bulan") ||
    "";

  try {
    const params = new URLSearchParams();
    if (month) params.set("month", month);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
      console.log(
        "[api/student/bukti] GET - Forwarding auth header:",
        authHeader.substring(0, 20) + "...",
      );
    } else {
      console.warn("[api/student/bukti] GET - No auth header found!");
    }

    const url = `${backendUrl}/v1/student/bukti?${params.toString()}`;
    console.log("[api/student/bukti] GET - Fetching:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("[api/student/bukti] GET - Response status:", response.status);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/bukti] GET proxy error:", error);
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

    const headers: Record<string, string> = {};
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
      console.log(
        "[api/student/bukti] POST - Forwarding auth header:",
        authHeader.substring(0, 20) + "...",
      );
    } else {
      console.warn("[api/student/bukti] POST - No auth header found!");
    }

    const url = `${backendUrl}/v1/student/bukti`;
    console.log("[api/student/bukti] POST - Fetching:", url);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: outgoingForm,
    });

    console.log("[api/student/bukti] POST - Response status:", response.status);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/student/bukti] POST proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
