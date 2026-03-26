import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/core/config/api.config";

const backendUrl = getBackendUrl();

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

    const response = await fetch(`${backendUrl}/v1/student/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/auth/student/login] proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghubungi server" },
      { status: 502 },
    );
  }
}
