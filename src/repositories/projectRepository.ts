import type { Project, ProjectInput } from "../types/project";
import { normalizeProjectColor } from "../lib/projectColor";
import { getDatabase } from "../services/database";

interface ProjectRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Project name cannot be empty");
  }
  return trimmed;
}

function validateColor(color: string | undefined): string {
  return normalizeProjectColor(color);
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDatabase();
  const rows = await db.select<ProjectRow[]>(
    `SELECT id, name, color, created_at, updated_at
     FROM projects
     ORDER BY name ASC`,
  );
  return rows.map(mapRow);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getDatabase();
  const rows = await db.select<ProjectRow[]>(
    `SELECT id, name, color, created_at, updated_at
     FROM projects WHERE id = $1`,
    [id],
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    name: validateName(input.name),
    color: validateColor(input.color),
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO projects (id, name, color, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [project.id, project.name, project.color, project.createdAt, project.updatedAt],
  );

  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<ProjectInput>,
): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) {
    throw new Error("Project not found");
  }

  const updated: Project = {
    ...existing,
    name: patch.name !== undefined ? validateName(patch.name) : existing.name,
    color: patch.color !== undefined ? validateColor(patch.color) : existing.color,
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.execute(
    `UPDATE projects SET name = $1, color = $2, updated_at = $3 WHERE id = $4`,
    [updated.name, updated.color, updated.updatedAt, updated.id],
  );

  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("UPDATE tasks SET project_id = NULL WHERE project_id = $1", [
    id,
  ]);
  await db.execute("DELETE FROM projects WHERE id = $1", [id]);
}

export async function countTasksByProject(): Promise<
  Array<{ projectId: string | null; count: number }>
> {
  const db = await getDatabase();
  const rows = await db.select<Array<{ project_id: string | null; count: number }>>(
    `SELECT project_id, COUNT(*) as count
     FROM tasks
     GROUP BY project_id`,
  );
  return rows.map((row) => ({
    projectId: row.project_id,
    count: row.count,
  }));
}
