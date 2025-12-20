import { useState, useEffect, useCallback, useRef } from "react";
import {
  triggerVisualization,
  getVisualizationStatus,
} from "@/services/outfits";

type VisualizationStatus = "none" | "pending" | "completed" | "failed";

export function useVisualization(
  outfitId: string,
  initialStatus?: VisualizationStatus,
  onComplete?: () => void
) {
  const [status, setStatus] = useState<VisualizationStatus>(
    initialStatus || "none"
  );
  const [url, setUrl] = useState<string | null>(null);

  // Track previous status to detect completion
  const prevStatusRef = useRef<VisualizationStatus>(initialStatus || "none");

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

  // Call onComplete when status changes from pending to completed
  useEffect(() => {
    if (
      prevStatusRef.current === "pending" &&
      status === "completed" &&
      onComplete
    ) {
      onComplete();
    }
    prevStatusRef.current = status;
  }, [status, onComplete]);

  const trigger = useCallback(async (regenerate: boolean = false) => {
    // If regenerating, clear the current URL so UI updates immediately
    if (regenerate) {
      setUrl(null);
    }
    setStatus("pending");
    try {
      const res = await triggerVisualization(outfitId, regenerate);
      setStatus(res.status as VisualizationStatus);
      if (res.visualization_url) {
        setUrl(res.visualization_url);
        // If immediately completed (shouldn't happen with generation, but just in case)
        if (res.status === "completed" && onComplete) {
          onComplete();
        }
      }
    } catch {
      setStatus("failed");
    }
  }, [outfitId, onComplete]);

  return { status, url, trigger, refresh: poll };
}
