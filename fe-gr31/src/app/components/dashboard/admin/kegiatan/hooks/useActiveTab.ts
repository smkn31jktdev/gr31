import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { TabId } from "../types";
import { TABS } from "../constants";

export function useActiveTab() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab") as TabId | null;

  const [activeTabId, setActiveTabId] = useState<TabId>("bangun");

  useEffect(() => {
    // Initialize from URL on client-side
    if (tabQuery && TABS.some((t) => t.id === tabQuery)) {
      setActiveTabId(tabQuery);
    }
  }, [tabQuery]);

  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  return {
    activeTabId,
    activeTab,
    setActiveTabId,
  };
}
