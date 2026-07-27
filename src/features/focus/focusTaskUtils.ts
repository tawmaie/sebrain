import { listTasks } from "../../repositories/taskRepository";
import type { Task } from "../../types/task";

export async function loadFocusTasks(): Promise<Task[]> {
  const [doing, today] = await Promise.all([
    listTasks("doing"),
    listTasks("today"),
  ]);
  return [...doing, ...today];
}
