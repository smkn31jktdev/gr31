import { useState, useEffect, useCallback } from "react";
import { fetchMonitoringData } from "../services";
import { buildMonitoringState, EMPTY_STATE } from "../utils/index";
import type { MonitoringState } from "../utils/index";

export function useMonitoringData() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [monitoringData, setMonitoringData] =
    useState<MonitoringState>(EMPTY_STATE);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const payload = await fetchMonitoringData();
      const rows = Array.isArray(payload.data) ? payload.data : [];
      const nextState = buildMonitoringState(rows);
      setMonitoringData(nextState);
    } catch (error) {
      console.error("[useMonitoringData] fetch error:", error);
      setMonitoringData(EMPTY_STATE);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat monitoring kegiatan.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch data on client-side
    if (typeof window !== "undefined") {
      void loadData();
    }
  }, [loadData]);

  return {
    isLoading,
    errorMessage,
    monitoringData,
    refetch: loadData,
  };
}
