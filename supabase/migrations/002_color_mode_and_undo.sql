-- Giveaway Tracker: design refresh
-- รันหลัง 001_init.sql ใน Supabase Dashboard > SQL Editor (รันซ้ำได้ ไม่พัง)

-- 1) dark mode per list: system = follow device, light/dark = forced by the toggle
alter table public.lists
  add column if not exists color_mode text not null default 'system';

alter table public.lists drop constraint if exists lists_color_mode_check;
alter table public.lists
  add constraint lists_color_mode_check check (color_mode in ('system', 'light', 'dark'));

-- 2) soft delete so "เลิกทำ" (undo) can restore a deleted item
alter table public.items
  add column if not exists deleted_at timestamptz;

-- live items per list (used by list open, item cap and updates)
create index if not exists items_list_code_live_idx
  on public.items (list_code, created_at desc)
  where deleted_at is null;
