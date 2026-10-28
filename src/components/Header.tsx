import type { Accent } from "@/lib/types";
import { ACCENTS } from "@/lib/types";
import s from "./Header.module.css";

const SWATCHES: Record<Accent, { color: string; label: string }> = {
  pink: { color: "#ec5f98", label: "ชมพู" },
  lavender: { color: "#9b6be8", label: "ลาเวนเดอร์" },
  mint: { color: "#2fa98a", label: "มิ้นท์" },
  peach: { color: "#f07b4f", label: "พีช" },
};

interface HeaderProps {
  accent: Accent;
  showSwatches: boolean;
  onAccent: (accent: Accent) => void;
}

export function Header({ accent, showSwatches, onAccent }: HeaderProps) {
  return (
    <header className={s.header}>
      <div className={s.sparkles} aria-hidden="true">
        <span>✦</span><span>♡</span><span>✧</span><span>★</span>
      </div>
      <div>
        <div className={s.eyebrow}>Your little giveaway helper</div>
        <h1 className={s.title}>
          Giveaway Tracker <span className={s.bow}>🎀</span>
          <span className={s.sticker} aria-hidden="true">fan-made ♡</span>
        </h1>
        <p className={s.sub}>เก็บลิงก์ให้ครบ ไม่พลาด Giveaway ที่อยากได้ 💗</p>
      </div>
      {showSwatches && (
        <div className={s.swatches} role="group" aria-label="สีธีม">
          <span>สีธีม</span>
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              className={s.sw}
              style={{ background: SWATCHES[a].color }}
              aria-label={SWATCHES[a].label}
              aria-pressed={accent === a}
              onClick={() => onAccent(a)}
            />
          ))}
        </div>
      )}
    </header>
  );
}
