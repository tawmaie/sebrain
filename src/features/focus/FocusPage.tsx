import { useEffect, useState } from "react";
import type { SessionType } from "../../types/pomodoro";
import type { Task } from "../../types/task";
import type { Note } from "../../types/note";
import { listTasks } from "../../repositories/taskRepository";
import { listNotes } from "../../repositories/noteRepository";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { PomodoroTimer } from "./PomodoroTimer";
import type { usePomodoro } from "../../hooks/usePomodoro";

type PomodoroApi = ReturnType<typeof usePomodoro>;

interface FocusPageProps {
  pomodoro: PomodoroApi;
}

export function FocusPage({ pomodoro }: FocusPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const [taskRows, noteRows] = await Promise.all([
          listTasks(),
          listNotes(),
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
    <div className="panel-single focus-page">
      <div className="panel-header">
        <h2>Focus</h2>
      </div>

      {!pomodoro.ready ? <LoadingState label="กำลังกู้สถานะ Timer..." /> : null}
      {pomodoro.error ? <ErrorMessage message={pomodoro.error} /> : null}

      <div className="focus-layout">
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

        <div className="focus-options">
          <label className="field">
            <span>โหมด</span>
            <select
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

          <label className="field">
            <span>งาน (ไม่บังคับ)</span>
            <select
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

          <label className="field">
            <span>โน้ต (ไม่บังคับ)</span>
            <select
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

          {metaError ? <p className="inline-error">{metaError}</p> : null}
        </div>
      </div>

      <section className="session-history">
        <h3>ประวัติล่าสุด</h3>
        {pomodoro.sessions.length === 0 ? (
          <p className="muted">ยังไม่มีรอบโฟกัส</p>
        ) : (
          <ul className="session-list">
            {pomodoro.sessions.map((session) => (
              <li key={session.id}>
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
