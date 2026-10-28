"use client";
import { useRef, useState } from "react";
import type { ShowToast } from "@/hooks/useToast";
import s from "./CodeBar.module.css";

interface CodeBarProps {
  code: string;
  shareUrl: string;
  onRefresh: () => void;
  onLeave: () => void;
  toast: ShowToast;
}

export function CodeBar({ code, shareUrl, onRefresh, onLeave, toast }: CodeBarProps) {
  const [isLinkShown, setLinkShown] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  function showFallback() {
    setLinkShown(true);
    requestAnimationFrame(() => {
      linkRef.current?.focus();
      linkRef.current?.select();
    });
    toast("กดค้างที่ลิงก์ด้านล่างเพื่อคัดลอกนะคะ");
  }

  async function copy() {
    if (!navigator.clipboard?.writeText) return showFallback();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("คัดลอกลิงก์ลิสต์แล้ว", { icon: "copy" });
    } catch {
      showFallback();
    }
  }

  return (
    <div className={s.bar}>
      <div className={s.codebox}>
        <div className={s.label}>🎀 รหัสลิสต์</div>
        <div className={s.code}>{code}</div>
      </div>
      <div className={s.actions}>
        <button type="button" className={s.soft} onClick={copy}>⧉ คัดลอกลิงก์</button>
        <button type="button" className={s.soft} onClick={onRefresh}>↻ รีเฟรช</button>
        <button type="button" className={s.outline} onClick={onLeave}>⇄ เปลี่ยนลิสต์</button>
      </div>
      {isLinkShown && (
        <input ref={linkRef} className={`input ${s.sharelink}`} value={shareUrl} readOnly aria-label="ลิงก์ลิสต์" />
      )}
    </div>
  );
}
