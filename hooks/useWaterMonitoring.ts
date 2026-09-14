"use client";

import { useEffect, useState } from "react";
import type { WaterBlock } from "@/types/block";
import { getBlocks } from "@/services/waterService";

export function useWaterMonitoring() {
  const [blocks, setBlocks] = useState<WaterBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    function loadBlocks() {
      getBlocks().then((data) => {
        if (ignore) return;

        setBlocks(data);
        setLoading(false);
      });
    }

    loadBlocks();

    const interval = setInterval(loadBlocks, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return {
    blocks,
    loading,
  };
}