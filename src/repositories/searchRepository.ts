import type { AppView } from "../types/navigation";
import type { EntryType } from "../types/entry";
import type { TaskStatus } from "../types/task";
import { listInboxItems } from "./inboxRepository";
import { listEntries } from "./entryRepository";
import { listTasks } from "./taskRepository";
import { searchTaskLogEntries } from "./taskLogRepository";

export type SearchResultKind = "inbox" | "task" | "entry" | "task_log";

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  snippet: string;
  updatedAt: string;
  entryType?: EntryType;
  taskStatus?: TaskStatus;
  taskId?: string;
}

function makeSnippet(text: string, maxLength = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query);
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const [inboxItems, tasks, entries, taskLogs] = await Promise.all([
    listInboxItems(),
    listTasks(),
    listEntries({ includeArchived: true }),
    searchTaskLogEntries(normalizedQuery),
  ]);

  const results: SearchResult[] = [];

  for (const item of inboxItems) {
    if (!matchesQuery(item.content, normalizedQuery)) {
      continue;
    }

    results.push({
      id: item.id,
      kind: "inbox",
      title: item.content.split("\n")[0] || "Inbox item",
      snippet: makeSnippet(item.content),
      updatedAt: item.updatedAt,
    });
  }

  for (const task of tasks) {
    if (
      !matchesQuery(task.title, normalizedQuery) &&
      !matchesQuery(task.description, normalizedQuery)
    ) {
      continue;
    }

    results.push({
      id: task.id,
      kind: "task",
      title: task.title,
      snippet: makeSnippet(task.description || task.title),
      updatedAt: task.updatedAt,
      taskStatus: task.status,
    });
  }

  for (const entry of entries) {
    if (entry.type === "daily") {
      continue;
    }

    if (
      !matchesQuery(entry.title, normalizedQuery) &&
      !matchesQuery(entry.contentMarkdown, normalizedQuery)
    ) {
      continue;
    }

    results.push({
      id: entry.id,
      kind: "entry",
      title: entry.title,
      snippet: makeSnippet(entry.contentMarkdown || entry.title),
      updatedAt: entry.updatedAt,
      entryType: entry.type,
    });
  }

  for (const log of taskLogs) {
    results.push({
      id: log.id,
      kind: "task_log",
      title: log.taskTitle,
      snippet: makeSnippet(log.body),
      updatedAt: log.createdAt,
      taskId: log.taskId,
    });
  }

  return results.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function getSearchResultTargetView(result: SearchResult): AppView {
  if (result.kind === "inbox") {
    return "inbox";
  }

  if (result.kind === "task") {
    return "tasks";
  }

  if (result.kind === "task_log") {
    return "log";
  }

  switch (result.entryType) {
    case "task_progress":
      return "today";
    case "note":
    default:
      return "notes";
  }
}
