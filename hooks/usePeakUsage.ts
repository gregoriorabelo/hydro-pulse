"use client";

import { useEffect, useState } from "react";
import type { ReservoirPeakUsage } from "@/lib/peakUsage";
import { useCondominiumContext } from "@/lib/condominium-context";

export function usePeakUsage() {
  const { activeCondominiumId } = useCondominiumContext();
  const [peaks, setPeaks] = useState<ReservoirPeakUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCondominiumId) {
      return;
    }

    let ignore = false;

    function loadPeaks() {
      fetch(`/api/consumption/peak?condominiumId=${activeCondominiumId}`)
        .then((response) => response.json())
        .then((data) => {
          if (ignore) return;

          setPeaks(data.peaks ?? []);
          setLoading(false);
        });
    }

    loadPeaks();

    const interval = setInterval(loadPeaks, 60000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeCondominiumId]);

  return {
    peaks: activeCondominiumId ? peaks : [],
    loading: activeCondominiumId ? loading : false,
  };
}
