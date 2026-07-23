import type { Task, TaskDateField } from "../types/task";

export function toLocalDateString(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTaskDateValue(
  task: Task,
  dateField: TaskDateField,
): string | null {
  if (dateField === "created") {
    return task.createdAt;
  }
  return task.completedAt;
}

export function isTaskInDateRange(
  task: Task,
  dateField: TaskDateField,
  fromDate: string | null,
  toDate: string | null,
): boolean {
  if (!fromDate && !toDate) {
    return true;
  }

  const source = getTaskDateValue(task, dateField);
  if (!source) {
    return false;
  }

  const day = toLocalDateString(source);
  if (fromDate && day < fromDate) {
    return false;
  }
  if (toDate && day > toDate) {
    return false;
  }
  return true;
}

export const TASK_DATE_FIELD_LABELS: Record<TaskDateField, string> = {
  created: "วันที่สร้างเคส",
  completed: "วันที่ปิดเคส",
};
