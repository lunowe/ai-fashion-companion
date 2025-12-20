import { useState, useEffect, useCallback, useRef } from "react";
import {
  triggerVisualization,
  getVisualizationStatus,
} from "@/services/outfits";

type VisualizationStatus = "none" | "pending" | "completed" | "failed";

export function useVisualization(
  outfitId: string,
  initialStatus?: VisualizationStatus,
  initialUrl?: string | null,
  onComplete?: () => void
) {
  const [status, setStatus] = useState<VisualizationStatus>(
    initialStatus || "none"
  );
  const [url, setUrl] = useState<string | null>(initialUrl || null);
  const [isPolling, setIsPolling] = useState(false);

  // Track if we've triggered from this hook instance
  const hasTriggeredRef = useRef(false);

  // Sync with external data when it changes (e.g., from query refresh)
  useEffect(() => {
    // Only sync if we haven't triggered locally and aren't polling
    if (!hasTriggeredRef.current && !isPolling) {
      if (initialStatus) setStatus(initialStatus);
      if (initialUrl) setUrl(initialUrl);
    }
  }, [initialStatus, initialUrl, isPolling]);

  // Polling function
  const poll = useCallback(async (): Promise<VisualizationStatus> => {
    try {
      const res = await getVisualizationStatus(outfitId);
      const newStatus = res.status as VisualizationStatus;

      setStatus(newStatus);
      if (res.visualization_url) {
        setUrl(res.visualization_url);
      }

      return newStatus;
    } catch (error) {
      console.error("Visualization poll error:", error);
      setStatus("failed");
      return "failed";
    }
  }, [outfitId]);

  // Poll while pending
  useEffect(() => {
    if (status !== "pending") {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    let isCancelled = false;

    const pollInterval = async () => {
      while (!isCancelled) {
        await new Promise((resolve) => setTimeout(resolve, 2500)); // Poll every 2.5 seconds

        if (isCancelled) break;

        const newStatus = await poll();

        if (newStatus !== "pending") {
          // Generation completed or failed
          setIsPolling(false);
          hasTriggeredRef.current = false;

          if (newStatus === "completed" && onComplete) {
            onComplete();
          }
          break;
        }
      }
    };

    pollInterval();

    return () => {
      isCancelled = true;
      setIsPolling(false);
    };
  }, [status, poll, onComplete]);

  // Trigger visualization generation
  const trigger = useCallback(async (regenerate: boolean = false) => {
    hasTriggeredRef.current = true;

    // Clear URL immediately when regenerating
    if (regenerate) {
      setUrl(null);
    }

    setStatus("pending");

    try {
      const res = await triggerVisualization(outfitId, regenerate);
      const newStatus = res.status as VisualizationStatus;

      setStatus(newStatus);

      if (res.visualization_url) {
        setUrl(res.visualization_url);
      }

      // If immediately completed (unlikely but possible)
      if (newStatus === "completed") {
        hasTriggeredRef.current = false;
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Visualization trigger error:", error);
      setStatus("failed");
      hasTriggeredRef.current = false;
    }
  }, [outfitId, onComplete]);

  return {
    status,
    url,
    trigger,
    refresh: poll,
    isPolling
  };
}
