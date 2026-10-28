"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { countItems, isFilter, type Filter } from "@/lib/items";
import { STORAGE_KEYS, loadValue, storeValue } from "@/lib/storage";
import type { Item } from "@/lib/types";
import { useGiveawayList } from "@/hooks/useGiveawayList";
import { useToast } from "@/hooks/useToast";
import { CodeBar } from "./CodeBar";
import { Header } from "./Header";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";
import { Stats } from "./Stats";
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
  const list = useGiveawayList(initialCode, toast.show);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [formNonce, setFormNonce] = useState(0);
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = loadValue(STORAGE_KEYS.filter);
    if (isFilter(saved)) setFilter(saved);
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
    leave();
  }, [leave, resetForm]);

  const changeFilter = useCallback((f: Filter) => {
    setFilter(f);
    storeValue(STORAGE_KEYS.filter, f);
  }, []);

  const stats = countItems(list.items);

  return (
    <>
      <div className="wrap">
        <Header accent={list.accent} showSwatches={list.view === "app"} onAccent={list.changeAccent} />

        {list.view === "booting" && (
          <p className="empty"><b>กำลังโหลด…</b>รอสักครู่นะคะ</p>
        )}

        {list.view === "welcome" && (
          <Welcome error={list.welcomeError} onOpen={list.openCode} onCreate={list.createList} />
        )}

        {list.view === "app" && (
          <div className={s.app}>
            <CodeBar
              code={code}
              shareUrl={buildShareUrl(code)}
              onRefresh={() => void refresh(true)}
              onLeave={handleLeave}
              toast={toast.show}
            />
            <Stats all={stats.all} todo={stats.todo} done={stats.done} />
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
                onFilter={changeFilter}
                onQuery={setQuery}
                onToggle={list.toggle}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        <footer>ทำด้วยความรักสำหรับนักเก็บ Giveaway 💕</footer>
      </div>
      {toast.message && <div className="toast" role="status">{toast.message}</div>}
    </>
  );
}
