"use client";
import { useState } from "react";
import { LIMITS } from "@/lib/limits";
import { formatPickupDate, monthGrid, shiftMonth, toggleSelectedDate, toIsoDate, type MonthRef } from "@/lib/pickup";
import type { PickupDate } from "@/lib/types";
import s from "./PickupPicker.module.css";

const WEEKDAY_HEADERS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTH_TITLE = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "UTC" });

interface PickupPickerProps {
  value: PickupDate[];
  onChange: (next: PickupDate[]) => void;
}

function startMonth(value: readonly PickupDate[]): MonthRef {
  const first = value[0]?.date;
  if (first) {
    const [y, m] = first.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function PickupPicker({ value, onChange }: PickupPickerProps) {
  const [shown, setShown] = useState<MonthRef>(() => startMonth(value));
  const today = toIsoDate(new Date());
  const selected = new Set(value.map((d) => d.date));
  const isFull = value.length >= LIMITS.pickupDates;

  return (
    <div className={s.picker}>
      <div className={s.head}>
        <button type="button" className={s.nav} aria-label="เดือนก่อน" onClick={() => setShown(shiftMonth(shown, -1))}>‹</button>
        <div className={s.month} aria-live="polite">
          {MONTH_TITLE.format(new Date(Date.UTC(shown.year, shown.month, 1)))}
        </div>
        <button type="button" className={s.nav} aria-label="เดือนถัดไป" onClick={() => setShown(shiftMonth(shown, 1))}>›</button>
      </div>
      <div className={s.grid} role="group" aria-label="เลือกวันรับ (เลือกได้หลายวัน)">
        {WEEKDAY_HEADERS.map((w) => (
          <div key={w} className={s.weekday} aria-hidden="true">{w}</div>
        ))}
        {monthGrid(shown.year, shown.month).map((iso, i) => {
          if (!iso) return <div key={`blank-${i}`} />;
          const isOn = selected.has(iso);
          const classes = [s.day, isOn && s.dayOn, iso === today && s.today].filter(Boolean).join(" ");
          return (
            <button
              key={iso}
              type="button"
              className={classes}
              aria-pressed={isOn}
              aria-label={formatPickupDate(iso)}
              disabled={!isOn && isFull}
              onClick={() => onChange(toggleSelectedDate(value, iso))}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
      {value.length > 0 ? (
        <div className={s.chips}>
          {value.map((d) => (
            <button
              key={d.date}
              type="button"
              className={s.chip}
              aria-label={`เอา ${formatPickupDate(d.date)} ออก`}
              onClick={() => onChange(toggleSelectedDate(value, d.date))}
            >
              {formatPickupDate(d.date)} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={s.hint}>แตะวันที่ในปฏิทินได้หลายวัน</div>
      )}
      {isFull && <div className={s.hint}>เลือกได้สูงสุด {LIMITS.pickupDates} วัน</div>}
    </div>
  );
}
