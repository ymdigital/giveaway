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
  const author =
    state.status === "loading"
      ? "กำลังดึงรูปจากโพสต์…"
      : state.status === "failed"
        ? state.message
        : [pv?.name, pv?.author].filter(Boolean).join(" ");

  return (
    <div className={s.preview} aria-live="polite">
      {state.status === "loading" && <span className={s.spinner} aria-hidden="true">✦</span>}
      {image && (
        <img
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setBrokenSrc(image)}
        />
      )}
      <div className={s.text}>
        <span className={s.author}>{author}</span>
        {pv?.text && <span className={s.body}>{pv.text}</span>}
      </div>
    </div>
  );
}
