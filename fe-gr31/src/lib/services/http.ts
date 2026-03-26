import { createAuthHeaders, toApiUrl } from "@/core/config";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /**
   * When true, use the path as-is (for proxy routes like /api/*).
   * When false (default), prepend the backend base URL via toApiUrl().
   */
  proxy?: boolean;
};

function buildUrl(
  path: string,
  query?: Record<string, QueryValue>,
  proxy?: boolean,
): string {
  const base = proxy ? path : toApiUrl(path);
  const url = new URL(
    base,
    typeof window !== "undefined" ? window.location.origin : undefined,
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const {
    method = "GET",
    token,
    query,
    body,
    headers,
    signal,
    proxy,
  } = options;

  const requestHeaders: HeadersInit = {
    ...createAuthHeaders(token),
    ...headers,
  };

  const response = await fetch(buildUrl(path, query, proxy), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const errorMessage =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: unknown }).error || fallbackMessage)
        : fallbackMessage;

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as TResponse;
}

/**
 * Shorthand for proxy-based requests (browser-side, via /api/* Next.js routes).
 * This is the recommended way to call APIs from client components.
 */
export async function proxyRequest<TResponse>(
  path: string,
  options: Omit<ApiRequestOptions, "proxy"> = {},
): Promise<TResponse> {
  return apiRequest<TResponse>(path, { ...options, proxy: true });
}
