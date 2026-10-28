"use client";
import { useState } from "react";
import type { PreviewState } from "@/hooks/usePreview";
import s from "./PreviewCard.module.css";

interface PreviewCardProps {
  state: PreviewState;
}

export function PreviewCard({ state }: PreviewCardProps) {
  const [brokenSrc, setBrokenSrc] = useState("");
  if (state.status === "idle") return null;

  const pv = state.status === "ready" ? state.data : null;
  const image = pv?.image && pv.image !== brokenSrc ? pv.image : "";

  return (
    <div className={s.preview} aria-live="polite">
      {image ? (
        <img
          className={s.thumb}
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setBrokenSrc(image)}
        />
      ) : (
        <div className={s.placeholder} aria-hidden="true">
          {state.status === "loading" ? <span className={s.spin}>✿</span> : "รูปโพสต์"}
        </div>
      )}
      <div className={s.text}>
        {pv && (pv.name || pv.author) && (
          <div className={s.who}>
            {pv.name && <b>{pv.name}</b>}
            {pv.author && <span>{pv.author}</span>}
          </div>
        )}
        {pv?.text && <div className={s.body}>{pv.text}</div>}
        {state.status === "loading" && <div className={s.muted}>กำลังดึงรูปจากโพสต์…</div>}
        {state.status === "ready" && <div className={s.ok}>✓ ดึงข้อมูลโพสต์แล้ว</div>}
        {state.status === "failed" && <div className={s.warn}>{state.message}</div>}
      </div>
    </div>
  );
}
