"use client";
import { useState } from "react";
import { shortLink } from "@/lib/items";
import type { Item } from "@/lib/types";
import s from "./ItemList.module.css";

interface ItemRowProps {
  item: Item;
  isArmed: boolean;
  onToggle: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemRow({ item, isArmed, onToggle, onEdit, onDelete }: ItemRowProps) {
  const [isImageBroken, setImageBroken] = useState(false);
  const hasImage = Boolean(item.image) && !isImageBroken;
  const className = [s.item, item.collected && s.isDone, hasImage && s.hasImg]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={className}>
      <button
        type="button"
        className={s.check}
        aria-label={item.collected ? "ทำเครื่องหมายว่ายังไม่ได้เก็บ" : "ทำเครื่องหมายว่าเก็บแล้ว"}
        onClick={() => onToggle(item)}
      >
        {item.collected ? "♥" : "✓"}
      </button>
      {hasImage && (
        <a className={s.thumb} href={item.url} target="_blank" rel="noopener noreferrer" aria-label="เปิดโพสต์">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageBroken(true)}
          />
        </a>
      )}
      <div className={s.body}>
        <div className={s.top}>
          <span className={s.ttl}>{item.title || item.author || shortLink(item.url)}</span>
          {item.collected && <span className="chip got">เก็บแล้ว</span>}
        </div>
        {item.pickup && <span className={`chip ${s.pickup}`}>📅 วันรับ: {item.pickup}</span>}
        <a className={s.meta} href={item.url} target="_blank" rel="noopener noreferrer">
          {item.author ? `${item.author} · เปิดโพสต์ ↗` : `${shortLink(item.url)} ↗`}
        </a>
        {item.note && <p className={s.note}>{item.note}</p>}
        <div className={s.actions}>
          <button className="mini" type="button" onClick={() => onEdit(item)}>แก้ไข</button>
          <button
            className={`mini danger${isArmed ? " armed" : ""}`}
            type="button"
            onClick={() => onDelete(item.id)}
          >
            {isArmed ? "กดอีกครั้งเพื่อลบ" : "ลบ"}
          </button>
        </div>
      </div>
    </li>
  );
}
