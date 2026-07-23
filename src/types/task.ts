export type TaskStatus = "inbox" | "today" | "doing" | "done";

export type TaskDateField = "created" | "completed";

export interface TaskListOptions {
  status?: TaskStatus;
  dateField?: TaskDateField;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  plannedDate: string | null;
  estimatedPomodoros: number;
  completedPomodoros: number;
  linkedNoteId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  plannedDate?: string | null;
  estimatedPomodoros?: number;
  linkedNoteId?: string | null;
}
