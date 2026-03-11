import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type CookieConsent from "../interfaces/CookieConsent";

interface CookieContextType {
  consent: CookieConsent | null;
  setConsent: (c: CookieConsent) => void;
  openSettings: () => void;
  closeSettings: () => void;
  settingsOpen: boolean;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cookieConsent");
    if (saved) {
      setConsentState(JSON.parse(saved));
    }
  }, []);

  const setConsent = (c: CookieConsent) => {
    setConsentState(c);
    localStorage.setItem("cookieConsent", JSON.stringify(c));
  };

  return (
    <CookieContext.Provider
      value={{
        consent,
        setConsent,
        settingsOpen,
        openSettings: () => setSettingsOpen(true),
        closeSettings: () => setSettingsOpen(false),
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieContext);
  if (!ctx)
    throw new Error("useCookieConsent must be used inside CookieProvider");
  return ctx;
}