import { useMemo } from "react";
import type { TabId } from "../types";
import type { MonitoringState } from "../utils";
import { BangunWrapper } from "../bangun";
import { BeribadahWrapper } from "../beribadah";
import { MakanWrapper } from "../makan";
import { BelajarWrapper } from "../belajar";
import { BermasyarakatWrapper } from "../bermasyarakat";
import { OlahragaWrapper } from "../olahraga";
import { TidurWrapper } from "../tidur";

interface TabContentProps {
  activeTabId: TabId;
  monitoringData: MonitoringState;
}

export function TabContent({ activeTabId, monitoringData }: TabContentProps) {
  const content = useMemo(() => {
    switch (activeTabId) {
      case "bangun":
        return <BangunWrapper students={monitoringData.bangun} />;
      case "beribadah":
        return <BeribadahWrapper students={monitoringData.beribadah} />;
      case "makan":
        return <MakanWrapper students={monitoringData.makan} />;
      case "belajar":
        return <BelajarWrapper students={monitoringData.belajar} />;
      case "bermasyarakat":
        return <BermasyarakatWrapper students={monitoringData.bermasyarakat} />;
      case "olahraga":
        return <OlahragaWrapper students={monitoringData.olahraga} />;
      case "tidur":
        return <TidurWrapper students={monitoringData.tidur} />;
      default:
        return <BangunWrapper students={monitoringData.bangun} />;
    }
  }, [activeTabId, monitoringData]);

  return content;
}
