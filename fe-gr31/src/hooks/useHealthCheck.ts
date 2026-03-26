"use client";

import { useState, useEffect, useCallback } from "react";
import { PROXY_ENDPOINTS } from "@/core/config";

interface HealthCheckResult {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  latencyMs: number | null;
  retry: () => void;
}

/**
 * Hook to check if the Go backend is reachable.
 * Uses the /api/ping proxy route which forwards to /v1/ping on the backend.
 */
export function useHealthCheck(autoCheck = true): HealthCheckResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const start = performance.now();

    try {
      const response = await fetch(PROXY_ENDPOINTS.ping, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);

      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setError(`Backend returned status ${response.status}`);
      }
    } catch (err) {
      setIsConnected(false);
      setLatencyMs(null);

      if (err instanceof DOMException && err.name === "TimeoutError") {
        setError("Backend tidak merespons (timeout)");
      } else {
        setError("Tidak dapat terhubung ke backend");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkHealth();
    }
  }, [autoCheck, checkHealth]);

  return {
    isConnected,
    isLoading,
    error,
    latencyMs,
    retry: checkHealth,
  };
}
