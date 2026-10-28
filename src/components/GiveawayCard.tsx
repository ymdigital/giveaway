"use client";
import { useState } from "react";
import { displayName, shortLink, type ViewMode } from "@/lib/items";
import { formatPickupDate, toIsoDate } from "@/lib/pickup";
import type { Item } from "@/lib/types";
import s from "./GiveawayCard.module.css";

interface GiveawayCardProps {
  item: Item;
  variant: ViewMode;
  isArmed: boolean;
  isEditing: boolean;
  onToggle: (item: Item) => void;
  onToggleDate: (item: Item, date: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

function PickupChecklist({ item, onToggleDate }: Pick<GiveawayCardProps, "item" | "onToggleDate">) {
  const dates = item.pickupDates;
  const doneCount = dates.filter((d) => d.collected).length;
  const today = toIsoDate(new Date());
  return (
    <div className={s.dates} role="group" aria-label="เช็กวันรับ">
      <div className={s.datesHead}>
        <span>📅 วันรับ {dates.length} วัน</span>
        <span className={s.progress}>รับแล้ว {doneCount}/{dates.length}</span>
      </div>
      <div className={s.dateList}>
        {dates.map((d) => {
          const label = formatPickupDate(d.date);
          const classes = [s.dateBtn, d.collected && s.dateOn, !d.collected && d.date === today && s.dateToday]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={d.date}
              type="button"
              className={classes}
              aria-pressed={d.collected}
              aria-label={d.collected ? `${label} รับแล้ว` : `${label} ยังไม่ได้รับ`}
              onClick={() => onToggleDate(item, d.date)}
            >
              <span className={s.box} aria-hidden="true">{d.collected ? "✓" : ""}</span>
              {label}
              {!d.collected && d.date === today && <span className={s.todayTag}>วันนี้</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GiveawayCard(props: GiveawayCardProps) {
  const { item, variant, isArmed, isEditing, onToggle, onToggleDate, onEdit, onDelete } = props;
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
            {(item.pickupDates.length === 1 || item.pickup || done) && (
              <div className={s.chips}>
                {item.pickupDates.length === 1 && (
                  <span className={s.chipDate}>📅 วันรับ: {formatPickupDate(item.pickupDates[0].date)}</span>
                )}
                {item.pickup && (
                  <span className={s.chipDate}>{item.pickupDates.length > 0 ? "🕑" : "📅 วันรับ:"} {item.pickup}</span>
                )}
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
      {item.pickupDates.length > 1 && <PickupChecklist item={item} onToggleDate={onToggleDate} />}
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
