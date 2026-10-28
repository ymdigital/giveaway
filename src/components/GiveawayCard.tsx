"use client";
import { useState } from "react";
import { displayName, shortLink, type ViewMode } from "@/lib/items";
import type { Item } from "@/lib/types";
import s from "./GiveawayCard.module.css";

interface GiveawayCardProps {
  item: Item;
  variant: ViewMode;
  isArmed: boolean;
  isEditing: boolean;
  onToggle: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function GiveawayCard({ item, variant, isArmed, isEditing, onToggle, onEdit, onDelete }: GiveawayCardProps) {
  const [isImageBroken, setImageBroken] = useState(false);
  const hasImage = Boolean(item.image) && !isImageBroken;
  const done = item.collected;

  return (
    <li className={variant === "list" ? `${s.card} ${s.row}` : s.card} style={{ borderColor: isEditing ? "var(--p)" : undefined }}>
      <div className={s.main}>
        <button
          type="button"
          className={s.check}
          aria-label={done ? "ทำเครื่องหมายว่ายังไม่ได้เก็บ" : "ทำเครื่องหมายว่าเก็บแล้ว"}
          aria-pressed={done}
          onClick={() => onToggle(item)}
        >
          {done ? <span className={s.checkOn}>✓</span> : <span className={s.checkOff} />}
        </button>
        <div className={s.content} style={{ opacity: done ? 0.55 : 1 }}>
          {hasImage ? (
            <a className={s.thumb} href={item.url} target="_blank" rel="noopener noreferrer" aria-label="เปิดโพสต์">
              <img
                src={item.image}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImageBroken(true)}
              />
            </a>
          ) : (
            <div className={s.noImg}>
              <span aria-hidden="true">✿</span>ไม่มีรูป
            </div>
          )}
          <div className={s.body}>
            <div className={s.title} style={{ textDecoration: done ? "line-through" : "none" }}>
              {displayName(item)}
            </div>
            {(item.pickup || done) && (
              <div className={s.chips}>
                {item.pickup && <span className={s.chipDate}>📅 วันรับ: {item.pickup}</span>}
                {done && <span className={s.chipDone}>✓ เก็บแล้ว</span>}
              </div>
            )}
            <a className={s.link} href={item.url} target="_blank" rel="noopener noreferrer">
              {item.author ? `${item.author} · เปิดโพสต์ ↗` : `${shortLink(item.url)} · เปิดโพสต์ ↗`}
            </a>
            {item.note && <div className={s.note}>✎ {item.note}</div>}
          </div>
        </div>
      </div>
      <div className={s.actions}>
        {isArmed ? (
          <button type="button" className={s.confirm} onClick={() => onDelete(item.id)}>
            กดอีกครั้งเพื่อลบ
          </button>
        ) : (
          <>
            <button type="button" className={s.mini} onClick={() => onEdit(item)}>แก้ไข</button>
            <button type="button" className={`${s.mini} ${s.danger}`} onClick={() => onDelete(item.id)}>ลบ</button>
          </>
        )}
      </div>
    </li>
  );
}
