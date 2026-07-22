import type { Entry } from "../../types/entry";
import type { Task } from "../../types/task";
import {
  createEntry,
  getEntryById,
  getTaskProgressEntry,
  updateEntry,
} from "../../repositories/entryRepository";
import { updateTask } from "../../repositories/taskRepository";

function progressEntryTemplate(taskTitle: string): string {
  return `## ทำอะไรไปแล้ว

- [ ] 

## หมายเหตุ

งาน: ${taskTitle}
`;
}

export async function ensureTaskProgressEntry(task: Task): Promise<Entry> {
  const byTask = await getTaskProgressEntry(task.id);
  if (byTask) {
    return byTask;
  }

  if (task.linkedNoteId) {
    const linked = await getEntryById(task.linkedNoteId);
    if (linked) {
      if (linked.type !== "task_progress" || linked.taskId !== task.id) {
        return updateEntry(linked.id, {
          type: "task_progress",
          taskId: task.id,
        });
      }
      return linked;
    }
  }

  const entry = await createEntry({
    type: "task_progress",
    taskId: task.id,
    title: `ความคืบหน้า: ${task.title}`,
    contentMarkdown: progressEntryTemplate(task.title),
  });

  await updateTask(task.id, { linkedNoteId: entry.id });

  return entry;
}
