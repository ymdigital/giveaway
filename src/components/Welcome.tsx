"use client";
import { useState, type FormEvent } from "react";
import { CODE_MAX_LENGTH } from "@/lib/code";
import s from "./Welcome.module.css";

interface WelcomeProps {
  error: string;
  onOpen: (code: string) => Promise<void>;
  onCreate: (code: string) => Promise<boolean>;
}

export function Welcome({ error, onOpen, onCreate }: WelcomeProps) {
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
    <section className={`panel ${s.ticket}`}>
      <div className={s.stub} aria-hidden="true">
        <span>ADMIT ONE</span>
        <b>♡</b>
      </div>
      <div className={s.body}>
        <h2 className={s.heading}>ยินดีต้อนรับ ✨</h2>
        <p>ไม่ต้องสมัครสมาชิก ตั้งรหัสลิสต์ของคุณเอง แล้วใช้รหัสนี้เปิดลิสต์ได้ทั้งในคอมและมือถือ</p>
        <form noValidate className={s.form} onSubmit={handleOpen}>
          <label>
            รหัสลิสต์
            <input
              className={s.codeInput}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="เช่น pim-gift-2026"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={CODE_MAX_LENGTH}
            />
          </label>
          <p className={s.hint}>
            อย่างน้อย 8 ตัว ใช้ได้แค่ a–z, 0–9 และขีด (-) ตั้งให้เดายากหน่อยนะคะ เพราะใครรู้รหัสก็เปิดลิสต์นี้ได้
          </p>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy !== null}>
              เปิดลิสต์ของฉัน
            </button>
            <button className="btn ghost" type="button" disabled={busy !== null} onClick={handleCreate}>
              {busy === "create" ? "กำลังสร้าง…" : "✿ สร้างลิสต์ใหม่"}
            </button>
          </div>
        </form>
        {error && <p className="err" role="alert">{error}</p>}
      </div>
    </section>
  );
}
