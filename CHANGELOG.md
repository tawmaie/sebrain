# Changelog

บันทึกการเปลี่ยนแปลงของ SeBrain ตามรูปแบบ [Keep a Changelog](https://keepachangelog.com/th/1.1.0/)

ข้อมูลเวอร์ชันในแอปอ่านจาก `changelog.json` — แก้ไฟล์นั้นเมื่อปล่อยเวอร์ชันใหม่ แล้วรัน `npm run version:sync` เพื่อ sync เวอร์ชันไปยัง package.json / Tauri

## [Unreleased]

## [0.2.0] - 2026-07-27

### Added

- Mini Pomodoro — หน้าต่างเล็กแบบ always-on-top สำหรับโฟกัส
- Mini Mode Hub — ซ่อนหน้าต่างหลักอัตโนมัติเมื่อเปิด mini และกลับมาเมื่อปิด
- แท็บ Timer / เคส ในหน้าต่าง mini
- เลือกเคส เปลี่ยนโหมด และเปิดรายละเอียดเคสจาก mini
- หน้าต่าง Work Log แยกสำหรับบันทึกงาน
- หน้าต่าง Task Detail แยกสำหรับดูรายละเอียดเคส
- เปิด mini จาก system tray

### Changed

- ปรับขนาดหน้าต่าง mini ให้กะทัดรัด (~300×300px)

## [0.1.7] - 2026-07-20

### Added

- Projects — จัดกลุ่มงานตาม project พร้อมสี
- ปฏิทิน (Calendar) สำหรับดูงานตามวัน
- Work Log — บันทึกงานที่ทำระหว่างโฟกัส
- ตัวกรองงาน (Filter)
- การแจ้งเตือนเมื่อจบรอบ Pomodoro
- ระบบ sync เวอร์ชันจาก version.json

### Changed

- ปรับปรุงหน้า Today และ Focus
- เปลี่ยนไอคอนแอป

### Fixed

- แก้ responsive layout
- แก้ปัญหา Note

## [0.1.0] - 2026-07-01

### Added

- Quick Capture และ Inbox
- จัดการงาน (Inbox, Today, Doing, Done)
- Pomodoro Timer — Focus, Short Break, Long Break
- Markdown Notes พร้อม preview
- ค้นหาข้าม Inbox, Tasks และ Notes
- Keyboard shortcuts (Ctrl+K, Ctrl+N)
- Settings — ปรับระยะเวลา Pomodoro และพฤติกรรม
