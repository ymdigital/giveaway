"use client";
import { forwardRef, useState, type FormEvent } from "react";
import type { ItemDraft } from "@/lib/client-api";
import { titleFromText } from "@/lib/items";
import { HTTP_URL_PATTERN, LIMITS } from "@/lib/limits";
import { MSG } from "@/lib/messages";
import type { Item } from "@/lib/types";
import { usePreview, type PreviewState } from "@/hooks/usePreview";
import { PreviewCard } from "./PreviewCard";
import s from "./ItemForm.module.css";

interface ItemFormProps {
  editing: Item | null;
  onSave: (draft: ItemDraft, editingId: string | null) => Promise<boolean>;
  onCancel: () => void;
  onSaved: () => void;
}

function initialPreview(item: Item | null): PreviewState {
  if (!item || (!item.image && !item.author)) return { status: "idle" };
  return {
    status: "ready",
    url: item.url,
    data: { ok: true, image: item.image, author: item.author, name: "", text: "" },
  };
}

export const ItemForm = forwardRef<HTMLElement, ItemFormProps>(function ItemForm(
  { editing, onSave, onCancel, onSaved },
  ref,
) {
  const [url, setUrl] = useState(editing?.url ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [pickup, setPickup] = useState(editing?.pickup ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [isUrlInvalid, setUrlInvalid] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const preview = usePreview(initialPreview(editing), (text) =>
    setTitle((prev) => (prev.trim() ? prev : titleFromText(text))),
  );

  function buildDraft(cleanUrl: string): ItemDraft {
    const base = { url: cleanUrl, title: title.trim(), pickup: pickup.trim(), note: note.trim() };
    const pv = preview.state;
    if (pv.status === "ready" && pv.url === cleanUrl) {
      return { ...base, image: pv.data.image, author: pv.data.author };
    }
    return editing ? { ...base, image: "", author: "" } : base;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const cleanUrl = url.trim();
    if (!HTTP_URL_PATTERN.test(cleanUrl)) {
      setUrlInvalid(true);
      document.getElementById("fUrl")?.focus();
      return;
    }
    setUrlInvalid(false);
    setSaving(true);
    const isSaved = await onSave(buildDraft(cleanUrl), editing?.id ?? null);
    setSaving(false);
    if (isSaved) onSaved();
  }

  return (
    <aside
      ref={ref}
      className={s.panel}
      style={{ borderColor: editing ? "var(--p)" : undefined }}
    >
      {editing ? (
        <div className={s.title} style={{ color: "var(--p)" }}>แก้ไขรายการ ✎</div>
      ) : (
        <div className={s.title}>✿ เพิ่ม Giveaway</div>
      )}
      <form noValidate className={s.form} onSubmit={handleSubmit}>
        <label className="field">
          ลิงก์ต้นโพสต์
          <input
            id="fUrl"
            className="input"
            style={{ borderColor: isUrlInvalid ? "var(--warn)" : undefined }}
            type="url"
            inputMode="url"
            placeholder="วางลิงก์ x.com/…/status/…"
            autoComplete="off"
            maxLength={LIMITS.url}
            value={url}
            aria-invalid={isUrlInvalid}
            onChange={(e) => {
              setUrl(e.target.value);
              preview.schedule(e.target.value);
            }}
            onBlur={(e) => preview.flush(e.target.value)}
          />
        </label>
        {isUrlInvalid && <div className={s.error} role="alert">⚠ {MSG.badUrl}</div>}
        <PreviewCard state={preview.state} />
        <label className="field">
          ชื่อรายการ
          <input
            className="input"
            type="text"
            placeholder="เช่น การ์ดเซ็ต ครบ 5 ใบ"
            maxLength={LIMITS.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="field">
          วันรับ
          <input
            className="input"
            type="text"
            placeholder="พิมพ์ได้เลย เช่น 15–16 พ.ย."
            maxLength={LIMITS.pickup}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </label>
        <label className="field">
          โน้ต
          <textarea
            className="input"
            rows={2}
            placeholder="เงื่อนไข เช่น รีทวีต + ฟอลโล่"
            maxLength={LIMITS.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {editing ? (
          <div className={s.row}>
            <button className="btnPrimary" style={{ flex: 1 }} type="submit" disabled={isSaving}>
              {isSaving ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
            </button>
            <button className="btnGhost" type="button" onClick={onCancel}>ยกเลิก</button>
          </div>
        ) : (
          <button className="btnPrimary" type="submit" disabled={isSaving}>
            {isSaving ? "กำลังบันทึก…" : "＋ เพิ่มลงเช็กลิสต์"}
          </button>
        )}
      </form>
    </aside>
  );
});
