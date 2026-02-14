"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import app from '@/package.json'

const APP_VERSION = app?.version;

interface AppContextValue {
  version: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log(`[PhysioInvoice] App version: ${APP_VERSION}`);
  }, []);

  const value: AppContextValue = {
    version: APP_VERSION,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
