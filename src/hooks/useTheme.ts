"use client";
import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS, loadValue, storeValue } from "@/lib/storage";
import { isAccent, isColorMode, isDarkMode } from "@/lib/theme";
import type { Accent, ColorMode } from "@/lib/types";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export type Theme = {
  accent: Accent;
  colorMode: ColorMode;
  isDark: boolean;
  setAccent: (accent: Accent) => void;
  setColorMode: (mode: ColorMode) => void;
};

export function useTheme(): Theme {
  const [accent, setAccentState] = useState<Accent>("pink");
  const [colorMode, setColorModeState] = useState<ColorMode>("system");
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const savedAccent = loadValue(STORAGE_KEYS.accent);
    const savedMode = loadValue(STORAGE_KEYS.colorMode);
    if (isAccent(savedAccent)) setAccentState(savedAccent);
    if (isColorMode(savedMode)) setColorModeState(savedMode);

    const media = window.matchMedia(DARK_QUERY);
    setPrefersDark(media.matches);
    const onChange = (ev: MediaQueryListEvent) => setPrefersDark(ev.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    storeValue(STORAGE_KEYS.accent, next);
    document.documentElement.setAttribute("data-accent", next);
  }, []);

  const setColorMode = useCallback((next: ColorMode) => {
    setColorModeState(next);
    storeValue(STORAGE_KEYS.colorMode, next);
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
  }, []);

  return { accent, colorMode, isDark: isDarkMode(colorMode, prefersDark), setAccent, setColorMode };
}
