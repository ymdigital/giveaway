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

  const submitLabel = editing ? "บันทึกการแก้ไข" : "＋ เพิ่มลงเช็กลิสต์";

  return (
    <section ref={ref} className={`panel tape ${s.panel}`}>
      <h2>{editing ? "แก้ไขรายการ ✎" : "เพิ่ม Giveaway ใหม่ ✿"}</h2>
      <form noValidate className={s.form} onSubmit={handleSubmit}>
        <label>
          ลิงก์ต้นโพสต์ (X / Twitter หรือเว็บอื่น)
          <input
            id="fUrl"
            type="url"
            inputMode="url"
            placeholder="วางลิงก์ เช่น https://x.com/…/status/…"
            autoComplete="off"
            maxLength={LIMITS.url}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              preview.schedule(e.target.value);
            }}
            onBlur={(e) => preview.flush(e.target.value)}
          />
        </label>
        {isUrlInvalid && <p className="err">{MSG.badUrl}</p>}
        <PreviewCard state={preview.state} />
        <label>
          ชื่อรายการ <em>(ไม่ใส่ก็ได้)</em>
          <input
            type="text"
            placeholder="เช่น การ์ดเซ็ต + โฟโต้บุ๊ก"
            maxLength={LIMITS.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          วันรับ <em>(ไม่ใส่ก็ได้ พิมพ์ได้อิสระ)</em>
          <input
            type="text"
            placeholder="เช่น 15–16 พ.ย. หรือ รับหน้างาน 15 / 16 พ.ย."
            maxLength={LIMITS.pickup}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </label>
        <label>
          โน้ต <em>(ไม่ใส่ก็ได้)</em>
          <textarea
            placeholder="เช่น ต้องรี + ฟอล + แท็กเพื่อน 2 คน"
            maxLength={LIMITS.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className="row">
          <button className="btn primary" type="submit" disabled={isSaving}>
            {isSaving ? "กำลังบันทึก…" : submitLabel}
          </button>
          {editing && (
            <button className="btn ghost" type="button" onClick={onCancel}>ยกเลิก</button>
          )}
        </div>
      </form>
    </section>
  );
});
