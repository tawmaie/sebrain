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

## Features

### Quick Capture และ Inbox

- เพิ่มข้อความแบบรวดเร็วจากหน้า Today หรือ Inbox
- บันทึกไอเดียหรืองานชั่วคราว
- แสดงรายการล่าสุดก่อน
- แก้ไขและลบข้อความ
- เก็บข้อมูลใน SQLite และคงอยู่หลังปิดแอป

### Task Management

- จัดการงานตามสถานะ: Inbox, Today, Doing, Done
- สร้าง แก้ไข และลบ Task
- กำหนดงานสำหรับวันนี้
- บันทึกวันที่เสร็จงาน
- ผูก Note กับ Task ได้
- ตั้งค่า Pomodoro ที่คาดว่าจะใช้ต่องาน

### Pomodoro

- Focus Timer, Short Break และ Long Break
- Start / Pause / Resume / Reset / Finish Early
- ผูก Pomodoro กับ Task หรือ Note
- บันทึกประวัติ Focus Session
- กู้สถานะ Timer หลังเปิดแอปใหม่ (คำนวณจาก `end_at`)
- ตั้งค่าระยะเวลาและพฤติกรรม Timer ได้จาก Settings

### Markdown Notes

- สร้างและแก้ไข Note
- รองรับ Markdown, หัวข้อ, Bullet List, Checklist และ Code Block
- Preview Markdown แบบแยกหน้าจอ
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

### Today Dashboard

- สรุปงานวันนี้และ Quick Capture ในหน้าเดียว
- แสดง Note ล่าสุดและเวลาโฟกัสสะสมของวัน

### Search และ Keyboard Shortcuts

- ค้นหาข้าม Inbox, Tasks และ Notes
- `Ctrl+K` — โฟกัสช่องค้นหา
- `Ctrl+N` — เปิด Quick Capture

### Settings

- ปรับระยะเวลา Focus, Short Break และ Long Break
- ตั้งค่า Long Break Interval
- เปิด/ปิด Auto Start Break และการแจ้งเตือน

---

## Roadmap

ฟีเจอร์ที่ยังไม่ได้พัฒนาในเวอร์ชันปัจจุบัน

- Tags, Collections และ Favorites
- Internal Note Links และ Backlinks
- Export และ Import Backup
- System Tray, Close to Tray และ Auto Start พร้อม Windows
- Global Quick Capture Shortcut (นอกแอป)
- Mini Pomodoro Window และ Always on Top
- Windows Notification แบบ Native
- Auto Update

---

## Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
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
│   └── Windows Installer
│
└── SQLite
    └── sebrain.db
```

SeBrain ไม่มี Backend Server ในเวอร์ชันปัจจุบัน

React อ่านและเขียนข้อมูล SQLite ผ่าน Tauri SQL Plugin ได้โดยตรง

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
│   │   ├── focus/
│   │   ├── today/
│   │   └── settings/
│   ├── repositories/
│   ├── services/
│   │   ├── database.ts
│   │   └── migrations.ts
│   ├── hooks/
│   ├── types/
│   ├── App.tsx
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
| `src/services` | เปิด Database, Migration และบริการพื้นฐาน |
| `src/types` | TypeScript Type และ Interface |
| `src-tauri` | Native Desktop Layer และ Tauri Configuration |

---

## Local Database

SeBrain ใช้ SQLite เป็นฐานข้อมูลแบบ Local

ผู้ใช้ไม่ต้องติดตั้ง MySQL, MariaDB, XAMPP หรือ Database Server เพิ่ม

เมื่อเปิดแอปครั้งแรก ระบบจะสร้างไฟล์ฐานข้อมูล `sebrain.db` ให้อัตโนมัติ

ข้อมูลจะอยู่ใน Application Data Directory ของระบบปฏิบัติการ ไม่ได้ถูกสร้างไว้ในโฟลเดอร์โปรเจกต์โดยตรง

Schema ถูกจัดการผ่าน `src/services/migrations.ts` และรันตอนเปิดแอป

### ตารางหลัก

| ตาราง | ใช้งาน |
| --- | --- |
| `inbox_items` | Quick Capture |
| `tasks` | งานและสถานะ |
| `notes` | Markdown Notes |
| `pomodoro_sessions` | ประวัติ Focus Session |
| `active_timer` | สถานะ Timer ปัจจุบัน |
| `settings` | การตั้งค่าแอป |
| `schema_migrations` | ติดตามเวอร์ชัน Migration |

---

## การติดตั้งและรันโปรเจกต์

ส่วนนี้รวมทุกขั้นตอนตั้งแต่เตรียมเครื่องมือ ติดตั้ง dependency จนถึงรันและ build แอป

### 1. สิ่งที่ต้องติดตั้งก่อน

#### Node.js

```powershell
node --version
npm --version
```

#### Rust

Tauri ต้องใช้ Rust toolchain (`cargo`, `rustc`) ในการ build ส่วน Desktop

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

#### Microsoft Visual Studio Build Tools

ต้องติดตั้ง Workload **Desktop development with C++** และ Component อย่างน้อย:

- MSVC v143 - VS 2022 C++ x64/x86 Build Tools
- Windows 10 SDK หรือ Windows 11 SDK
- C++ CMake Tools for Windows

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

#### WebView2 Runtime

Windows รุ่นใหม่มักติดตั้ง WebView2 มาแล้ว หากไม่มี ให้ติดตั้ง [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) เพิ่ม

### 2. Clone และติดตั้ง Dependency

```powershell
cd C:\project\sebrain
npm install
```

### 3. รัน Development Mode

```powershell
npm run tauri dev
```

เมื่อทำงานสำเร็จ จะเปิดหน้าต่าง Desktop App ของ SeBrain

> **หมายเหตุ:** ครั้งแรกที่รัน `npm run tauri dev` อาจใช้เวลานาน เพราะ Cargo ต้องดาวน์โหลดและคอมไพล์ dependency ของ Rust

### 4. คำสั่งอื่นที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
| --- | --- |
| `npm run tauri dev` | เปิด Development Mode |
| `npm run dev` | รัน Frontend อย่างเดียว (Vite) |
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
- เพิ่ม Database Migration เมื่อ Schema เปลี่ยน
- ทุกฟีเจอร์ต้องรองรับการปิดและเปิดแอปใหม่
- Pomodoro ต้องคำนวณเวลาจากเวลาสิ้นสุดจริง ไม่ใช้การลดตัวเลขทีละวินาทีเป็นแหล่งข้อมูลหลัก
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
- เครื่องเข้าสู่ Sleep
- แอปถูกปิดแล้วเปิดใหม่
- หน้าจอหยุดอัปเดตชั่วคราว

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

แต่ในเวอร์ชันปัจจุบันยังไม่มี:

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
| Current Stage | Core Features (Inbox, Tasks, Notes, Pomodoro) |

---

## License

ยังไม่ได้กำหนด License สำหรับโปรเจกต์นี้
