"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage, type ItemDraft } from "@/lib/client-api";
import { isValidCode, normalizeCode } from "@/lib/code";
import { MSG } from "@/lib/messages";
import { STORAGE_KEYS, loadValue, storeValue } from "@/lib/storage";
import type { Accent, Item, ListData } from "@/lib/types";

const NOT_FOUND = 404;

export type View = "booting" | "welcome" | "app";

function setUrlCode(code: string | null) {
  try {
    window.history.replaceState(null, "", code ? `/l/${encodeURIComponent(code)}` : "/");
  } catch {
    // History API unavailable — URL just won't reflect the list.
  }
}

export function useGiveawayList(initialCode: string | undefined, toast: (msg: string) => void) {
  const [view, setView] = useState<View>("booting");
  const [welcomeError, setWelcomeError] = useState("");
  const [code, setCode] = useState("");
  const [accent, setAccentState] = useState<Accent>("pink");
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  const showWelcome = useCallback((msg = "") => {
    setWelcomeError(msg);
    setView("welcome");
  }, []);

  const showApp = useCallback((data: ListData) => {
    setCode(data.code);
    setItems(data.items);
    setAccentState(data.accent);
    storeValue(STORAGE_KEYS.code, data.code);
    setUrlCode(data.code);
    setView("app");
  }, []);

  const openCode = useCallback(
    async (raw: string, isQuiet = false) => {
      const next = normalizeCode(raw);
      if (!next) return showWelcome();
      if (!isValidCode(next)) {
        storeValue(STORAGE_KEYS.code, null);
        setUrlCode(null);
        return showWelcome(isQuiet ? "" : MSG.codeRule);
      }
      try {
        showApp(await api.openList(next));
      } catch (err) {
        if (err instanceof ApiError && err.status === NOT_FOUND) {
          storeValue(STORAGE_KEYS.code, null);
          setUrlCode(null);
          return showWelcome(isQuiet ? "" : MSG.codeNotFound);
        }
        showWelcome(errorMessage(err));
      }
    },
    [showApp, showWelcome],
  );

  const createList = useCallback(
    async (raw: string): Promise<boolean> => {
      const next = normalizeCode(raw);
      if (!isValidCode(next)) {
        showWelcome(MSG.codeRule);
        return false;
      }
      try {
        const data = await api.createList(next);
        showApp(data);
        toast(`สร้างลิสต์แล้ว จำรหัส ${data.code} ไว้นะคะ`);
        return true;
      } catch (err) {
        showWelcome(errorMessage(err));
        return false;
      }
    },
    [showApp, showWelcome, toast],
  );

  const leave = useCallback(() => {
    storeValue(STORAGE_KEYS.code, null);
    setUrlCode(null);
    setCode("");
    setItems([]);
    showWelcome();
  }, [showWelcome]);

  const refresh = useCallback(
    async (showToast: boolean) => {
      if (!code) return;
      try {
        const data = await api.openList(code);
        setItems(data.items);
        setAccentState(data.accent);
        if (showToast) toast("อัปเดตแล้ว");
      } catch {
        if (showToast) toast("รีเฟรชไม่สำเร็จ ลองอีกครั้งนะคะ");
      }
    },
    [code, toast],
  );

  const replaceItem = useCallback((next: Item) => {
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)));
  }, []);

  const toggle = useCallback(
    async (item: Item) => {
      const optimistic = { ...item, collected: !item.collected };
      replaceItem(optimistic);
      try {
        const saved = await api.updateItem(code, item.id, { collected: optimistic.collected });
        replaceItem(saved);
        toast(saved.collected ? "เก็บแล้ว เย้ 💗" : "ย้ายกลับไปยังไม่ได้เก็บ");
      } catch (err) {
        replaceItem(item);
        toast(errorMessage(err));
      }
    },
    [code, replaceItem, toast],
  );

  const remove = useCallback(
    async (id: string) => {
      const backup = itemsRef.current;
      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await api.deleteItem(code, id);
        toast("ลบแล้ว");
      } catch (err) {
        setItems(backup);
        toast(errorMessage(err));
      }
    },
    [code, toast],
  );

  /** Returns true on success so the form can reset. */
  const save = useCallback(
    async (draft: ItemDraft, editingId: string | null): Promise<boolean> => {
      try {
        if (editingId) {
          replaceItem(await api.updateItem(code, editingId, draft));
          toast("บันทึกแล้ว");
        } else {
          const saved = await api.addItem(code, draft);
          setItems((prev) => [...prev, saved]);
          toast("เพิ่มลงเช็กลิสต์แล้ว ✿");
        }
        return true;
      } catch (err) {
        toast(errorMessage(err));
        return false;
      }
    },
    [code, replaceItem, toast],
  );

  const changeAccent = useCallback(
    async (next: Accent) => {
      setAccentState(next);
      if (!code) return;
      try {
        await api.setAccent(code, next);
      } catch (err) {
        toast(errorMessage(err));
      }
    },
    [code, toast],
  );

  useEffect(() => {
    const start = initialCode || loadValue(STORAGE_KEYS.code) || "";
    if (start) void openCode(start, !initialCode);
    else showWelcome();
  }, [initialCode, openCode, showWelcome]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  return {
    view,
    welcomeError,
    code,
    accent,
    items,
    openCode,
    createList,
    leave,
    refresh,
    toggle,
    remove,
    save,
    changeAccent,
  };
}
