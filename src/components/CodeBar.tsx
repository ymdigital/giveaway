"use client";
import { useRef, useState } from "react";
import s from "./CodeBar.module.css";

interface CodeBarProps {
  code: string;
  shareUrl: string;
  onRefresh: () => void;
  onLeave: () => void;
  toast: (msg: string) => void;
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
      toast("คัดลอกลิงก์แล้ว เปิดในอีกเครื่องได้เลย");
    } catch {
      showFallback();
    }
  }

  return (
    <section className={`panel ${s.bar}`}>
      <div className={s.row}>
        <div className={s.codebox}>
          <small>รหัสลิสต์ของคุณ (จดเก็บไว้ ถ้าหายจะกู้ไม่ได้)</small>
          <span className={s.code}>{code}</span>
        </div>
        <div className={s.actions}>
          <button className="mini" type="button" onClick={copy}>คัดลอกลิงก์ลิสต์นี้</button>
          <button className="mini" type="button" onClick={onRefresh}>↻ รีเฟรช</button>
          <button className="mini" type="button" onClick={onLeave}>เปลี่ยนลิสต์</button>
        </div>
      </div>
      {isLinkShown && (
        <input ref={linkRef} className={s.sharelink} value={shareUrl} readOnly aria-label="ลิงก์ลิสต์" />
      )}
    </section>
  );
}
