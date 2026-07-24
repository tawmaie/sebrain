import type { Project } from "../../types/project";

interface ProjectBadgeProps {
  project: Project | null;
}

export function ProjectBadge({ project }: ProjectBadgeProps) {
  if (!project) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
      <span
        className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: project.color }}
        aria-hidden="true"
      />
      {project.name}
    </span>
  );
}
