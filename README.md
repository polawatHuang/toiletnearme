# 🚽 ToiletMap Thailand

แอปค้นหาห้องน้ำสาธารณะทั่วประเทศไทย พร้อมแผนที่, รีวิว และคะแนน

## Tech Stack

| Layer    | Tech                                       |
|----------|--------------------------------------------|
| Frontend | Next.js 14 · Tailwind CSS · Headless UI · React Hook Form · react-leaflet |
| Backend  | Node.js · Express · MySQL2 · JWT · Multer  |
| Map      | Leaflet + OpenStreetMap (ฟรี, ไม่ต้องใช้ API key) |

---

## Setup

### 1. สร้างฐานข้อมูล MySQL

```sql
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend

# สร้าง .env จาก template (แก้ DB_PASSWORD ให้ตรง)
copy .env.example .env

# ติดตั้ง dependencies (ทำแล้วอัตโนมัติ)
npm install

# รัน development server
npm run dev
```

### 3. Seed ข้อมูลตัวอย่าง (optional)

```bash
# จาก root folder
node database/seed.js
```

ค่า default:
- Admin → `admin@toiletnearme.com` / `Admin@123`
- User  → `user@toiletnearme.com`  / `User@123`

### 4. Frontend

```bash
cd frontend

# สร้าง .env.local
copy .env.local.example .env.local

# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000**

---

## Features

### User
- 🗺️ ดูแผนที่ห้องน้ำทั่วประเทศไทย
- 📍 ค้นหาตามชื่อสถานที่ (geocoding ด้วย Nominatim)
- 📡 ค้นหาห้องน้ำใกล้ตัว (GPS)
- ➕ เพิ่มจุดห้องน้ำบนแผนที่ (พร้อมรูปภาพ)
- ⭐ รีวิวและให้คะแนนห้องน้ำ

### Admin
- ✅ อนุมัติ / ปฏิเสธห้องน้ำที่ผู้ใช้เพิ่ม
- ✏️ แก้ไข / ลบห้องน้ำ
- 🗑️ ลบรีวิว
- 📊 Dashboard ภาพรวมระบบ

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET  | `/api/auth/me` | ข้อมูลตัวเอง |

### Toilets
| Method | Path | Auth |
|--------|------|------|
| GET    | `/api/toilets`            | optional |
| GET    | `/api/toilets/:id`        | — |
| POST   | `/api/toilets`            | required |
| PUT    | `/api/toilets/:id`        | required |
| DELETE | `/api/toilets/:id`        | admin |
| PATCH  | `/api/toilets/:id/status` | admin |
| GET    | `/api/toilets/stats`      | admin |

### Reviews
| Method | Path | Auth |
|--------|------|------|
| GET    | `/api/reviews?toilet_id=` | optional |
| POST   | `/api/reviews`            | required |
| PUT    | `/api/reviews/:id`        | required |
| DELETE | `/api/reviews/:id`        | required |

---

## Project Structure

```
toiletnearme/
├── database/
│   ├── schema.sql        ← MySQL schema
│   └── seed.js           ← Sample data seeder
├── backend/
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── frontend/
    └── src/
        ├── app/          ← Next.js pages (App Router)
        ├── components/   ← UI components
        ├── context/      ← Auth context
        └── lib/          ← API client + utils
```
