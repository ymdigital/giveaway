"use client";
import {
  countItems,
  FILTERS,
  isSortOrder,
  SORT_ORDERS,
  VIEW_MODES,
  visibleItems,
  type Filter,
  type SortOrder,
  type ViewMode,
} from "@/lib/items";
import type { Item } from "@/lib/types";
import { useArmedDelete } from "@/hooks/useArmedDelete";
import { GiveawayCard } from "./GiveawayCard";
import s from "./ItemList.module.css";

const FILTER_LABELS: Record<Filter, string> = {
  all: "ทั้งหมด",
  todo: "ยังไม่ได้เก็บ",
  done: "เก็บแล้ว",
};

const SORT_LABELS: Record<SortOrder, string> = {
  status: "ยังไม่ได้เก็บก่อน",
  newest: "ใหม่สุดก่อน",
  oldest: "เก่าสุดก่อน",
  title: "ชื่อ ก–ฮ",
};

const VIEW_LABELS: Record<ViewMode, { icon: string; label: string }> = {
  card: { icon: "▦", label: "มุมมองการ์ด" },
  list: { icon: "☰", label: "มุมมองรายการ" },
};

interface ItemListProps {
  items: Item[];
  filter: Filter;
  query: string;
  order: SortOrder;
  viewMode: ViewMode;
  editingId: string | null;
  onFilter: (filter: Filter) => void;
  onQuery: (query: string) => void;
  onOrder: (order: SortOrder) => void;
  onViewMode: (viewMode: ViewMode) => void;
  onToggle: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

function EmptyState({ hasItems, query, onClear }: { hasItems: boolean; query: string; onClear: () => void }) {
  if (!hasItems) {
    return (
      <div className="emptyBox">
        <div className="emptyIcon">🌷</div>
        <div className="emptyTitle">ยังไม่มีรายการเลย 🌷</div>
        <div className="emptyText">วางลิงก์ต้นโพสต์แรกได้ที่ฟอร์มด้านบน</div>
      </div>
    );
  }
  if (!query.trim()) {
    return (
      <div className="emptyBox">
        <div className="emptyIcon">✿</div>
        <div className="emptyTitle">ไม่เจอรายการที่ตรงกัน</div>
        <div className="emptyText">ลองเปลี่ยนตัวกรองดูนะ ✿</div>
      </div>
    );
  }
  return (
    <div className="emptyBox" style={{ paddingBlock: 40 }}>
      <div className="emptyIcon" style={{ fontSize: 30 }}>⌕</div>
      <div className="emptyTitle">ไม่เจอ “{query.trim()}” ในลิสต์นี้</div>
      <div className="emptyText">ลองค้นด้วยชื่อบัญชี หรือคำที่สั้นลงดูนะ ✿</div>
      <button type="button" className={s.clear} onClick={onClear}>ล้างการค้นหา</button>
    </div>
  );
}

function ViewControls({ order, viewMode, onOrder, onViewMode }: Pick<ItemListProps, "order" | "viewMode" | "onOrder" | "onViewMode">) {
  return (
    <div className={s.viewBar}>
      <label className={s.sortWrap}>
        <span className={s.sortLabel}>เรียงตาม</span>
        <select
          className={s.sort}
          value={order}
          onChange={(e) => {
            if (isSortOrder(e.target.value)) onOrder(e.target.value);
          }}
        >
          {SORT_ORDERS.map((o) => (
            <option key={o} value={o}>{SORT_LABELS[o]}</option>
          ))}
        </select>
      </label>
      <div className={s.views} role="group" aria-label="รูปแบบการแสดงผล">
        {VIEW_MODES.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={viewMode === v}
            aria-label={VIEW_LABELS[v].label}
            title={VIEW_LABELS[v].label}
            className={viewMode === v ? `${s.viewBtn} ${s.tabOn}` : s.viewBtn}
            onClick={() => onViewMode(v)}
          >
            <span aria-hidden="true">{VIEW_LABELS[v].icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ItemList(props: ItemListProps) {
  const { items, filter, query, order, viewMode, editingId, onFilter, onQuery, onToggle, onEdit, onDelete } = props;
  const { armedId, press } = useArmedDelete(onDelete);
  const view = visibleItems(items, filter, query, order);
  const counts = countItems(items);
  const tabCount: Record<Filter, number> = { all: counts.all, todo: counts.todo, done: counts.done };

  return (
    <section className={s.section}>
      <div className={s.toolbar}>
        <div className={s.tabs} role="group" aria-label="ตัวกรอง">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              className={filter === f ? `${s.tab} ${s.tabOn}` : s.tab}
              onClick={() => onFilter(f)}
            >
              {FILTER_LABELS[f]} {tabCount[f]}
            </button>
          ))}
        </div>
        <div className={s.searchWrap}>
          <span className={s.searchIcon} aria-hidden="true">⌕</span>
          <input
            className={s.search}
            type="search"
            placeholder="ค้นหาชื่อรายการหรือ @บัญชี"
            aria-label="ค้นหา"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
      </div>
      <ViewControls order={order} viewMode={viewMode} onOrder={props.onOrder} onViewMode={props.onViewMode} />
      {view.length > 0 ? (
        <ul className={viewMode === "list" ? s.rows : s.grid}>
          {view.map((item) => (
            <GiveawayCard
              key={item.id}
              item={item}
              variant={viewMode}
              isArmed={armedId === item.id}
              isEditing={editingId === item.id}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={press}
            />
          ))}
        </ul>
      ) : (
        <EmptyState hasItems={items.length > 0} query={query} onClear={() => onQuery("")} />
      )}
    </section>
  );
}
