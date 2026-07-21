import { useCallback, useEffect, useState } from "react";
import type { Task } from "../../types/task";
import type { Note } from "../../types/note";
import {
  countFocusSessionsToday,
  listTasks,
  updateTask,
} from "../../repositories/taskRepository";
import { listNotes } from "../../repositories/noteRepository";
import { createInboxItem } from "../../repositories/inboxRepository";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { QuickCapture } from "../inbox/QuickCapture";
import { PomodoroTimer } from "../focus/PomodoroTimer";
import type { usePomodoro } from "../../hooks/usePomodoro";

type PomodoroApi = ReturnType<typeof usePomodoro>;

interface TodayPageProps {
  pomodoro: PomodoroApi;
  captureRequestId: number;
}

export function TodayPage({ pomodoro, captureRequestId }: TodayPageProps) {
  const [doing, setDoing] = useState<Task[]>([]);
  const [today, setToday] = useState<Task[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [focusCount, setFocusCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusCapture, setFocusCapture] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [doingTasks, todayTasks, count, notes] = await Promise.all([
        listTasks("doing"),
        listTasks("today"),
        countFocusSessionsToday(),
        listNotes(),
      ]);
      setDoing(doingTasks);
      setToday(todayTasks);
      setFocusCount(count);
      setRecentNotes(notes.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (captureRequestId > 0) {
      setFocusCapture(true);
    }
  }, [captureRequestId]);

  const selectedTask = doing.find((task) => task.id === pomodoro.taskId);

  return (
    <div className="panel-single today-page">
      <div className="panel-header">
        <h2>Today</h2>
      </div>

      {/* 1. Quick Capture */}
      <QuickCapture
        autoFocus={focusCapture}
        placeholder="พิมพ์สิ่งที่คิดไว้... กด Enter เพื่อบันทึก"
        onSubmit={async (content) => {
          await createInboxItem(content);
        }}
      />

      {loading ? <LoadingState /> : null}
      {!loading && error ? (
        <ErrorMessage message={error} onRetry={() => void load()} />
      ) : null}

      {/* 2. Current Focus / Doing */}
      <div className="today-grid">
        <section className="card-section">
          <h3>กำลังโฟกัส</h3>
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
        </section>

        <section className="card-section">
          <h3>กำลังทำ</h3>
          {!loading && !error && doing.length === 0 ? (
            <EmptyState title="ยังไม่มีงานที่กำลังทำ" compact />
          ) : null}
          <div className="list-stack">
            {doing.map((task) => (
              <div key={task.id} className="list-row">
                <div className="list-row-main">
                  <p className="list-row-title">
                    <span
                      className="status-dot status-doing"
                      aria-hidden="true"
                    />
                    {task.title}
                  </p>
                  <p className="list-row-meta">
                    {task.completedPomodoros}/{task.estimatedPomodoros} focus
                    sessions
                  </p>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    void (async () => {
                      await updateTask(task.id, { status: "done" });
                      await load();
                    })();
                  }}
                >
                  เสร็จแล้ว
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. Today Tasks */}
      <section className="card-section today-tasks-section">
        <h3>งานของวันนี้</h3>
        {!loading && !error && today.length === 0 ? (
          <EmptyState title="ยังไม่มีงานที่ตั้งไว้สำหรับวันนี้" compact />
        ) : null}
        <div className="list-stack">
          {today.map((task) => (
            <div key={task.id} className="list-row">
              <div className="list-row-main">
                <p className="list-row-title">
                  <span
                    className="status-dot status-today"
                    aria-hidden="true"
                  />
                  {task.title}
                </p>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  void (async () => {
                    await updateTask(task.id, { status: "doing" });
                    await load();
                  })();
                }}
              >
                เริ่มทำ
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Focus summary today */}
      <div className="today-summary">
        <span>โฟกัสวันนี้ไปแล้ว</span>
        <strong>{focusCount}</strong>
        <span>รอบ</span>
      </div>

      {/* 5. Recent notes (if there is space) */}
      {recentNotes.length > 0 ? (
        <section className="card-section">
          <h3>โน้ตล่าสุด</h3>
          <div className="list-stack">
            {recentNotes.map((note) => (
              <div key={note.id} className="list-row">
                <div className="list-row-main">
                  <p className="list-row-title">{note.title}</p>
                  <p className="list-row-meta">
                    อัปเดต {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
