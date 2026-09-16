"use client";

import { useEffect, useState } from "react";
import type { WaterBlock } from "@/types/block";
import { useCondominiumContext } from "@/lib/condominium-context";

export function useWaterMonitoring() {
  const { activeCondominiumId } = useCondominiumContext();
  const [blocks, setBlocks] = useState<WaterBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCondominiumId) {
      return;
    }

    let ignore = false;

    function loadBlocks() {
      fetch(`/api/painel?condominiumId=${activeCondominiumId}`)
        .then((response) => response.json())
        .then((data) => {
          if (ignore) return;

          setBlocks(data.blocks ?? []);
          setLoading(false);
        });
    }

    loadBlocks();

    const interval = setInterval(loadBlocks, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeCondominiumId]);

  return {
    blocks: activeCondominiumId ? blocks : [],
    loading: activeCondominiumId ? loading : false,
  };
}
