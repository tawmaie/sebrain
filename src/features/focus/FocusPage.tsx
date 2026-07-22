import { useEffect, useState } from "react";
import type { SessionType } from "../../types/pomodoro";
import type { Task } from "../../types/task";
import type { Entry } from "../../types/entry";
import { listTasks } from "../../repositories/taskRepository";
import { listEntries } from "../../repositories/entryRepository";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { PomodoroTimer } from "./PomodoroTimer";
import type { usePomodoro } from "../../hooks/usePomodoro";
import {
  field,
  input as inputClass,
  panelHeader,
  panelTitle,
} from "../../lib/ui";

type PomodoroApi = ReturnType<typeof usePomodoro>;

interface FocusPageProps {
  pomodoro: PomodoroApi;
}

export function FocusPage({ pomodoro }: FocusPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Entry[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const [taskRows, noteRows] = await Promise.all([
          listTasks(),
          listEntries({ type: "note" }),
        ]);
        setTasks(taskRows.filter((task) => task.status !== "done"));
        setNotes(noteRows);
      } catch (err) {
        setMetaError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  const locked = pomodoro.status === "running" || pomodoro.status === "paused";
  const selectedTask = tasks.find((task) => task.id === pomodoro.taskId);

  return (
    <div className="h-full min-h-0 overflow-auto p-6">
      <div className={panelHeader}>
        <h2 className={panelTitle}>Focus</h2>
      </div>

      {!pomodoro.ready ? <LoadingState label="กำลังกู้สถานะ Timer..." /> : null}
      {pomodoro.error ? <ErrorMessage message={pomodoro.error} /> : null}

      <div className="mb-5 grid grid-cols-[1.2fr_1fr] gap-4 max-[1100px]:grid-cols-1">
        <PomodoroTimer
          remainingSeconds={pomodoro.remainingSeconds}
          durationSeconds={pomodoro.durationSeconds}
          sessionType={pomodoro.sessionType}
          status={pomodoro.status}
          taskLabel={selectedTask?.title ?? null}
          onStart={() => void pomodoro.start()}
          onPause={() => void pomodoro.pause()}
          onResume={() => void pomodoro.resume()}
          onReset={() => void pomodoro.reset()}
          onFinishEarly={() => void pomodoro.finishEarly()}
        />

        <div className="rounded-none border-0 border-t border-border bg-transparent pt-4">
          <label className={field}>
            <span>โหมด</span>
            <select
              className={inputClass}
              value={pomodoro.sessionType}
              disabled={locked}
              onChange={(event) =>
                pomodoro.applySessionType(event.target.value as SessionType)
              }
            >
              <option value="focus">Focus</option>
              <option value="short_break">Short break</option>
              <option value="long_break">Long break</option>
            </select>
          </label>

          <label className={field}>
            <span>งาน (ไม่บังคับ)</span>
            <select
              className={inputClass}
              value={pomodoro.taskId ?? ""}
              disabled={locked || loadingMeta}
              onChange={(event) =>
                pomodoro.setTaskId(event.target.value || null)
              }
            >
              <option value="">ไม่ผูกกับงาน</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          <label className={field}>
            <span>โน้ต (ไม่บังคับ)</span>
            <select
              className={inputClass}
              value={pomodoro.noteId ?? ""}
              disabled={locked || loadingMeta}
              onChange={(event) =>
                pomodoro.setNoteId(event.target.value || null)
              }
            >
              <option value="">ไม่ผูกกับโน้ต</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
          </label>

          {metaError ? (
            <p className="mt-2 mb-0 text-xs text-danger">{metaError}</p>
          ) : null}
        </div>
      </div>

      <section className="rounded-none border-0 border-t border-border bg-transparent pt-4">
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-text-secondary uppercase">
          ประวัติล่าสุด
        </h3>
        {pomodoro.sessions.length === 0 ? (
          <p className="m-0 text-xs text-text-secondary">ยังไม่มีรอบโฟกัส</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {pomodoro.sessions.map((session) => (
              <li
                key={session.id}
                className="grid grid-cols-[1fr_1fr_1.4fr] gap-2 border-b border-border py-2 text-[13px] last:border-b-0"
              >
                <span>{session.sessionType.replace("_", " ")}</span>
                <span>{session.status}</span>
                <span>{new Date(session.startedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
