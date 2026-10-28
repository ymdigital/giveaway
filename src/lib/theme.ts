import { ACCENTS, COLOR_MODES, type Accent, type ColorMode } from "./types";

export function isAccent(v: unknown): v is Accent {
  return typeof v === "string" && (ACCENTS as readonly string[]).includes(v);
}

export function isColorMode(v: unknown): v is ColorMode {
  return typeof v === "string" && (COLOR_MODES as readonly string[]).includes(v);
}

/** The ☾/☀ button flips whatever is currently shown and pins it. */
export function nextColorMode(isDarkNow: boolean): ColorMode {
  return isDarkNow ? "light" : "dark";
}

export function isDarkMode(mode: ColorMode, prefersDark: boolean): boolean {
  return mode === "dark" || (mode === "system" && prefersDark);
}

export const THEME_SWATCHES: ReadonlyArray<{ key: Accent; name: string; color: string }> = [
  { key: "pink", name: "ชมพู", color: "#EC5F98" },
  { key: "lavender", name: "ลาเวนเดอร์", color: "#9B6BE8" },
  { key: "mint", name: "มิ้นท์", color: "#2FA98A" },
  { key: "peach", name: "พีช", color: "#F07B4F" },
];

// Runs before paint (inline in <head>) so the saved theme doesn't flash.
export const THEME_BOOT_SCRIPT = `try{var d=document.documentElement,a=localStorage.getItem("gt-accent"),m=localStorage.getItem("gt-mode");if(a&&/^(pink|lavender|mint|peach)$/.test(a))d.setAttribute("data-accent",a);if(m==="light"||m==="dark")d.setAttribute("data-theme",m)}catch(e){}`;
