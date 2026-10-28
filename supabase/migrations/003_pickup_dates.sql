-- Giveaway Tracker: multiple pickup dates per item
-- รันหลัง 002_color_mode_and_undo.sql ใน Supabase Dashboard > SQL Editor (รันซ้ำได้ ไม่พัง)

-- Each element: { "date": "YYYY-MM-DD", "collected": true|false }.
-- The server validates the element shape; the database guards type and size.
-- The old free-text `pickup` column stays as pickup details (time, place).
alter table public.items
  add column if not exists pickup_dates jsonb not null default '[]'::jsonb;

alter table public.items drop constraint if exists items_pickup_dates_check;
alter table public.items
  add constraint items_pickup_dates_check check (
    case when jsonb_typeof(pickup_dates) = 'array'
      then jsonb_array_length(pickup_dates) <= 14
      else false
    end
  );
