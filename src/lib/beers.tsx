import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Beer } from "../types";

interface BeersState {
  beers: Beer[];
  status: "loading" | "ready" | "error";
  error: string;
  reload: () => Promise<void>;
  byId: (id: number) => Beer | undefined;
}

const BeersContext = createContext<BeersState | null>(null);

export function BeersProvider({ children }: { children: ReactNode }) {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [status, setStatus] = useState<BeersState["status"]>("loading");
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setBeers(await api.beers());
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<BeersState>(
    () => ({ beers, status, error, reload, byId: (id) => beers.find((b) => b.id === id) }),
    [beers, status, error, reload],
  );
  return <BeersContext.Provider value={value}>{children}</BeersContext.Provider>;
}

export function useBeers(): BeersState {
  const ctx = useContext(BeersContext);
  if (!ctx) throw new Error("useBeers debe usarse dentro de BeersProvider");
  return ctx;
}
