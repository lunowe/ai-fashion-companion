import { useState, useEffect, useCallback } from "react";
import {
  triggerVisualization,
  getVisualizationStatus,
} from "@/services/outfits";

type VisualizationStatus = "none" | "pending" | "completed" | "failed";

export function useVisualization(
  outfitId: string,
  initialStatus?: VisualizationStatus
) {
  const [status, setStatus] = useState<VisualizationStatus>(
    initialStatus || "none"
  );
  const [url, setUrl] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await getVisualizationStatus(outfitId);
      setStatus(res.status as VisualizationStatus);
      if (res.visualization_url) setUrl(res.visualization_url);
      return res.status;
    } catch {
      setStatus("failed");
      return "failed";
    }
  }, [outfitId]);

  // Poll while pending
  useEffect(() => {
    if (status !== "pending") return;

    const interval = setInterval(async () => {
      const newStatus = await poll();
      if (newStatus !== "pending") {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, poll]);

  const trigger = async (regenerate: boolean = false) => {
    setStatus("pending");
    setUrl(null); // Clear current URL when regenerating
    try {
      const res = await triggerVisualization(outfitId, regenerate);
      setStatus(res.status as VisualizationStatus);
      if (res.visualization_url) setUrl(res.visualization_url);
    } catch {
      setStatus("failed");
    }
  };

  return { status, url, trigger, refresh: poll };
}
