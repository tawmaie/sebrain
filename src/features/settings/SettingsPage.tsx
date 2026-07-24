import { useEffect, useState } from "react";
import type { AppSettings } from "../../types/settings";
import type { Project } from "../../types/project";
import { PROJECT_COLORS } from "../../types/project";
import { ProjectColorField } from "../../components/common/ProjectColorPicker";
import { getSettings, saveSettings } from "../../repositories/settingsRepository";
import {
  createProject,
  deleteProject,
  listProjects,
} from "../../repositories/projectRepository";
import { ProjectListItem } from "./ProjectListItem";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import {
  btn,
  btnPrimary,
  cn,
  field,
  input as inputClass,
  panelHeader,
  panelTitle,
} from "../../lib/ui";

interface SettingsPageProps {
  onSaved?: () => void;
}

export function SettingsPage({ onSaved }: SettingsPageProps) {
  const [form, setForm] = useState<AppSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState<string>(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const loadProjects = async () => {
    const data = await listProjects();
    setProjects(data);
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [settings, projectData] = await Promise.all([
          getSettings(),
          listProjects(),
        ]);
        setForm(settings);
        setProjects(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <LoadingState label="กำลังโหลดการตั้งค่า..." />;
  }

  if (error && !form) {
    return <ErrorMessage message={error} />;
  }

  if (!form) {
    return null;
  }

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <div className={panelHeader}>
        <h2 className={panelTitle}>Settings</h2>
        {savedAt ? (
          <span className="m-0 text-xs text-text-secondary">
            บันทึกแล้ว {new Date(savedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      <section className="border-t border-border pt-4">
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          ระยะเวลา Pomodoro
        </h3>
        <label className={field}>
          <span>Focus (วินาที)</span>
          <input
            type="number"
            className={inputClass}
            min={1}
            value={form.focusDurationSeconds}
            onChange={(event) =>
              setForm({
                ...form,
                focusDurationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label className={field}>
          <span>Short break (วินาที)</span>
          <input
            type="number"
            className={inputClass}
            min={1}
            value={form.shortBreakDurationSeconds}
            onChange={(event) =>
              setForm({
                ...form,
                shortBreakDurationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label className={field}>
          <span>Long break (วินาที)</span>
          <input
            type="number"
            className={inputClass}
            min={1}
            value={form.longBreakDurationSeconds}
            onChange={(event) =>
              setForm({
                ...form,
                longBreakDurationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label className={field}>
          <span>ทำ Long break ทุก ๆ กี่รอบ</span>
          <input
            type="number"
            className={inputClass}
            min={1}
            value={form.longBreakInterval}
            onChange={(event) =>
              setForm({
                ...form,
                longBreakInterval: Number(event.target.value),
              })
            }
          />
        </label>
      </section>

      <section className="border-t border-border pt-4">
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          Projects
        </h3>

        {projects.length > 0 ? (
          <div className="mb-4 flex flex-col gap-2">
            {projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                onUpdated={loadProjects}
                onDeleted={async () => {
                  try {
                    await deleteProject(project.id);
                    if (form.defaultProjectId === project.id) {
                      setForm({ ...form, defaultProjectId: null });
                    }
                    await loadProjects();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                    throw err;
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-text-secondary">
            ยังไม่มี project — เพิ่มด้านล่างเพื่อจัดกลุ่มงาน
          </p>
        )}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)_auto] lg:items-end">
          <label className={cn(field, "mb-0 sm:col-span-2 lg:col-span-1")}>
            <span>ชื่อ project ใหม่</span>
            <input
              type="text"
              className={inputClass}
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
              placeholder="เช่น SeBrain, งานบ้าน"
            />
          </label>

          <div className="mb-0 sm:col-span-2 lg:col-span-1">
            <ProjectColorField
              value={newProjectColor}
              onChange={setNewProjectColor}
            />
          </div>

          <button
            type="button"
            className={cn(btn, "w-full sm:col-span-2 lg:col-span-1 lg:w-auto")}
            disabled={projectSaving || !newProjectName.trim()}
            onClick={() => {
              void (async () => {
                setProjectSaving(true);
                setError(null);
                try {
                  await createProject({
                    name: newProjectName,
                    color: newProjectColor,
                  });
                  setNewProjectName("");
                  await loadProjects();
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                } finally {
                  setProjectSaving(false);
                }
              })();
            }}
          >
            {projectSaving ? "กำลังเพิ่ม..." : "เพิ่ม project"}
          </button>
        </div>

        <label className={field}>
          <span>Default project สำหรับงานใหม่</span>
          <select
            className={inputClass}
            value={form.defaultProjectId ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                defaultProjectId: event.target.value || null,
              })
            }
          >
            <option value="">ไม่กำหนด</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="border-t border-border pt-4">
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          พฤติกรรม
        </h3>
        <label className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.autoStartBreak}
            onChange={(event) =>
              setForm({ ...form, autoStartBreak: event.target.checked })
            }
          />
          <span>เริ่ม Break ต่อโดยอัตโนมัติ</span>
        </label>
        <label className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.notificationEnabled}
            onChange={(event) =>
              setForm({ ...form, notificationEnabled: event.target.checked })
            }
          />
          <span>เปิดการแจ้งเตือน</span>
        </label>
      </section>

      {error ? <p className="mt-2 mb-0 text-xs text-danger">{error}</p> : null}

      <button
        type="button"
        className={btnPrimary}
        disabled={saving}
        onClick={() => {
          void (async () => {
            setSaving(true);
            setError(null);
            try {
              const saved = await saveSettings(form);
              setForm(saved);
              setSavedAt(new Date().toISOString());
              onSaved?.();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setSaving(false);
            }
          })();
        }}
      >
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}
