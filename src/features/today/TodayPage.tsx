import { useCallback, useEffect, useMemo, useState } from "react";
import "./TodayPage.css";
import type { Task } from "../../types/task";
import type { Note } from "../../types/note";
import {
  countFocusSessionsToday,
  getTodayTaskStats,
  listTasks,
  updateTask,
} from "../../repositories/taskRepository";
import { getFocusMinutesToday } from "../../repositories/pomodoroRepository";
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
  const [todayStats, setTodayStats] = useState<{ done: number; total: number }>(
    { done: 0, total: 0 },
  );
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [focusCapture, setFocusCapture] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [doingTasks, todayTasks, count, notes, stats, minutes] =
        await Promise.all([
          listTasks("doing"),
          listTasks("today"),
          countFocusSessionsToday(),
          listNotes(),
          getTodayTaskStats(),
          getFocusMinutesToday(),
        ]);

      setDoing(doingTasks);
      setToday(todayTasks);
      setFocusCount(count);
      setRecentNotes(notes.slice(0, 3));
      setTodayStats(stats);
      setFocusMinutes(minutes);
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

      const timeoutId = window.setTimeout(() => {
        setFocusCapture(false);
      }, 300);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [captureRequestId]);

  const selectedTask = useMemo(
    () => doing.find((task) => task.id === pomodoro.taskId),
    [doing, pomodoro.taskId],
  );

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  const changeTaskStatus = async (
    taskId: Task["id"],
    status: "doing" | "done",
  ) => {
    setUpdatingTaskId(taskId);

    try {
      await updateTask(taskId, { status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="today-page">
      <header className="today-header">
        <div>
          <p className="today-header-eyebrow">{currentDate}</p>
          <h1>วันนี้</h1>
          <p className="today-header-description">
            เลือกงานสำคัญ แล้วค่อย ๆ ทำให้เสร็จทีละเรื่อง
          </p>
        </div>

        <div className="focus-stat-card" aria-label={`โฟกัสแล้ว ${focusCount} รอบ`}>
          <span className="focus-stat-label">Focus วันนี้</span>
          <div className="focus-stat-value">
            <strong>{focusCount}</strong>
            <span>รอบ</span>
          </div>
        </div>
      </header>

      <section className="quick-capture-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">QUICK CAPTURE</p>
            <h2>มีอะไรอยู่ในหัวไหม?</h2>
          </div>
          <span className="keyboard-hint">Enter เพื่อบันทึก</span>
        </div>

        <QuickCapture
          autoFocus={focusCapture}
          placeholder="พิมพ์งาน ไอเดีย หรือสิ่งที่ต้องจำ..."
          onSubmit={async (content) => {
            await createInboxItem(content);
          }}
        />
      </section>

      {loading ? (
        <div className="today-state-card">
          <LoadingState />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="today-state-card">
          <ErrorMessage message={error} onRetry={() => void load()} />
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="today-main-grid">
            <section className="dashboard-card focus-card">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">CURRENT FOCUS</p>
                  <h2>ช่วงเวลาโฟกัส</h2>
                </div>

                <span
                  className={`timer-status-badge timer-status-${pomodoro.status}`}
                >
                  {pomodoro.status === "running"
                    ? "กำลังโฟกัส"
                    : pomodoro.status === "paused"
                      ? "หยุดชั่วคราว"
                      : "พร้อมเริ่ม"}
                </span>
              </div>

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

            <section className="dashboard-card doing-card">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">IN PROGRESS</p>
                  <h2>กำลังทำ</h2>
                </div>

                <span className="item-count">{doing.length}</span>
              </div>

              {doing.length === 0 ? (
                <EmptyState title="ยังไม่มีงานที่กำลังทำ" compact />
              ) : (
                <div className="task-list">
                  {doing.map((task) => {
                    const isSelected = task.id === pomodoro.taskId;
                    const isUpdating = updatingTaskId === task.id;

                    return (
                      <article
                        key={task.id}
                        className={`task-item ${
                          isSelected ? "task-item-active" : ""
                        }`}
                      >
                        <div className="task-item-content">
                          <div className="task-title-row">
                            <span
                              className="task-status-indicator task-status-doing"
                              aria-hidden="true"
                            />
                            <h3>{task.title}</h3>
                          </div>

                          <div className="task-progress-row">
                            <div
                              className="task-progress"
                              aria-label={`${task.completedPomodoros} จาก ${task.estimatedPomodoros} รอบ`}
                            >
                              <span
                                style={{
                                  width: `${
                                    task.estimatedPomodoros > 0
                                      ? Math.min(
                                          (task.completedPomodoros /
                                            task.estimatedPomodoros) *
                                            100,
                                          100,
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>

                            <span className="task-progress-label">
                              {task.completedPomodoros}/
                              {task.estimatedPomodoros} รอบ
                            </span>
                          </div>

                          {isSelected ? (
                            <span className="active-focus-label">
                              กำลังใช้กับตัวจับเวลา
                            </span>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          className="task-action task-action-complete"
                          disabled={isUpdating}
                          onClick={() => {
                            void changeTaskStatus(task.id, "done");
                          }}
                        >
                          {isUpdating ? "กำลังบันทึก..." : "เสร็จแล้ว"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-card today-tasks-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">TODAY TASKS</p>
                <h2>งานของวันนี้</h2>
              </div>

              <span className="item-count">{today.length}</span>
            </div>

            {today.length === 0 ? (
              <EmptyState title="ยังไม่มีงานที่ตั้งไว้สำหรับวันนี้" compact />
            ) : (
              <div className="today-task-list">
                {today.map((task, index) => {
                  const isUpdating = updatingTaskId === task.id;

                  return (
                    <article key={task.id} className="today-task-item">
                      <div className="today-task-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="today-task-content">
                        <h3>{task.title}</h3>

                        {task.estimatedPomodoros > 0 ? (
                          <p>
                            ประมาณ {task.estimatedPomodoros} รอบโฟกัส
                          </p>
                        ) : (
                          <p>ยังไม่ได้กำหนดเวลาประมาณการ</p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="task-action task-action-primary"
                        disabled={isUpdating}
                        onClick={() => {
                          void changeTaskStatus(task.id, "doing");
                        }}
                      >
                        {isUpdating ? "กำลังเริ่ม..." : "เริ่มทำ"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {todayStats.total > 0 ? (
            <section className="today-progress-card dashboard-card">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">PROGRESS</p>
                  <h2>วันนี้คืบหน้า</h2>
                </div>
                <span className="progress-task-label">
                  {todayStats.done} / {todayStats.total} งาน
                </span>
              </div>

              <div
                className="progress-bar-track"
                aria-label={`เสร็จแล้ว ${todayStats.done} จาก ${todayStats.total} งาน`}
              >
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.round((todayStats.done / todayStats.total) * 100)}%`,
                  }}
                />
              </div>

              <div className="progress-meta">
                <span>{focusCount} รอบโฟกัส</span>
                <span className="progress-meta-dot" aria-hidden="true" />
                <span>
                  {focusMinutes >= 60
                    ? `${Math.floor(focusMinutes / 60)} ชม. ${focusMinutes % 60} นาที`
                    : `${focusMinutes} นาที`}
                </span>
              </div>
            </section>
          ) : null}

          {recentNotes.length > 0 ? (
            <section className="recent-notes-section">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">RECENT NOTES</p>
                  <h2>โน้ตล่าสุด</h2>
                </div>
              </div>

              <div className="notes-grid">
                {recentNotes.map((note) => (
                  <article key={note.id} className="note-card">
                    <div className="note-card-icon" aria-hidden="true">
                      N
                    </div>

                    <div>
                      <h3>{note.title}</h3>
                      <p>
                        อัปเดต{" "}
                        {new Intl.DateTimeFormat("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(note.updatedAt))}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}