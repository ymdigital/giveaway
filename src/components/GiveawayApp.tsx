"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { countItems, isFilter, isSortOrder, isViewMode, type Filter, type SortOrder, type ViewMode } from "@/lib/items";
import { STORAGE_KEYS, loadValue, storeValue } from "@/lib/storage";
import type { Item } from "@/lib/types";
import { useGiveawayList } from "@/hooks/useGiveawayList";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { CodeBar } from "./CodeBar";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";
import { Stats } from "./Stats";
import { ThemeControls } from "./ThemeControls";
import { Toast } from "./Toast";
import { Welcome } from "./Welcome";
import s from "./GiveawayApp.module.css";

interface GiveawayAppProps {
  initialCode?: string;
}

function buildShareUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, "");
  return `${base}/l/${encodeURIComponent(code)}`;
}

export function GiveawayApp({ initialCode }: GiveawayAppProps) {
  const toast = useToast();
  const theme = useTheme();
  const list = useGiveawayList(initialCode, toast.show, theme);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<SortOrder>("status");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [editing, setEditing] = useState<Item | null>(null);
  const [formNonce, setFormNonce] = useState(0);
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = loadValue(STORAGE_KEYS.filter);
    if (isFilter(saved)) setFilter(saved);
    const savedOrder = loadValue(STORAGE_KEYS.sort);
    if (isSortOrder(savedOrder)) setOrder(savedOrder);
    const savedView = loadValue(STORAGE_KEYS.view);
    if (isViewMode(savedView)) setViewMode(savedView);
  }, []);

  const { code, refresh } = list;
  useEffect(() => {
    function onVisible() {
      if (!document.hidden && code && !editing) void refresh(false);
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [code, editing, refresh]);

  const resetForm = useCallback(() => {
    setEditing(null);
    setFormNonce((n) => n + 1);
  }, []);

  const startEdit = useCallback((item: Item) => {
    setEditing(item);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const { remove, leave } = list;
  const handleDelete = useCallback(
    (id: string) => {
      if (editing?.id === id) resetForm();
      void remove(id);
    },
    [editing, remove, resetForm],
  );

  const handleLeave = useCallback(() => {
    resetForm();
    setQuery("");
    leave();
  }, [leave, resetForm]);

  const changeFilter = useCallback((f: Filter) => {
    setFilter(f);
    storeValue(STORAGE_KEYS.filter, f);
  }, []);

  const changeOrder = useCallback((o: SortOrder) => {
    setOrder(o);
    storeValue(STORAGE_KEYS.sort, o);
  }, []);

  const changeViewMode = useCallback((v: ViewMode) => {
    setViewMode(v);
    storeValue(STORAGE_KEYS.view, v);
  }, []);

  const themeControls = (
    <ThemeControls
      accent={theme.accent}
      isDark={theme.isDark}
      onAccent={list.changeAccent}
      onToggleDark={list.toggleDark}
    />
  );
  const stats = countItems(list.items);

  return (
    <>
      {list.view === "booting" && (
        <div className={s.booting}>
          <div className="emptyBox">
            <div className="emptyIcon">🎀</div>
            <div className="emptyTitle">กำลังโหลด…</div>
            <div className="emptyText">รอสักครู่นะคะ</div>
          </div>
        </div>
      )}

      {list.view === "welcome" && (
        <Welcome
          error={list.welcomeError}
          accent={theme.accent}
          isDark={theme.isDark}
          onAccent={list.changeAccent}
          onToggleDark={list.toggleDark}
          onOpen={list.openCode}
          onCreate={list.createList}
        />
      )}

      {list.view === "app" && (
        <div className={s.screen}>
          <div className={s.wrap}>
            <header className={s.header}>
              <h1 className={s.brand}>Giveaway Tracker 🎀</h1>
              {themeControls}
            </header>
            <div className={s.summary}>
              <CodeBar
                code={code}
                shareUrl={buildShareUrl(code)}
                onRefresh={() => void refresh(true)}
                onLeave={handleLeave}
                toast={toast.show}
              />
              <Stats all={stats.all} todo={stats.todo} done={stats.done} />
            </div>
            <div className={s.main}>
              <ItemForm
                key={`${editing?.id ?? "new"}-${formNonce}`}
                ref={formRef}
                editing={editing}
                onSave={list.save}
                onCancel={resetForm}
                onSaved={resetForm}
              />
              <ItemList
                items={list.items}
                filter={filter}
                query={query}
                order={order}
                viewMode={viewMode}
                editingId={editing?.id ?? null}
                onFilter={changeFilter}
                onQuery={setQuery}
                onOrder={changeOrder}
                onViewMode={changeViewMode}
                onToggle={list.toggle}
                onToggleDate={list.toggleDate}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
