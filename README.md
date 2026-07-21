# SeBrain

SeBrain คือแอป Desktop สำหรับจัดเก็บไอเดีย โน้ต งานที่ต้องทำ และช่วยโฟกัสด้วย Pomodoro โดยออกแบบให้ใช้งานแบบ Local-first ข้อมูลทั้งหมดถูกเก็บไว้ในเครื่องของผู้ใช้ ไม่ต้องติดตั้งหรือเชื่อมต่อ Database Server แยก

เป้าหมายของระบบคือช่วยลดความวุ่นวายจากการจดข้อมูลกระจัดกระจายในหลายระบบ และทำให้ผู้ใช้สามารถจดไอเดีย จัดการงาน และเริ่มโฟกัสได้จากแอปเดียว

---

## เป้าหมายของระบบ

SeBrain ถูกสร้างขึ้นเพื่อรองรับการใช้งานหลักดังนี้

- จดไอเดียหรืองานได้อย่างรวดเร็ว
- เก็บข้อมูลไว้ในเครื่องโดยไม่ต้องมี Server
- ปิดและเปิดแอปใหม่แล้วข้อมูลไม่หาย
- จัดการ Todo List และสถานะของงาน
- เขียน Note ด้วย Markdown
- ผูก Pomodoro เข้ากับงานหรือ Note
- ค้นหาข้อมูลที่เคยบันทึกไว้ได้ง่าย
- รองรับการพัฒนาเป็น Windows Desktop App
- รองรับการเพิ่ม Cloud Backup หรือ Sync ในอนาคต

---

## Technology Stack

### Frontend

- React
- TypeScript
- HTML
- CSS
- Vite

### Desktop Application

- Tauri 2
- Rust
- Windows WebView2

### Local Database

- SQLite
- Tauri SQL Plugin

---

## Architecture

```text
SeBrain
├── React + TypeScript
│   ├── User Interface
│   ├── Todo Management
│   ├── Markdown Notes
│   ├── Pomodoro
│   └── Application State
│
├── Repository Layer
│   ├── Inbox Repository
│   ├── Task Repository
│   ├── Note Repository
│   └── Pomodoro Repository
│
├── Tauri
│   ├── Desktop Window
│   ├── Native Plugins
│   ├── Notification
│   ├── System Tray
│   └── Windows Installer
│
└── SQLite
    └── sebrain.db
```

SeBrain ไม่มี Backend Server ในเวอร์ชันเริ่มต้น

React สามารถอ่านและเขียนข้อมูล SQLite ผ่าน Tauri SQL Plugin ได้โดยตรง

```text
React Component
      ↓
Repository
      ↓
Database Service
      ↓
Tauri SQL Plugin
      ↓
SQLite
```

---

## Project Structure

```text
sebrain/
├── src/
│   ├── assets/
│   ├── components/
│   ├── features/
│   │   ├── inbox/
│   │   ├── tasks/
│   │   ├── notes/
│   │   └── pomodoro/
│   ├── repositories/
│   ├── services/
│   │   └── database.ts
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
│
├── src-tauri/
│   ├── capabilities/
│   ├── icons/
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Folder Responsibilities

| Folder | Responsibility |
| --- | --- |
| `src/components` | Component ที่ใช้ร่วมกันหลายหน้า |
| `src/features` | UI และ Logic แยกตามฟีเจอร์ |
| `src/repositories` | อ่านและเขียนข้อมูลจาก SQLite |
| `src/services` | เปิด Database และเตรียมระบบพื้นฐาน |
| `src/types` | TypeScript Type และ Interface |
| `src-tauri` | Native Desktop Layer และ Tauri Configuration |

---

## Planned Features

### Phase 1 — Quick Capture และ Inbox

- เพิ่มข้อความแบบรวดเร็ว
- บันทึก Idea, Note หรือ Task ชั่วคราว
- แสดงรายการล่าสุดก่อน
- แก้ไขข้อความ
- ลบข้อความ
- เก็บข้อมูลใน SQLite
- ปิดและเปิดแอปใหม่แล้วข้อมูลยังอยู่

### Phase 2 — Task Management

- Inbox
- Today
- Doing
- Done
- สร้าง แก้ไข และลบ Task
- กำหนด Task สำหรับวันนี้
- บันทึกวันที่เสร็จงาน
- Pin งานสำคัญ

### Phase 3 — Pomodoro

- Focus Timer
- Short Break
- Long Break
- Start / Pause / Resume / Reset / Finish Early
- ผูก Pomodoro กับ Task หรือ Note
- บันทึกประวัติ Focus Session
- กู้สถานะ Timer หลังเปิดแอปใหม่
- รองรับ Windows Notification

### Phase 4 — Markdown Notes

- สร้างและแก้ไข Note
- รองรับ Markdown
- รองรับหัวข้อ เช่น `#`, `##` และ `###`
- รองรับ Bullet List, Checklist และ Code Block
- Preview Markdown
- Auto-save
- Pin และ Archive Note

ตัวอย่าง Markdown:

```markdown
# หัวข้อหลัก

## ปัญหาที่พบ

- ข้อมูลส่งไปไม่ครบ
- ระบบไม่บันทึก Log

## งานที่ต้องทำ

- [ ] ตรวจสอบ Payload
- [ ] แก้ไข Mapping
- [x] ทดสอบ Database
```

### Phase 5 — Second Brain Features

- Search
- Tags
- Collections
- Recent Notes
- Favorites
- Internal Note Links
- Backlinks
- Export และ Import Backup

### Phase 6 — Desktop Features

- System Tray
- Close to Tray
- Auto Start พร้อม Windows
- Global Quick Capture Shortcut
- Mini Pomodoro Window
- Always on Top
- Windows Installer
- Auto Update

---

## Local Database

SeBrain ใช้ SQLite เป็นฐานข้อมูลแบบ Local

ผู้ใช้ไม่ต้องติดตั้ง MySQL, MariaDB, XAMPP หรือ Database Server เพิ่ม

เมื่อเปิดแอปครั้งแรก ระบบจะสร้างไฟล์ฐานข้อมูล `sebrain.db` ให้อัตโนมัติ

ข้อมูลจะอยู่ใน Application Data Directory ของระบบปฏิบัติการ ไม่ได้ถูกสร้างไว้ในโฟลเดอร์โปรเจกต์โดยตรง

### Initial Database Tables

ในช่วงเริ่มต้น ระบบจะสร้างเฉพาะตารางที่จำเป็นก่อน

**inbox_items** — ใช้เก็บข้อมูลจาก Quick Capture

```sql
CREATE TABLE IF NOT EXISTS inbox_items (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'inbox',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### ตารางที่จะเพิ่มในอนาคต

- `tasks`
- `notes`
- `tags`
- `note_tags`
- `note_links`
- `pomodoro_sessions`
- `settings`

---

## Prerequisites

ก่อนเริ่มพัฒนา ต้องติดตั้งเครื่องมือต่อไปนี้

### Node.js

ตรวจสอบด้วยคำสั่ง:

```powershell
node --version
npm --version
```

### Rust

Tauri ต้องใช้ Rust toolchain (`cargo`, `rustc`) ในการ build ส่วน Desktop

**ติดตั้งบน Windows:**

1. ดาวน์โหลดจาก [https://rustup.rs](https://rustup.rs) หรือใช้ winget:

   ```powershell
   winget install Rustlang.Rustup
   ```

2. ปิดแล้วเปิด Terminal ใหม่

3. ตรวจสอบ:

   ```powershell
   rustc --version
   cargo --version
   rustup --version
   ```

**ถ้า PowerShell หา `cargo` ไม่พบ** (เช่น error `program not found` ตอนรัน `npm run tauri dev`):

```powershell
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

หรือเปิด Terminal ใหม่หลังติดตั้ง Rust ให้เรียบร้อย

### Microsoft Visual Studio Build Tools

ต้องติดตั้ง Workload **Desktop development with C++**

และควรมี Component อย่างน้อย:

- MSVC v143 - VS 2022 C++ x64/x86 Build Tools
- Windows 10 SDK หรือ Windows 11 SDK
- C++ CMake Tools for Windows

ติดตั้งด้วย winget:

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

### WebView2 Runtime

Windows รุ่นใหม่มักติดตั้ง WebView2 มาแล้ว หากไม่มี ให้ติดตั้ง [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) เพิ่ม

---

## Installation

1. Clone หรือเปิดโฟลเดอร์โปรเจกต์:

   ```powershell
   cd C:\project\sebrain
   ```

2. ติดตั้ง Dependency:

   ```powershell
   npm install
   ```

3. เปิด Development Mode:

   ```powershell
   npm run tauri dev
   ```

เมื่อทำงานสำเร็จ จะเปิดหน้าต่าง Desktop App ของ SeBrain

> **หมายเหตุ:** ครั้งแรกที่รัน `npm run tauri dev` อาจใช้เวลานาน เพราะ Cargo ต้องดาวน์โหลดและคอมไพล์ dependency ของ Rust

---

## Adding SQLite Support

เพิ่ม Tauri SQL Plugin:

```powershell
npm run tauri add sql
```

ตรวจสอบไฟล์ `src-tauri/Cargo.toml` ควรมี Dependency:

```toml
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
```

ตรวจสอบไฟล์ `src-tauri/src/lib.rs` ควรมีการลงทะเบียน Plugin:

```rust
.plugin(tauri_plugin_sql::Builder::default().build())
```

---

## Database Service

ตัวอย่างไฟล์ `src/services/database.ts`:

```typescript
import Database from "@tauri-apps/plugin-sql";

let database: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (database) {
    return database;
  }

  database = await Database.load("sqlite:sebrain.db");

  await database.execute(`
    CREATE TABLE IF NOT EXISTS inbox_items (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      item_type TEXT NOT NULL DEFAULT 'inbox',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return database;
}
```

---

## Development Commands

| คำสั่ง | คำอธิบาย |
| --- | --- |
| `npm run tauri dev` | เปิด Development Mode |
| `npm run build` | ตรวจสอบ Frontend Build |
| `cargo check --manifest-path src-tauri/Cargo.toml` | ตรวจสอบ Rust |
| `npm run tauri build` | สร้าง Windows Installer |

ไฟล์ Build จะถูกสร้างภายใต้:

```text
src-tauri/target/release/bundle/
```

ชนิดไฟล์ที่อาจได้: `.exe`, `.msi`

---

## Development Guidelines

- ใช้ TypeScript สำหรับโค้ดใหม่
- แยก SQL ออกจาก React Component
- React Component เรียกข้อมูลผ่าน Repository เท่านั้น
- สร้างตารางด้วย `CREATE TABLE IF NOT EXISTS`
- เริ่มจาก Schema ขนาดเล็ก
- หลีกเลี่ยงการทำทุกฟีเจอร์พร้อมกัน
- ทุกฟีเจอร์ต้องรองรับการปิดและเปิดแอปใหม่
- Pomodoro ต้องคำนวณเวลาจากเวลาสิ้นสุดจริง ไม่ใช้การลดตัวเลขทีละวินาทีเป็นแหล่งข้อมูลหลัก
- เพิ่ม Database Migration เมื่อ Schema เริ่มเปลี่ยน
- ทดสอบ Backup และ Restore ก่อนเปิดให้ผู้ใช้อื่นใช้

---

## Pomodoro Timer Principle

Timer ไม่ควรเก็บเฉพาะจำนวนวินาทีที่เหลือ

ควรบันทึกเวลาสิ้นสุดจริง:

```typescript
const endAt = Date.now() + durationSeconds * 1000;
```

และคำนวณเวลาที่เหลือทุกครั้ง:

```typescript
const remainingSeconds = Math.max(
  0,
  Math.ceil((endAt - Date.now()) / 1000),
);
```

วิธีนี้ช่วยให้ Timer ไม่เพี้ยนเมื่อ:

- เปลี่ยนหน้าต่าง
- ปิดหน้าต่างไป System Tray
- เครื่องเข้าสู่ Sleep
- แอปถูกปิดแล้วเปิดใหม่
- หน้าจอหยุดอัปเดตชั่วคราว

---

## Current Milestone

Milestone แรกของ SeBrain คือ **Quick Capture และ Inbox**

เงื่อนไขที่ต้องผ่าน:

1. เปิด SeBrain
2. พิมพ์ข้อความ
3. กด Enter
4. ข้อมูลถูกบันทึกใน SQLite
5. ปิดแอป
6. เปิดใหม่
7. ข้อมูลยังอยู่

เมื่อ Milestone นี้ทำงานสมบูรณ์แล้ว จึงเริ่มพัฒนา Task และ Pomodoro ต่อ

---

## Future Architecture

ในอนาคต หากต้องการให้ผู้ใช้ใช้งานหลายเครื่อง สามารถเพิ่ม Cloud Layer ได้

```text
SeBrain Desktop
├── Local SQLite
└── Sync Service
        ↓
PHP หรือ Next.js API
        ↓
MySQL / PostgreSQL
```

แนวทางที่แนะนำคือ Local-first:

```text
ผู้ใช้บันทึกข้อมูล
      ↓
บันทึก SQLite ทันที
      ↓
UI อัปเดตทันที
      ↓
ค่อย Sync ไปยัง Server เมื่อมีอินเทอร์เน็ต
```

แต่ในเวอร์ชันแรกจะยังไม่มี:

- Login
- Register
- Cloud Database
- Multi-device Sync
- Team Workspace
- Collaboration

---

## Project Status

| รายการ | ค่า |
| --- | --- |
| Project Name | SeBrain |
| Platform | Windows |
| Application Type | Native Desktop App |
| Framework | Tauri 2 |
| Frontend | React + TypeScript |
| Database | SQLite |
| Current Stage | Initial Setup |

---

## License

ยังไม่ได้กำหนด License สำหรับโปรเจกต์นี้
