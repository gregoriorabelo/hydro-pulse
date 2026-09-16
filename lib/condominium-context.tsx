"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Condominium } from "@/types/entities";

type CondominiumContextValue = {
  condominiums: Condominium[];
  activeCondominiumId: string | null;
  setActiveCondominiumId: (id: string) => void;
  loading: boolean;
  refresh: () => void;
};

const CondominiumContext = createContext<CondominiumContextValue | null>(null);

const STORAGE_KEY = "hydro_pulse_active_condominium";

export function CondominiumProvider({ children }: { children: ReactNode }) {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [activeCondominiumId, setActiveCondominiumIdState] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetch("/api/condominiums")
      .then((response) => response.json())
      .then((data: { condominiums?: Condominium[] }) => {
        if (ignore) return;

        const list = data.condominiums ?? [];
        setCondominiums(list);

        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null;
        const validStored = stored && list.some((c) => c.id === stored) ? stored : null;

        setActiveCondominiumIdState(validStored ?? list[0]?.id ?? null);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  function setActiveCondominiumId(id: string) {
    setActiveCondominiumIdState(id);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  }

  function refresh() {
    setReloadKey((key) => key + 1);
  }

  return (
    <CondominiumContext.Provider
      value={{
        condominiums,
        activeCondominiumId,
        setActiveCondominiumId,
        loading,
        refresh,
      }}
    >
      {children}
    </CondominiumContext.Provider>
  );
}

export function useCondominiumContext() {
  const context = useContext(CondominiumContext);

  if (!context) {
    throw new Error("useCondominiumContext deve ser usado dentro de CondominiumProvider");
  }

  return context;
}
