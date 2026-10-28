import s from "./Stats.module.css";

interface StatsProps {
  all: number;
  todo: number;
  done: number;
}

export function Stats({ all, todo, done }: StatsProps) {
  return (
    <section className={s.stats} aria-label="สรุป">
      <div className={s.stat}>
        <div className={s.label}>✿ ทั้งหมด</div>
        <div className={s.num} style={{ color: "var(--p)" }}>{all}</div>
      </div>
      <div className={s.stat}>
        <div className={s.label}>○ ยังไม่ได้เก็บ</div>
        <div className={s.num} style={{ color: "var(--ink)" }}>{todo}</div>
      </div>
      <div className={s.stat}>
        <div className={s.label}>✓ เก็บแล้ว</div>
        <div className={s.num} style={{ color: "var(--ok)" }}>{done}</div>
      </div>
    </section>
  );
}
