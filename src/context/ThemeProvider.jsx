import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { THEMES, barTint } from "@/lib/themes";

const STORAGE_KEY = "dj-theme";

function read() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) return stored;
  } catch {
    /* private windows refuse storage; the system preference still answers */
  }
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  )?.matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const tint = barTint();
    if (tint) {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", tint);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* the choice holds for this visit either way */
    }
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme(
      (current) => THEMES[(THEMES.indexOf(current) + 1) % THEMES.length],
    );
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, cycle }),
    [theme, setTheme, cycle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
