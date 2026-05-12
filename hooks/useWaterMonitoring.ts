"use client";

import { useEffect, useState } from "react";
import type { WaterBlock } from "@/types/block";
import { getBlocks } from "@/services/waterService";

export function useWaterMonitoring() {
  const [blocks, setBlocks] = useState<WaterBlock[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBlocks() {
    const data = await getBlocks();

    setBlocks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBlocks();

    const interval = setInterval(() => {
      loadBlocks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    blocks,
    loading,
  };
}