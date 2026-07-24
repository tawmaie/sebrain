import { useEffect, useState } from "react";
import type { Project } from "../../types/project";
import { updateProject } from "../../repositories/projectRepository";
import { ProjectColorField } from "../../components/common/ProjectColorPicker";
import { btn, btnDanger, btnPrimary, cn, field, input as inputClass } from "../../lib/ui";

interface ProjectListItemProps {
  project: Project;
  onUpdated: () => Promise<void>;
  onDeleted: () => Promise<void>;
}

export function ProjectListItem({
  project,
  onUpdated,
  onDeleted,
}: ProjectListItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState(project.color);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setName(project.name);
      setColor(project.color);
      setError(null);
    }
  }, [project, editing]);

  const cancelEdit = () => {
    setName(project.name);
    setColor(project.color);
    setError(null);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-card border border-border bg-surface-muted p-3">
        <label className={cn(field, "mb-3")}>
          <span>ชื่อ project</span>
          <input
            type="text"
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="mb-3">
          <ProjectColorField value={color} onChange={setColor} />
        </div>

        {error ? <p className="mb-3 text-xs text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btnPrimary}
            disabled={saving || !name.trim()}
            onClick={() => {
              void (async () => {
                setSaving(true);
                setError(null);
                try {
                  await updateProject(project.id, { name, color });
                  await onUpdated();
                  setEditing(false);
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                } finally {
                  setSaving(false);
                }
              })();
            }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            className={btn}
            disabled={saving}
            onClick={cancelEdit}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border px-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <span
          className="inline-block h-[10px] w-[10px] shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
          aria-hidden="true"
        />
        <span className="truncate">{project.name}</span>
      </span>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => setEditing(true)}
        >
          แก้ไข
        </button>
        <button
          type="button"
          className={btnDanger}
          disabled={deleting}
          onClick={() => {
            void (async () => {
              setDeleting(true);
              try {
                await onDeleted();
              } finally {
                setDeleting(false);
              }
            })();
          }}
        >
          {deleting ? "กำลังลบ..." : "ลบ"}
        </button>
      </div>
    </div>
  );
}
