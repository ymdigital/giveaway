"use client";
import { THEME_SWATCHES } from "@/lib/theme";
import type { Accent } from "@/lib/types";
import s from "./ThemeControls.module.css";

interface ThemeControlsProps {
  accent: Accent;
  isDark: boolean;
  onAccent: (accent: Accent) => void;
  onToggleDark: () => void;
}

export function ThemeControls({ accent, isDark, onAccent, onToggleDark }: ThemeControlsProps) {
  return (
    <div className={s.controls} role="group" aria-label="สีธีม">
      {THEME_SWATCHES.map((t) => (
        <button
          key={t.key}
          type="button"
          title={t.name}
          aria-label={t.name}
          aria-pressed={accent === t.key}
          className={s.swatch}
          style={{
            background: t.color,
            boxShadow: accent === t.key ? `0 0 0 2.5px var(--card), 0 0 0 4.5px ${t.color}` : "none",
          }}
          onClick={() => onAccent(t.key)}
        />
      ))}
      <button type="button" className={s.dark} aria-label="โหมดมืด" aria-pressed={isDark} onClick={onToggleDark}>
        {isDark ? "☀" : "☾"}
      </button>
    </div>
  );
}
