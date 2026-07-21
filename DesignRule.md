# SeBrain — UX/UI Rules

## 1. Product Principle

SeBrain ไม่ใช่ Todo App ทั่วไปหรือ Notion อีกตัว

SeBrain คือ **ระบบปฏิบัติการสำหรับความคิด (Personal Work OS)** ที่ช่วยให้คุณเก็บทุกไอเดียทันที จัดระเบียบงานอย่างเป็นธรรมชาติ โฟกัสกับสิ่งสำคัญ และค้นคืนความรู้ได้ภายในไม่กี่วินาที โดยทุกอย่างทำงานแบบ Local-first และข้อมูลทั้งหมดเป็นของคุณ

> **Capture fast. Organize naturally. Focus deeply. Remember everything.**

### แกนหลัก 4 ขั้น

```text
Capture → Organize → Focus → Recall
```

- **Capture** — จดสิ่งที่คิดออกทันทีก่อนมันหาย
- **Organize** — จัด Inbox ให้กลายเป็น Task หรือ Note
- **Focus** — เลือกงานและเริ่มโฟกัสได้ทันที
- **Recall** — ค้นคืนความรู้และบริบทของงานที่ผ่านมา

### Information Lifecycle

ทุกอย่างใน SeBrain มี lifecycle ที่ต่อเนื่องกัน ไม่มีข้อมูลที่ "หายไปหลังทำเสร็จ"

```text
Idea
  ↓
Inbox
  ↓
Task
  ↓
Focus
  ↓
Done
  ↓
Knowledge (Note)
```

Task ที่เสร็จแล้วควรกลายเป็นความรู้ ไม่ใช่แค่ถูก check แล้วหาย

### Task เป็น Knowledge Container

Task ไม่ใช่แค่ checkbox Task คือ container ที่ผูกกับ Note ได้

```text
Task: Implement Login
  └── Linked Note: OAuth Flow · JWT · Meeting Notes
```

ผลคือ Task + Time (Pomodoro) + Knowledge (Note) = Second Brain จริง

### เกณฑ์ตัดสินฟีเจอร์

ทุกหน้าจอและทุกฟีเจอร์ต้องผ่านคำถามนี้:

> ฟีเจอร์นี้ช่วยให้ Capture เร็วขึ้น, Organize ง่ายขึ้น, Focus ดีขึ้น หรือ Recall ได้ดีขึ้นหรือไม่

หากไม่ช่วยอย่างใดอย่างหนึ่งอย่างชัดเจน ไม่ควรเพิ่มใน MVP

---

## 2. Brand Direction

SeBrain มาจากแนวคิด:

```text
Second Brain + Zebra
```

บุคลิกของระบบ:

- ฉลาด
- สงบ
- เป็นระเบียบ
- ใช้งานจริงจังได้
- มีความขี้เล่นเล็กน้อย
- ไม่ดูเด็ก
- ไม่ดูเป็นระบบองค์กรจนแข็งเกินไป

สัดส่วนภาพรวม:

```text
90% Minimal monochrome
8% Accent color
2% Zebra identity
```

ลายม้าลายเป็นเพียง Brand Accent ห้ามใช้เป็นพื้นหลังหลักของหน้าจอ

---

## 3. Color Rules

### Core Colors

```css
:root {
  --color-bg: #f7f7f5;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f1ee;

  --color-text-primary: #181818;
  --color-text-secondary: #737373;
  --color-text-disabled: #a3a3a3;

  --color-border: #e5e5e2;
  --color-border-strong: #cfcfca;

  --color-black: #202020;
  --color-accent: #c7f36b;
  --color-accent-hover: #b9e75d;
  --color-accent-soft: #effbd8;

  --color-danger: #d94a4a;
  --color-danger-soft: #fff0f0;
  --color-warning: #e5a93d;
  --color-success: #4f8a42;
}
```

### การใช้สี

สี Accent ใช้เฉพาะ:

- ปุ่ม Start Focus
- Active navigation
- Task ที่กำลังทำ
- Selected item
- Focus progress
- Success feedback ที่สำคัญ

ห้ามใช้ Accent กับทุกปุ่ม เพราะจะทำให้ไม่มีสิ่งใดเด่นจริง

สีแดงใช้เฉพาะ:

- Delete
- Error
- Cancel ที่มีผลทำลายข้อมูล
- Reset timer ที่กำลังทำงาน หากมีผลต่อ session

สถานะงานไม่ควรใช้หลายสีเกินไป:

```text
Inbox   = เทา
Today   = ดำ
Doing   = Accent
Done    = เทาอ่อน
```

---

## 4. Zebra Identity Rules

ใช้ลาย Zebra ได้เฉพาะพื้นที่เล็ก เช่น:

- Logo
- Active indicator ใน Sidebar
- Pomodoro progress
- Empty state
- Divider ขนาดเล็ก
- Splash screen

ห้ามใช้:

- เป็นพื้นหลังทั้งหน้า
- หลังข้อความยาว
- ภายในทุก Card
- ในพื้นที่ Editor
- บนปุ่มหลายปุ่มพร้อมกัน

พื้นที่ Zebra ที่มองเห็นพร้อมกันไม่ควรเกินประมาณ 5% ของหน้าจอ

ตัวอย่าง pattern:

```css
.zebra-pattern {
  background: repeating-linear-gradient(
    -45deg,
    #202020 0,
    #202020 5px,
    #ffffff 5px,
    #ffffff 10px
  );
}
```

---

## 5. Layout Rules

ใช้ Desktop-first layout แบบ 3 ส่วน:

```text
┌──────────────────────────────────────────────────────────────┐
│ Topbar                                                       │
├──────────────┬────────────────────────┬──────────────────────┤
│ Sidebar      │ List Panel             │ Detail Panel         │
│ 220–240px    │ 320–380px              │ Flexible             │
└──────────────┴────────────────────────┴──────────────────────┘
```

### Sidebar

ต้องมี:

- Logo และชื่อ SeBrain
- Today
- Inbox
- Tasks
- Notes
- Focus
- Settings ด้านล่าง

กฎ:

- ความกว้างคงที่
- Active menu ต้องเห็นชัด
- Badge แสดงเฉพาะจำนวนที่มีความหมาย เช่น Inbox
- ไม่ใส่คำอธิบายยาวใต้ทุกเมนู
- ห้ามมีเมนูหลักเกิน 7 รายการใน MVP

### List Panel

ใช้สำหรับ:

- Task list
- Note list
- Inbox list
- Focus history

กฎ:

- ใช้ Row เป็นหลัก ไม่ใช่ Card ทุกชิ้น
- รายการต้องสแกนด้วยสายตาได้เร็ว
- Selected row ต้องเห็นชัด
- ข้อความรองใช้สี Secondary
- Action รองซ่อนจน hover ได้ แต่ Action สำคัญต้องเข้าถึงได้ด้วย keyboard

### Detail Panel

ใช้สำหรับ:

- Task editor
- Note editor
- Preview
- Settings detail

กฎ:

- เป็นพื้นที่กว้างที่สุด
- เนื้อหาหลักต้องไม่ชิดขอบ
- ฟอร์มไม่ควรกว้างเต็มหน้าจอหากไม่จำเป็น
- Note content ควรกว้างไม่เกินประมาณ 720–800px เพื่อให้อ่านง่าย

---

## 6. Spacing Rules

ใช้ระบบ spacing คงที่:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
}
```

กฎ:

- ระยะระหว่าง Icon และข้อความ: 8px
- ระยะภายใน Input และ Button: 10–14px
- ระยะระหว่าง Form field: 16px
- ระยะระหว่าง Section: 24–32px
- ห้ามใช้ค่าระยะกระจัดกระจาย เช่น 13px, 19px, 27px โดยไม่มีเหตุผล

---

## 7. Typography Rules

ใช้ System font เท่านั้น:

```css
font-family:
  Inter,
  "Noto Sans Thai",
  "Segoe UI",
  system-ui,
  sans-serif;
```

ขนาดแนะนำ:

```text
App name          20–22px
Page title        26–30px
Section title     16–18px
Body              14px
Metadata          12px
Timer             52–72px
Markdown body     15–16px
```

กฎ:

- ใช้ตัวหนาเฉพาะหัวข้อและข้อมูลสำคัญ
- Metadata ห้ามเด่นกว่าชื่องาน
- ตัวอักษรเนื้อหาห้ามต่ำกว่า 13px
- Markdown content ใช้ line-height ประมาณ 1.65–1.75
- ห้ามใช้ตัวพิมพ์ใหญ่กับข้อความยาว
- Label แบบ uppercase ใช้ได้เฉพาะคำสั้น เช่น `FOCUS`, `TODAY`

---

## 8. Border and Radius Rules

```css
:root {
  --radius-input: 10px;
  --radius-button: 10px;
  --radius-card: 14px;
  --radius-modal: 16px;
}
```

กฎ:

- ใช้ Border บางแทน Shadow หนัก
- Card ใช้เฉพาะสิ่งที่ต้องแยกเป็นกลุ่มชัดเจน
- ห้ามทำทุก Row เป็น Card
- ห้ามใช้ Radius ใหญ่จนดูเหมือน Mobile App
- Shadow ใช้เฉพาะ Modal, Floating Capture และ Focus widget

---

## 9. Button Rules

### Primary Button

ใช้กับ Action หลักของหน้าจอนั้นเพียงหนึ่งรายการ เช่น:

- Add
- Save
- Start Focus
- Create Task

รูปแบบ:

```text
พื้นดำ + ตัวอักษรขาว
```

ยกเว้น Start Focus ใช้ Accent ได้

### Secondary Button

ใช้กับ:

- Cancel
- Preview
- Archive
- Pause

รูปแบบ:

```text
พื้นขาว + Border เทา
```

### Destructive Button

ใช้กับ:

- Delete
- Remove
- Reset session

รูปแบบปกติควรเป็นข้อความแดงหรือ Border แดง ไม่ควรเป็นพื้นแดงทึบทุกครั้ง

### Button Behavior

ทุกปุ่มต้องมี:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

ปุ่ม Loading ต้องป้องกันการกดซ้ำ

---

## 10. Input Rules

ทุก Input ต้องมี:

- Label หรือ Placeholder ที่ชัดเจน
- Focus state
- Error message
- Disabled state
- Keyboard support

กฎ:

- Placeholder ไม่ควรใช้แทน Label ใน Form สำคัญ
- Quick Capture ใช้ Placeholder ได้เพราะมีวัตถุประสงค์เดียว
- Error ต้องอยู่ใกล้ Field ที่ผิด
- Auto-save field ไม่ควรมีปุ่ม Save ถาวร เว้นแต่ข้อมูลสำคัญมาก
- Enter ใช้ Submit ได้ใน Quick Capture
- Shift + Enter ใช้ขึ้นบรรทัดใหม่ใน Note หรือ Description

---

## 11. Quick Capture Rules

Quick Capture เป็นองค์ประกอบสำคัญที่สุดของ SeBrain

ต้อง:

- เปิดแอปแล้วพร้อมพิมพ์ได้ทันที
- กด Enter เพื่อบันทึก
- ไม่บังคับเลือกประเภทก่อน
- ไม่บังคับ Tag, Project หรือ Priority
- ปฏิเสธข้อความว่าง
- แสดง Feedback หลังบันทึก
- คืน Focus กลับช่องกรอกหลังบันทึก

เป้าหมาย:

```text
เปิดแอป → พิมพ์ → Enter
```

ต้องใช้เวลาไม่เกินประมาณ 3 วินาที

---

## 12. Inbox Rules

Inbox คือพื้นที่รับข้อมูลก่อนจัดหมวด

แต่ละรายการต้องมี:

- Content
- วันที่หรือเวลาสั้น ๆ
- Convert to Task
- Convert to Note
- Edit
- Delete

กฎ:

- เรียงใหม่สุดก่อน
- ห้ามบังคับจัดหมวดทันที
- Convert ต้องไม่ทำข้อมูลหาย
- ลบต้อง Confirm
- หาก Convert ล้มเหลว ต้องเก็บ Inbox item เดิมไว้
- Empty state ต้องแนะนำให้เริ่ม Quick Capture

---

## 13. Task UX Rules

สถานะมีเพียง:

```text
Inbox
Today
Doing
Done
```

กฎ:

- Task หนึ่งรายการควรอ่านได้ใน 1–2 บรรทัด
- ข้อมูลงานรองไม่ควรแย่งความเด่นจากชื่อ
- Doing ควรมีได้หลายงาน แต่ UI ควรเน้นงานที่กำลัง Focus อยู่มากที่สุด
- Mark Done ต้องทำได้ในหนึ่ง Action
- เปลี่ยน Today ต้องทำได้โดยไม่เปิด Editor
- Delete อยู่ในเมนูรอง
- Task ที่ Done ใช้สีเทาและขีดฆ่าแบบเบา
- Estimated Pomodoro เป็น Optional ใน UX แม้ DB มี Default

ตัวอย่าง Task row:

```text
○ แก้ระบบ BOS
  Today · 1/3 focus sessions
```

---

## 14. Notes UX Rules

Note ต้องรองรับ Markdown โดยตรง:

```md
# Heading
## Subheading
- List
- [ ] Checklist
```

โหมด:

```text
Write
Split
Preview
```

กฎ:

- ค่าเริ่มต้นใช้ Write หรือ Split ตามขนาดหน้าต่าง
- Auto-save หลังหยุดพิมพ์ประมาณ 500–1000ms
- แสดงสถานะ `Saving...`, `Saved`, `Save failed`
- ห้ามแสดง Modal ทุกครั้งที่ Save
- Title แก้ไขได้โดยตรง
- Editor ต้องรองรับ Tab และ keyboard shortcut ที่จำเป็น
- Preview ต้องไม่ execute HTML หรือ script ที่ไม่ปลอดภัย
- Pin และ Archive เป็น Action รอง
- Delete ต้อง Confirm

---

## 15. Pomodoro UX Rules

ผู้ใช้ต้องเริ่ม Focus ได้ภายในไม่เกิน 2 Actions:

```text
เลือก Task → Start Focus
```

Timer ต้องแสดง:

- Mode
- เวลาคงเหลือ
- Task ที่กำลังทำ
- Progress
- Controls ที่เกี่ยวข้องกับสถานะปัจจุบัน

### Running State

แสดง:

```text
Pause
Finish
```

ไม่ควรแสดง Start ซ้ำ

### Paused State

แสดง:

```text
Resume
Reset
Finish
```

### Idle State

แสดง:

```text
Start Focus
```

กฎ:

- Timer ต้องอ่านง่ายจากระยะไกล
- เวลาต้องเป็นจุดเด่นที่สุด
- Zebra pattern ใช้เฉพาะ Progress
- Accent ใช้เฉพาะ Session ที่กำลังทำ
- Reset ต้อง Confirm หาก Session เริ่มไปแล้ว
- จบรอบต้องมี Feedback ชัดเจน
- Focus mode กับ Break mode ต้องแยกได้ด้วย Label ไม่พึ่งสีอย่างเดียว

---

## 16. Today Page Rules

Today เป็นหน้าเปิดแอปหลัก ไม่ใช่ Task List ทั้งหมด แต่คือ "วันนี้ฉันต้องทำอะไร"

ลำดับข้อมูล:

1. Quick Capture
2. Current Focus หรือ Doing
3. Today Tasks
4. Progress Card (งานที่ทำเสร็จวันนี้)
5. Recent Notes หากยังมีพื้นที่

### Progress Card

แสดงข้อมูล 3 จุดในการ์ดขนาดกะทัดรัด:

```text
PROGRESS
วันนี้คืบหน้า

[========--------]  4 / 8 งาน

7 รอบโฟกัส   ·   42 นาที
```

กฎ:

- ซ่อน card หากยังไม่มีงานที่วางแผนไว้วันนี้เลย (total = 0)
- Progress bar ใช้รูปแบบเดียวกับ task-progress ที่มีอยู่
- ไม่แสดงกราฟ ไม่แสดงสถิติรายสัปดาห์/เดือน

ห้ามใส่:

- กราฟหลายประเภท
- สถิติรายเดือนขนาดใหญ่
- Quote
- Weather
- Feed ที่ไม่เกี่ยวข้องกับงานวันนี้

เป้าหมายคือเปิดมาแล้วรู้ทันทีว่า:

```text
ตอนนี้กำลังทำอะไร
งานถัดไปคืออะไร
วันนี้โฟกัสไปเท่าไรแล้ว
```

---

## 17. Search Rules

Search เปิดด้วย:

```text
Ctrl + K
```

ต้องค้นหา:

- Task title
- Task description
- Note title
- Note content
- Inbox content

กฎ:

- Search result แยกประเภทชัดเจน
- Highlight คำที่ค้นพบ
- Enter เปิดรายการ
- Arrow keys เลื่อนรายการ
- Esc ปิด Search
- ไม่ต้องมี Advanced Filter ใน MVP

---

## 18. Navigation Rules

Keyboard shortcuts ขั้นต้น:

```text
Ctrl + K             Search
Ctrl + N             Quick Capture
Ctrl + Shift + N     New Note
Ctrl + Enter         Start Focus
Esc                  Close dialog / cancel edit
```

กฎ:

- Shortcut ต้องไม่ชนกับการพิมพ์ใน Editor
- ต้องมี Tooltip หรือ Shortcut hint
- ทุก Action สำคัญต้องใช้ Keyboard ได้
- Focus order ต้องเป็นธรรมชาติ

---

## 19. Feedback and State Rules

ทุกหน้าต้องรองรับ:

- Loading
- Empty
- Error
- Success
- Disabled
- Offline/local state หากมี Sync ในอนาคต

### Loading

- หลีกเลี่ยง Spinner เต็มหน้าจอ
- ใช้ Skeleton หรือข้อความสั้น
- Initial database loading สามารถใช้ Splash ได้

### Empty

ต้องบอก:

- ตอนนี้ไม่มีอะไร
- ผู้ใช้ทำอะไรต่อได้

ตัวอย่าง:

```text
ยังไม่มีโน้ต
สร้างโน้ตแรกเพื่อเริ่มเก็บความคิดของคุณ
```

### Error

ต้องบอก:

- เกิดอะไรขึ้นแบบเข้าใจง่าย
- ผู้ใช้ควรทำอะไรต่อ
- มี Retry หากทำได้

ห้ามแสดง Error ทางเทคนิคให้ผู้ใช้ทั่วไปเห็นโดยตรง

---

## 20. Confirmation Rules

ต้อง Confirm เมื่อ:

- ลบ Task
- ลบ Note
- ล้าง Session
- Import Backup ทับข้อมูลเดิม
- Reset ข้อมูลทั้งหมด

ไม่ต้อง Confirm เมื่อ:

- เปลี่ยนสถานะ
- Pin
- Archive
- เพิ่ม Today
- Pause Timer

ใช้ Undo แทน Confirm ได้ใน Action ที่ย้อนกลับง่าย

---

## 21. Accessibility Rules

- Contrast ต้องอ่านได้ชัด
- ห้ามสื่อสถานะด้วยสีอย่างเดียว
- ทุกปุ่ม icon-only ต้องมี `aria-label`
- Focus ring ต้องมองเห็น
- Tab navigation ต้องครบ
- ขนาดพื้นที่กดอย่างน้อยประมาณ 36×36px
- Timer ต้องรองรับ Screen Reader
- Label ต้องผูกกับ Input
- Modal ต้อง trap focus
- Esc ต้องปิด Modal ได้เมื่อปลอดภัย

---

## 22. Responsive Window Rules

SeBrain เป็น Desktop App แต่หน้าต่างอาจถูกย่อ

Breakpoints แนะนำ:

```text
≥ 1200px     3 panels
900–1199px   Sidebar + content/detail แบบย่อ
< 900px      ซ่อน list หรือ detail ทีละส่วน
```

กฎ:

- ห้ามให้ Layout แตกเมื่อลดขนาด
- Sidebar ยุบเป็น icon mode ได้
- Note Preview ซ่อนก่อน Editor
- Detail panel สามารถเปิดเป็น full panel ได้
- ตั้ง `minWidth` ของ Tauri ประมาณ 900px สำหรับ MVP ได้

---

## 23. Component Consistency Rules

Component เดียวกันต้องมีหน้าตาและพฤติกรรมเหมือนกันทุกหน้า:

- Button
- Input
- Modal
- Empty state
- Status badge
- List row
- Confirm dialog
- Toast
- Tabs

ห้ามสร้าง Button style ใหม่เฉพาะหน้าโดยไม่จำเป็น

---

## 24. Content and Wording Rules

ใช้ข้อความสั้น ตรง และเป็นมิตร

ใช้:

```text
เพิ่มงาน
เริ่มโฟกัส
ย้ายไปวันนี้
บันทึกแล้ว
ลองอีกครั้ง
```

หลีกเลี่ยง:

```text
ดำเนินการเพิ่มรายการข้อมูล
เกิดข้อผิดพลาดระหว่างการประมวลผล
กรุณาดำเนินการใหม่อีกครั้งในภายหลัง
```

กฎ:

- ปุ่มใช้คำกริยา
- หลีกเลี่ยงศัพท์เทคนิค
- ภาษาไทยและอังกฤษต้องไม่ผสมในประโยคเดียวโดยไม่จำเป็น
- ชื่อสถานะใช้คำเดิมทั้งระบบ

---

## 25. MVP Restriction Rules

ยังไม่ควรเพิ่ม:

- Calendar เต็มรูปแบบ
- Kanban board
- AI Chat / AI assistant
- Whiteboard
- Mind Map
- Team workspace
- Sharing / Collaboration
- Cloud sync
- Reminder / Notification
- Habit Tracker
- Folder ซ้อนหลายชั้น
- Project hierarchy
- Comment
- Graph view
- Rich text block editor
- Custom theme
- Plugin system
- Widget dashboard

ทั้งหมดข้างต้นไม่ได้ช่วยให้ Capture เร็วขึ้น, Organize ง่ายขึ้น, Focus ดีขึ้น หรือ Recall ได้ดีขึ้นอย่างมีนัยสำคัญ

### Knowledge Organization

Knowledge ใน SeBrain ไม่ใช้ Folder แต่ใช้:

- **Search** — ค้นหาข้ามทุกประเภทในที่เดียว (Task + Note + Inbox)
- **Recent** — โน้ตและงานล่าสุดอยู่ใกล้มือเสมอ
- **Pin** — ตรึงสิ่งสำคัญให้อยู่บนสุด
- **Backlink** — เชื่อมโน้ตและงานถึงกัน

ผู้ใช้ไม่ควรต้องคิดว่าจะวางข้อมูลไว้ใน "folder ไหน"

MVP ต้องเน้น:

```text
Capture
Organize
Focus
Recall
```

---

## 26. UX Friction Rule — 2 Steps Maximum

ทุก Action สำคัญต้องทำได้ไม่เกิน 2 Steps

ตัวอย่าง Action ที่ผ่าน:

```text
Open App → Type → Enter
Task → Start Focus
Ctrl+N → Type → Enter
```

ตัวอย่าง Flow ที่ไม่ควรเกิด:

```text
Open → Select → Choose category → Confirm → Start
```

กฎ:

- ถ้า Action ต้องการ Modal + Form + Confirm ก่อนจะทำได้ ต้องทบทวน UX ก่อน
- Quick Capture ต้องไม่มี Step กลาง
- เปลี่ยน Task status ต้องทำได้ใน 1 Action
- Start Focus ต้องทำได้ใน 1–2 Action จาก Task

---

## 27. UX Acceptance Criteria

SeBrain ถือว่าผ่านด้าน UX รุ่นแรกเมื่อ:

- ผู้ใช้จดไอเดียได้ภายใน 3 วินาที
- ผู้ใช้เริ่ม Focus ได้ไม่เกิน 2 Actions
- ผู้ใช้สร้าง Note ได้ไม่เกิน 2 Actions
- ผู้ใช้แยก Task กับ Note ได้ชัดเจน
- ผู้ใช้เข้าใจว่า Inbox มีไว้ทำอะไร
- ปิดและเปิดแอปใหม่แล้วกลับมาทำงานต่อได้
- ทุกหน้ามี Empty, Loading และ Error state
- ใช้งานด้วย Keyboard ได้ใน Action หลัก
- ไม่มีหน้าที่เต็มไปด้วย Card หรือสีหลายสี
- Zebra identity ชัดเจนแต่ไม่รบกวนการอ่าน
- UI ใช้งานต่อเนื่องนาน ๆ แล้วไม่ล้าสายตา

กฎสำคัญที่สุดของ SeBrain คือ:

> ทุกครั้งที่เพิ่มองค์ประกอบใหม่ ต้องลดจำนวนสิ่งที่ผู้ใช้ต้องคิด ไม่ใช่เพิ่มสิ่งที่ต้องจัดการ