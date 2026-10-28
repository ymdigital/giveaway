"use client";
import { FILTERS, visibleItems, type Filter } from "@/lib/items";
import type { Item } from "@/lib/types";
import { useArmedDelete } from "@/hooks/useArmedDelete";
import { ItemRow } from "./ItemRow";
import s from "./ItemList.module.css";

const FILTER_LABELS: Record<Filter, string> = {
  all: "ทั้งหมด",
  todo: "ยังไม่ได้เก็บ",
  done: "เก็บแล้ว",
};

interface ItemListProps {
  items: Item[];
  filter: Filter;
  query: string;
  onFilter: (filter: Filter) => void;
  onQuery: (query: string) => void;
  onToggle: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemList(props: ItemListProps) {
  const { items, filter, query, onFilter, onQuery, onToggle, onEdit, onDelete } = props;
  const { armedId, press } = useArmedDelete(onDelete);
  const view = visibleItems(items, filter, query);

  return (
    <section className="panel">
      <div className={s.listhead}>
        <h2>รายการของฉัน</h2>
        <div className={s.tabs} role="group" aria-label="ตัวกรอง">
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => onFilter(f)}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>
      <input
        className={s.search}
        type="search"
        placeholder="ค้นหาชื่อรายการ บัญชี วันรับ หรือโน้ต"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      {view.length > 0 ? (
        <ul className={s.list}>
          {view.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isArmed={armedId === item.id}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={press}
            />
          ))}
        </ul>
      ) : (
        <div className="empty">
          {items.length > 0 ? (
            <><b>ไม่เจอรายการที่ตรงกัน</b>ลองเปลี่ยนตัวกรองหรือคำค้นดูนะคะ</>
          ) : (
            <><b>ยังไม่มีรายการเลย 🌷</b>วางลิงก์ต้นโพสต์แรกได้ที่ฟอร์มด้านบน</>
          )}
        </div>
      )}
    </section>
  );
}
