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
        <span className={s.icon} aria-hidden="true">💌</span>
        <b>{all}</b>
        <small>ทั้งหมด</small>
      </div>
      <div className={`${s.stat} ${s.todo}`}>
        <span className={s.icon} aria-hidden="true">⏳</span>
        <b>{todo}</b>
        <small>ยังไม่ได้เก็บ</small>
      </div>
      <div className={`${s.stat} ${s.done}`}>
        <span className={s.icon} aria-hidden="true">🎁</span>
        <b>{done}</b>
        <small>เก็บแล้ว</small>
      </div>
    </section>
  );
}
