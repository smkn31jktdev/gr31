/**
 * Token Utility Functions
 *
 * Helper functions for JWT token validation, expiry checking, and debugging.
 */

/**
 * Decode JWT payload without verification (for client-side inspection only)
 * ⚠️ DO NOT use for security checks - only for debugging/logging
 */
export function decodeJWTPayload(token: string): {
  exp?: number;
  iat?: number;
  sub?: string;
  role?: string;
  [key: string]: unknown;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("[decodeJWTPayload] Invalid JWT format");
      return null;
    }

    const payload = parts[1];
    // Add padding if needed
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("[decodeJWTPayload] Failed to decode:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload || !payload.exp) {
    return true; // Consider expired if no exp claim
  }

  // Add 30 seconds buffer for clock skew
  const now = Date.now() / 1000;
  return now >= payload.exp - 30;
}

/**
 * Get token expiry date
 */
export function getTokenExpiryDate(token: string): Date | null {
  const payload = decodeJWTPayload(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return new Date(payload.exp * 1000);
}

/**
 * Get time until token expires (in milliseconds)
 * Returns negative value if already expired
 */
export function getTimeUntilExpiry(token: string): number {
  const payload = decodeJWTPayload(token);
  if (!payload || !payload.exp) {
    return -1;
  }

  const now = Date.now();
  const expiryTime = payload.exp * 1000;
  return expiryTime - now;
}

/**
 * Debug token - log token info without exposing sensitive data
 */
export function debugToken(token: string, label: string = "Token"): void {
  const payload = decodeJWTPayload(token);
  if (!payload) {
    console.log(`[${label}] Invalid token`);
    return;
  }

  const expiryDate = getTokenExpiryDate(token);
  const timeUntilExpiry = getTimeUntilExpiry(token);
  const isExpired = isTokenExpired(token);

  console.group(`[${label}] Token Debug Info`);
  console.log("Role:", payload.role || "N/A");
  console.log("Subject:", payload.sub || "N/A");
  console.log(
    "Issued At:",
    payload.iat ? new Date(payload.iat * 1000).toISOString() : "N/A",
  );
  console.log("Expires At:", expiryDate?.toISOString() || "N/A");
  console.log("Time Until Expiry:", formatDuration(timeUntilExpiry));
  console.log("Is Expired:", isExpired ? "❌ Yes" : "✅ No");
  console.log("Token Length:", token.length, "characters");
  console.log("Token Prefix (first 20 chars):", token.substring(0, 20) + "...");
  console.groupEnd();
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 0) return "Expired";
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3600000)
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  if (ms < 86400000)
    return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
  return `${Math.floor(ms / 86400000)}d ${Math.floor((ms % 86400000) / 3600000)}h`;
}

/**
 * Validate token before making API requests
 * Returns true if token is valid, false otherwise
 * Also handles redirect if token is expired
 */
export function validateTokenAndRedirect(
  token: string | null,
  loginPath: string = "/page/login/siswa",
): boolean {
  if (!token) {
    console.warn("[validateTokenAndRedirect] No token found");
    return false;
  }

  if (isTokenExpired(token)) {
    console.warn(
      "[validateTokenAndRedirect] Token expired, redirecting to login",
    );
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    if (typeof window !== "undefined") {
      window.location.href = `${loginPath}?expired=1`;
    }
    return false;
  }

  return true;
}

/**
 * Get auth headers for API requests
 * Automatically validates token and returns headers if valid
 */
export function getAuthHeaders(
  tokenKey: string = "studentToken",
): HeadersInit | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem(tokenKey);
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    console.warn("[getAuthHeaders] Token expired");
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(`${tokenKey.replace("Token", "")}User`);
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get JSON headers with auth for API requests
 */
export function getJsonAuthHeaders(
  tokenKey: string = "studentToken",
): HeadersInit {
  const authHeaders = getAuthHeaders(tokenKey);

  if (!authHeaders) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    ...authHeaders,
  };
}
