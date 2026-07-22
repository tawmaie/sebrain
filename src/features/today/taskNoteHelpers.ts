import type { Note } from "../../types/note";
import type { Task } from "../../types/task";
import { createNote, getNoteById } from "../../repositories/noteRepository";
import { updateTask } from "../../repositories/taskRepository";

function progressNoteTemplate(taskTitle: string): string {
  return `## ทำอะไรไปแล้ว

- [ ] 

## หมายเหตุ

งาน: ${taskTitle}
`;
}

export async function ensureTaskProgressNote(task: Task): Promise<Note> {
  if (task.linkedNoteId) {
    const existing = await getNoteById(task.linkedNoteId);
    if (existing) {
      return existing;
    }
  }

  const note = await createNote({
    title: `ความคืบหน้า: ${task.title}`,
    contentMarkdown: progressNoteTemplate(task.title),
  });

  await updateTask(task.id, { linkedNoteId: note.id });

  return note;
}
