import type { EntryType } from "../types/entry";

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  note: "Note",
  task_progress: "ความคืบหน้า",
  daily: "บันทึกประจำวัน",
  meeting: "Meeting",
  idea: "Idea",
};

export function getEntryTypeLabel(type: EntryType): string {
  return ENTRY_TYPE_LABELS[type] ?? type;
}

export function formatDailyTitle(date = new Date()): string {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function dailyEntryTemplate(): string {
  return `## วันนี้เป็นอย่างไร



## สิ่งที่ทำได้

- 

## ความคิด / บันทึก


`;
}
