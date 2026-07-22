export type EntryType =
  | "note"
  | "task_progress"
  | "daily"
  | "meeting"
  | "idea";

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  contentMarkdown: string;
  taskId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EntryInput {
  type?: EntryType;
  title: string;
  contentMarkdown?: string;
  taskId?: string | null;
  isPinned?: boolean;
  isArchived?: boolean;
}
