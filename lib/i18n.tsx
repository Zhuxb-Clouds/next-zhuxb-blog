import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import zh from "../locales/zh.json";
import en from "../locales/en.json";

type Locale = "zh" | "en";

const translations: Record<Locale, Record<string, string>> = { zh, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "zh",
  setLocale: () => {},
  t: (key) => key,
});

function detectLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = localStorage.getItem("locale");
  if (stored === "zh" || stored === "en") return stored;
  const browserLang = navigator.language || "";
  return browserLang.startsWith("zh") ? "zh" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.setAttribute("data-locale", newLocale);
  }, []);

  const t = useCallback(
    (key: string) => {
      const current = mounted ? locale : "zh";
      return translations[current]?.[key] || translations["zh"][key] || key;
    },
    [locale, mounted]
  );

  return (
    <I18nContext.Provider value={{ locale: mounted ? locale : "zh", setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
