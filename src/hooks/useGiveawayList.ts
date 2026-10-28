"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage, type ItemDraft, type ListPrefs } from "@/lib/client-api";
import { isValidCode, normalizeCode } from "@/lib/code";
import { MSG } from "@/lib/messages";
import { STORAGE_KEYS, loadValue, storeValue } from "@/lib/storage";
import { nextColorMode } from "@/lib/theme";
import type { Accent, Item, ListData } from "@/lib/types";
import type { ShowToast } from "./useToast";
import type { Theme } from "./useTheme";

const NOT_FOUND = 404;

export type View = "booting" | "welcome" | "app";

function setUrlCode(code: string | null) {
  try {
    window.history.replaceState(null, "", code ? `/l/${encodeURIComponent(code)}` : "/");
  } catch {
    // History API unavailable — URL just won't reflect the list.
  }
}

export function useGiveawayList(initialCode: string | undefined, toast: ShowToast, theme: Theme) {
  const [view, setView] = useState<View>("booting");
  const [welcomeError, setWelcomeError] = useState("");
  const [code, setCode] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  const { setAccent, setColorMode } = theme;

  const showWelcome = useCallback((msg = "") => {
    setWelcomeError(msg);
    setView("welcome");
  }, []);

  const applyListData = useCallback(
    (data: ListData) => {
      setItems(data.items);
      setAccent(data.accent);
      setColorMode(data.colorMode);
    },
    [setAccent, setColorMode],
  );

  const showApp = useCallback(
    (data: ListData) => {
      setCode(data.code);
      applyListData(data);
      storeValue(STORAGE_KEYS.code, data.code);
      setUrlCode(data.code);
      setView("app");
    },
    [applyListData],
  );

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
        const data = await api.createList(next, {
          accent: theme.accent,
          colorMode: theme.colorMode,
        });
        showApp(data);
        toast(`สร้างลิสต์แล้ว จำรหัส ${data.code} ไว้นะคะ`, { icon: "bow" });
        return true;
      } catch (err) {
        showWelcome(errorMessage(err));
        return false;
      }
    },
    [showApp, showWelcome, toast, theme.accent, theme.colorMode],
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
        applyListData(await api.openList(code));
        if (showToast) toast("อัปเดตแล้ว");
      } catch {
        if (showToast) toast("รีเฟรชไม่สำเร็จ ลองอีกครั้งนะคะ");
      }
    },
    [code, toast, applyListData],
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
        if (saved.collected) toast("เก็บแล้ว เย้ 💗", { icon: "check" });
        else toast("ย้ายกลับไปยังไม่ได้เก็บ");
      } catch (err) {
        replaceItem(item);
        toast(errorMessage(err));
      }
    },
    [code, replaceItem, toast],
  );

  const restore = useCallback(
    async (id: string) => {
      try {
        const restored = await api.restoreItem(code, id);
        setItems((prev) => [...prev.filter((i) => i.id !== id), restored]);
        toast("กู้คืนรายการแล้ว", { icon: "check" });
      } catch (err) {
        toast(errorMessage(err));
      }
    },
    [code, toast],
  );

  const remove = useCallback(
    async (id: string) => {
      const backup = itemsRef.current;
      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await api.deleteItem(code, id);
        toast("ลบรายการแล้ว", { action: { label: "เลิกทำ", onClick: () => void restore(id) } });
      } catch (err) {
        setItems(backup);
        toast(errorMessage(err));
      }
    },
    [code, toast, restore],
  );

  /** Returns true on success so the form can reset. */
  const save = useCallback(
    async (draft: ItemDraft, editingId: string | null): Promise<boolean> => {
      try {
        if (editingId) {
          replaceItem(await api.updateItem(code, editingId, draft));
          toast("บันทึกแล้ว", { icon: "check" });
        } else {
          const saved = await api.addItem(code, draft);
          setItems((prev) => [...prev, saved]);
          toast("เพิ่มลงเช็กลิสต์แล้ว", { icon: "bow" });
        }
        return true;
      } catch (err) {
        toast(errorMessage(err));
        return false;
      }
    },
    [code, replaceItem, toast],
  );

  const savePrefs = useCallback(
    async (prefs: ListPrefs) => {
      if (!code) return;
      try {
        await api.updateList(code, prefs);
      } catch (err) {
        toast(errorMessage(err));
      }
    },
    [code, toast],
  );

  const changeAccent = useCallback(
    (next: Accent) => {
      setAccent(next);
      void savePrefs({ accent: next });
    },
    [setAccent, savePrefs],
  );

  const toggleDark = useCallback(() => {
    const next = nextColorMode(theme.isDark);
    setColorMode(next);
    void savePrefs({ colorMode: next });
  }, [theme.isDark, setColorMode, savePrefs]);

  useEffect(() => {
    const start = initialCode || loadValue(STORAGE_KEYS.code) || "";
    if (start) void openCode(start, !initialCode);
    else showWelcome();
    // Boot once per initial code; openCode/showWelcome are stable.
  }, [initialCode]);

  return {
    view,
    welcomeError,
    code,
    items,
    openCode,
    createList,
    leave,
    refresh,
    toggle,
    remove,
    save,
    changeAccent,
    toggleDark,
  };
}
