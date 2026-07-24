export const PROJECT_COLORS = [
  "#000000",
  "#6366f1",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
] as const;

export type ProjectColor = (typeof PROJECT_COLORS)[number];

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  name: string;
  color?: string;
}
