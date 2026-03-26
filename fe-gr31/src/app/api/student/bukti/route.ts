import { NextRequest } from "next/server";
import {
  requireAuth,
  buildQueryString,
  proxyRequest,
  getAuthHeader,
} from "../../_lib/proxy";

export async function GET(request: NextRequest) {
  // Check authorization
  const authError = requireAuth(request);
  if (authError) return authError;

  // Build query string
  const search = request.nextUrl.searchParams;
  const month = search.get("month") || search.get("bulan") || "";
  const qs = month ? `?month=${encodeURIComponent(month)}` : "";

  return proxyRequest(
    `/v1/student/bukti${qs}`,
    {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(request)!,
      },
    },
    "api/student/bukti[GET]",
  );
}

export async function POST(request: NextRequest) {
  // Check authorization
  const authError = requireAuth(request);
  if (authError) return authError;

  // Handle form data
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

  return proxyRequest(
    "/v1/student/bukti",
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(request)!,
      },
      body: outgoingForm,
    },
    "api/student/bukti[POST]",
  );
}
