export interface TaskLogEntry {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
}

export interface TaskLogEntryWithTask extends TaskLogEntry {
  taskTitle: string;
}

export interface TaskLogInput {
  taskId: string;
  body: string;
}
