# Giveaway Tracker 🎀

เว็บเช็กลิสต์เก็บลิงก์ Giveaway สำหรับสายติ่ง ไม่ต้องสมัครสมาชิก ตั้งรหัสลิสต์เองแล้วเปิดได้ทุกเครื่อง

- Next.js (App Router, TypeScript) + Supabase (Postgres)
- เบราว์เซอร์ไม่คุยกับ Supabase ตรง ๆ ทุกอย่างผ่าน API ของ Next.js ที่ใช้ `SUPABASE_SERVICE_ROLE_KEY` ฝั่งเซิร์ฟเวอร์เท่านั้น

---

## ตั้งค่าทีละขั้น

### 1. สร้างโปรเจกต์ Supabase

1. เข้า https://supabase.com แล้วล็อกอิน
2. กด **New project** ตั้งชื่อ ตั้งรหัสผ่านฐานข้อมูล แล้วเลือก Region ที่ใกล้ (เช่น Singapore)
3. รอจนโปรเจกต์สร้างเสร็จ (ประมาณ 1–2 นาที)

### 2. รัน SQL สร้างตาราง

1. ในโปรเจกต์ Supabase ไปที่เมนู **SQL Editor** แล้วกด **New query**
2. เปิดไฟล์ `supabase/migrations/001_init.sql` คัดลอกทั้งหมดไปวาง
3. กด **Run** ควรขึ้นว่า `Success. No rows returned`
4. ไปที่ **Table Editor** ตรวจว่ามีตาราง `lists` และ `items` แล้ว

> ทั้งสองตารางเปิด RLS ไว้แต่ไม่มี policy เลย แปลว่า anon key อ่าน/เขียนอะไรไม่ได้ ตั้งใจให้เป็นแบบนี้ เพราะมีแค่เซิร์ฟเวอร์ที่ถือ service role key ซึ่งเข้าถึงข้อมูลได้

### 3. คัดลอกคีย์

ไปที่ **Project Settings → API** (หรือ **Data API / API Keys**)

| ค่าใน Supabase | ใส่ในตัวแปร |
|---|---|
| Project URL | `SUPABASE_URL` |
| `service_role` key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **service_role key เป็นความลับ** ข้ามการตรวจสิทธิ์ทั้งหมด ห้ามใส่ `NEXT_PUBLIC_` ข้างหน้า ห้าม commit และห้ามแปะในแชต

### 4. รันในเครื่อง

```bash
npm install
# ไฟล์ .env.local สร้างไว้ให้แล้ว เปิดแล้วใส่ค่าจริงแทน placeholder
npm run dev
```

เปิด http://localhost:3000

`.env.local` (ไฟล์นี้ถูก gitignore ไว้แล้ว):

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 5. Push ขึ้น GitHub

```bash
git init
git add .
git commit -m "feat: giveaway tracker on Next.js + Supabase"
git branch -M main
git remote add origin https://github.com/<ชื่อคุณ>/giveaway-tracker.git
git push -u origin main
```

ก่อน push ตรวจด้วย `git status` ว่าไม่มี `.env.local` ติดไปด้วย

### 6. Import เข้า Vercel และใส่ env

1. เข้า https://vercel.com → **Add New… → Project**
2. เลือก repo `giveaway-tracker` แล้วกด **Import** (Vercel จะรู้เองว่าเป็น Next.js)
3. เปิด **Environment Variables** แล้วเพิ่ม 3 ตัวนี้

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://<ชื่อโปรเจกต์>.vercel.app` (หรือโดเมนของคุณ) |
   | `SUPABASE_URL` | Project URL จาก Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

### 7. Deploy

1. กด **Deploy** รอ 1–2 นาที
2. เปิดเว็บ ลองสร้างลิสต์ด้วยรหัสใหม่ แล้วเพิ่มลิงก์ X หนึ่งอัน
3. ถ้าได้ URL จริงหลัง deploy แล้วไม่ตรงกับ `NEXT_PUBLIC_SITE_URL` ให้แก้ค่าใน Vercel แล้วกด **Redeploy** (ตัวแปร `NEXT_PUBLIC_` ถูกฝังตอน build)

หลังจากนี้ทุกครั้งที่ push ขึ้น `main` Vercel จะ deploy ให้อัตโนมัติ

---

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันโหมดพัฒนา |
| `npm run build` | build production (มี type check) |
| `npm test` | รัน unit test |
| `npm run test:coverage` | รัน test พร้อม coverage |

## API

| Method | Path | ทำอะไร |
|---|---|---|
| POST | `/api/lists` | สร้างลิสต์ `{ code }` |
| GET | `/api/lists/[code]` | เปิดลิสต์ + รายการทั้งหมด (มี rate limit) |
| PATCH | `/api/lists/[code]` | เปลี่ยนสีธีม `{ accent }` |
| POST | `/api/lists/[code]/items` | เพิ่มรายการ (สูงสุด 500 ต่อลิสต์) |
| PATCH | `/api/lists/[code]/items/[id]` | แก้ไข/ติ๊กเก็บแล้ว |
| DELETE | `/api/lists/[code]/items/[id]` | ลบรายการ |
| GET | `/api/preview?url=` | ดึงรูป/ผู้โพสต์/ข้อความจากลิงก์ (cache 6 ชม.) |

ทุก endpoint ตอบรูปแบบ `{ ok: true, data }` หรือ `{ ok: false, error }` ยกเว้น `/api/preview` ที่ตอบ `{ ok, image, author, name, text }` และไม่โยน error

## ความปลอดภัย

- **รหัสลิสต์คือกุญแจ** ใครรู้รหัสก็เปิดลิสต์ได้ จึงบังคับยาว 8–40 ตัว และจำกัดการเปิดลิสต์ 30 ครั้ง/นาที/IP เพื่อกันการเดารหัส
- **Rate limit ตอนนี้เก็บในหน่วยความจำ** ของแต่ละ serverless instance เท่านั้น บน Vercel ที่มีหลาย instance จึงกันได้ไม่เต็มที่ ถ้าใช้จริงจังควรเปลี่ยนไปใช้ [Upstash Redis](https://upstash.com) กับ `@upstash/ratelimit` (แก้แค่ `src/lib/rate-limit.ts` และ `src/lib/limiters.ts`)
- ทุกคำสั่งกับรายการกรองด้วย `list_code` เสมอ จึงแก้/ลบรายการข้ามลิสต์ไม่ได้
- `/api/preview` กัน SSRF: รับแค่ http/https พอร์ต 80/443 บล็อก localhost และ IP ภายใน ตรวจ DNS และตรวจซ้ำทุกครั้งที่ redirect (ยังมีช่องโหว่แบบ DNS rebinding เล็กน้อย เพราะ fetch resolve DNS ซ้ำเอง)

## โครงสร้างโปรเจกต์

```
supabase/migrations/001_init.sql   SQL สร้างตาราง (รันเองใน SQL Editor)
src/app/                           หน้าเว็บ + API route handlers
src/components/                    UI (Header, Welcome, CodeBar, Stats, ItemForm, ItemList …)
src/hooks/                         state ฝั่ง client (ลิสต์, พรีวิว, toast, ปุ่มลบสองจังหวะ)
src/lib/                           validation (zod), repo (Supabase), preview, rate limit
```
