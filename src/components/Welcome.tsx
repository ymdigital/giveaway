"use client";
import { useState, type FormEvent } from "react";
import { CODE_MAX_LENGTH } from "@/lib/code";
import type { Accent } from "@/lib/types";
import { ThemeControls } from "./ThemeControls";
import s from "./Welcome.module.css";

interface WelcomeProps {
  error: string;
  accent: Accent;
  isDark: boolean;
  onAccent: (accent: Accent) => void;
  onToggleDark: () => void;
  onOpen: (code: string) => Promise<void>;
  onCreate: (code: string) => Promise<boolean>;
}

const STEPS = ["① ตั้งรหัสลิสต์", "② วางลิงก์โพสต์", "③ ติ๊กเมื่อเก็บแล้ว ✓"];

export function Welcome({ error, accent, isDark, onAccent, onToggleDark, onOpen, onCreate }: WelcomeProps) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"open" | "create" | null>(null);

  async function handleOpen(ev: FormEvent) {
    ev.preventDefault();
    setBusy("open");
    await onOpen(code);
    setBusy(null);
  }

  async function handleCreate() {
    setBusy("create");
    await onCreate(code);
    setBusy(null);
  }

  return (
    <div className={s.screen}>
      <header className={s.header}>
        <ThemeControls accent={accent} isDark={isDark} onAccent={onAccent} onToggleDark={onToggleDark} />
      </header>
      <main className={s.main}>
        <div className={s.hero}>
          <div className={s.flowers} aria-hidden="true">
            <span>✿</span><span style={{ opacity: 0.5 }}>✿</span><span style={{ opacity: 0.25 }}>✿</span>
          </div>
          <h1 className={s.title}>Giveaway Tracker 🎀</h1>
          <p className={s.lead}>เก็บลิงก์ให้ครบ ไม่พลาด Giveaway ที่อยากได้</p>
          <div className={s.steps}>
            {STEPS.map((step) => <span key={step}>{step}</span>)}
          </div>
        </div>
        <form className={s.card} noValidate onSubmit={handleOpen}>
          <span className={s.bow} aria-hidden="true">🎀</span>
          <div className={s.cardTitle}>เปิดเช็กลิสต์ของคุณ</div>
          <label className="field">
            รหัสลิสต์
            <input
              className={`input ${s.codeInput}`}
              style={{ borderColor: error ? "var(--warn)" : undefined }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="เช่น pim-gift-2026"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={CODE_MAX_LENGTH}
              aria-invalid={Boolean(error)}
            />
          </label>
          <div className={s.hint}>อย่างน้อย 8 ตัว ใช้ได้แค่ a–z, 0–9 และขีด (-)</div>
          {error && <div className={s.error} role="alert">⚠ {error}</div>}
          <button className="btnPrimary" type="submit" disabled={busy !== null}>
            เปิดลิสต์ของฉัน
          </button>
          <button className="btnSecondary" type="button" disabled={busy !== null} onClick={handleCreate}>
            {busy === "create" ? "กำลังสร้าง…" : "✿ สร้างลิสต์ใหม่"}
          </button>
          <div className={s.footnote}>ไม่ต้องสมัครสมาชิก · ใครมีรหัสก็เปิดลิสต์ได้ เก็บรหัสไว้ดีๆ นะ</div>
        </form>
      </main>
    </div>
  );
}
