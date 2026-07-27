import { useCallback, useEffect, useMemo, useState } from "react";
import type { Entry } from "../../types/entry";
import type { Task, TaskStatus } from "../../types/task";
import {
  countFocusSessionsToday,
  createTask,
  deleteTask,
  getTodayTaskStats,
  listTasks,
  updateTask,
} from "../../repositories/taskRepository";
import { getFocusMinutesToday } from "../../repositories/pomodoroRepository";
import { listEntries } from "../../repositories/entryRepository";
import { createInboxItem } from "../../repositories/inboxRepository";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingState } from "../../components/common/LoadingState";
import { QuickCapture } from "../inbox/QuickCapture";
import { PomodoroTimer } from "../focus/PomodoroTimer";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import type { usePomodoro } from "../../hooks/usePomodoro";
import { btnPrimary, cn, field, input as inputClass } from "../../lib/ui";

type PomodoroApi = ReturnType<typeof usePomodoro>;

interface TodayPageProps {
  pomodoro: PomodoroApi;
  captureRequestId: number;
}

export function TodayPage({ pomodoro, captureRequestId }: TodayPageProps) {
  const [doing, setDoing] = useState<Task[]>([]);
  const [today, setToday] = useState<Task[]>([]);
  const [recentNotes, setRecentNotes] = useState<Entry[]>([]);
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [doingTasks, todayTasks, count, notes, stats, minutes] =
        await Promise.all([
          listTasks("doing"),
          listTasks("today"),
          countFocusSessionsToday(),
          listEntries({ type: "note" }),
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
    if (!pomodoro.lastCompletedAt) {
      return;
    }
    void load();
  }, [pomodoro.lastCompletedAt, load]);

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

  const allTasks = useMemo(() => [...doing, ...today], [doing, today]);

  const selectedTask = useMemo(
    () => allTasks.find((task) => task.id === selectedTaskId) ?? null,
    [allTasks, selectedTaskId],
  );

  const focusTask = useMemo(
    () => allTasks.find((task) => task.id === pomodoro.taskId),
    [allTasks, pomodoro.taskId],
  );

  const timerLocked =
    pomodoro.status === "running" ||
    pomodoro.status === "paused" ||
    pomodoro.status === "overtime";

  const selectFocusTask = (taskId: string) => {
    if (timerLocked) {
      return;
    }
    pomodoro.setTaskId(taskId);
  };

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  const openTaskDrawer = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDrawerOpen(true);
  };

  const closeTaskDrawer = () => {
    setDrawerOpen(false);
  };

  const changeTaskStatus = async (
    taskId: Task["id"],
    status: Extract<TaskStatus, "today" | "doing" | "done">,
  ) => {
    setUpdatingTaskId(taskId);

    try {
      await updateTask(taskId, { status });

      if (status === "doing") {
        pomodoro.setTaskId(taskId);
      } else if (pomodoro.taskId === taskId) {
        pomodoro.setTaskId(null);
      }

      await load();

      if (status === "done" && selectedTaskId === taskId) {
        closeTaskDrawer();
        setSelectedTaskId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAddTask = async () => {
    setCreatingTask(true);
    setError(null);

    try {
      const created = await createTask({
        title: "งานใหม่",
        status: "today",
      });
      await load();
      openTaskDrawer(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (pomodoro.taskId === taskId) {
        pomodoro.setTaskId(null);
      }

      await deleteTask(taskId);
      closeTaskDrawer();
      setSelectedTaskId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleTaskUpdated = (updated: Task) => {
    setDoing((current) =>
      current.map((task) => (task.id === updated.id ? updated : task)),
    );
    setToday((current) =>
      current.map((task) => (task.id === updated.id ? updated : task)),
    );
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-col gap-6 overflow-auto p-6 max-[640px]:gap-4 max-[640px]:p-4">
      <header className="flex items-start justify-between gap-6 max-[640px]:flex-col max-[640px]:items-stretch">
        <div>
          <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
            {currentDate}
          </p>
          <h1 className="m-0 text-[clamp(30px,4vw,42px)] leading-[1.1] tracking-[-0.04em] text-text-primary">
            วันนี้
          </h1>
          <p className="mt-2 mb-0 text-[15px] text-text-secondary">
            เลือกงานสำคัญ แล้วค่อย ๆ ทำให้เสร็จทีละเรื่อง
          </p>
        </div>

        <div
          className="zebra-surface min-w-[150px] rounded-card border border-border px-5 py-4 max-[640px]:min-w-0"
          aria-label={`โฟกัสแล้ว ${focusCount} รอบ`}
        >
          <span className="mb-1 block text-xs text-text-secondary">
            Focus วันนี้
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="text-[30px] leading-none text-text-primary">
              {focusCount}
            </strong>
            <span className="text-[13px] text-text-secondary">รอบ</span>
          </div>
        </div>
      </header>

      <section className="rounded-modal border border-text-primary bg-surface p-5 shadow-[4px_4px_0_var(--color-text-primary)] max-[640px]:rounded-modal max-[640px]:p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
              QUICK CAPTURE
            </p>
            <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
              มีอะไรอยู่ในหัวไหม?
            </h2>
          </div>
          <span className="rounded-button border border-border bg-bg px-2 py-1.5 text-[11px] text-text-secondary max-[640px]:hidden">
            Enter เพื่อบันทึก
          </span>
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
        <div className="rounded-modal border border-border bg-surface p-6">
          <LoadingState />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-modal border border-border bg-surface p-6">
          <ErrorMessage message={error} onRetry={() => void load()} />
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] items-stretch gap-5 max-[1024px]:grid-cols-1">
            <section className="min-h-[390px] rounded-modal border border-border bg-[linear-gradient(145deg,rgba(0,0,0,0.025),transparent_45%),var(--color-surface)] p-5 max-[1024px]:min-h-0">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                    CURRENT FOCUS
                  </p>
                  <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
                    ช่วงเวลาโฟกัส
                  </h2>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    pomodoro.status === "running" &&
                      "bg-accent-soft text-success",
                    pomodoro.status === "overtime" &&
                      "bg-[#fef3c7] text-[#b45309]",
                    pomodoro.status === "paused" &&
                      "bg-[#fef3c7] text-[#92400e]",
                    pomodoro.status === "idle" &&
                      "bg-surface-muted text-text-secondary",
                  )}
                >
                  {pomodoro.status === "running"
                    ? "กำลังโฟกัส"
                    : pomodoro.status === "overtime"
                      ? "เกินเวลาแล้ว"
                      : pomodoro.status === "paused"
                        ? "หยุดชั่วคราว"
                        : "พร้อมเริ่ม"}
                </span>
              </div>

              <PomodoroTimer
                remainingSeconds={pomodoro.remainingSeconds}
                overtimeSeconds={pomodoro.overtimeSeconds}
                durationSeconds={pomodoro.durationSeconds}
                sessionType={pomodoro.sessionType}
                status={pomodoro.status}
                taskLabel={focusTask?.title ?? null}
                onStart={() => void pomodoro.start()}
                onPause={() => void pomodoro.pause()}
                onResume={() => void pomodoro.resume()}
                onReset={() => void pomodoro.reset()}
                onFinishEarly={() => void pomodoro.finishEarly()}
              />

              <label className={cn(field, "mb-0 mt-4")}>
                <span className="text-xs font-medium text-text-secondary">
                  งานที่โฟกัส
                </span>
                <select
                  className={inputClass}
                  value={pomodoro.taskId ?? ""}
                  disabled={timerLocked}
                  onChange={(event) =>
                    pomodoro.setTaskId(event.target.value || null)
                  }
                >
                  <option value="">ไม่ผูกกับงาน</option>
                  {allTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="min-h-[390px] rounded-modal border border-border bg-surface p-5 max-[1024px]:min-h-0">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                    IN PROGRESS
                  </p>
                  <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
                    กำลังทำ
                  </h2>
                </div>

                <span className="inline-grid h-[30px] min-w-[30px] place-items-center rounded-full bg-surface-muted px-2 text-xs font-bold text-text-primary">
                  {doing.length}
                </span>
              </div>

              {doing.length === 0 ? (
                <EmptyState title="ยังไม่มีงานที่กำลังทำ" compact />
              ) : (
                <div className="flex flex-col gap-2">
                  {doing.map((task) => {
                    const isSelected = task.id === pomodoro.taskId;
                    const isUpdating = updatingTaskId === task.id;

                    return (
                      <article
                        key={task.id}
                        className={cn(
                          "flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)] max-[640px]:flex-col max-[640px]:items-stretch",
                          isSelected &&
                            "border-text-primary shadow-[inset_3px_0_0_var(--color-text-primary)]",
                          !timerLocked && "cursor-pointer",
                        )}
                        onClick={() => selectFocusTask(task.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectFocusTask(task.id);
                          }
                        }}
                        role="button"
                        tabIndex={timerLocked ? -1 : 0}
                        aria-pressed={isSelected}
                        aria-label={`เลือกโฟกัสกับงาน ${task.title}`}
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTaskDrawer(task.id);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_0_4px_var(--color-accent-soft)]"
                              aria-hidden="true"
                            />
                            <h3 className="m-0 text-sm font-semibold">
                              {task.title}
                            </h3>
                          </div>

                          {task.description ? (
                            <p className="mt-1 mb-0 line-clamp-2 text-xs text-text-secondary">
                              {task.description}
                            </p>
                          ) : null}

                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
                              aria-label={`${task.completedPomodoros} จาก ${task.estimatedPomodoros} รอบ`}
                            >
                              <span
                                className="block h-full rounded-full bg-accent transition-[width] duration-[350ms]"
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

                            <span className="shrink-0 text-xs text-text-secondary">
                              {task.completedPomodoros}/
                              {task.estimatedPomodoros} รอบ
                            </span>
                          </div>

                          {isSelected ? (
                            <span className="mt-1 block text-xs text-success">
                              กำลังใช้กับตัวจับเวลา
                            </span>
                          ) : null}
                        </button>

                        <div className="flex shrink-0 gap-2 max-[640px]:w-full">
                          <button
                            type="button"
                            className="min-h-9 rounded-button border border-border bg-surface px-3 text-xs font-semibold text-text-primary transition-[border-color,background-color] duration-[120ms] hover:border-border-strong active:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 max-[640px]:flex-1"
                            disabled={isUpdating}
                            onClick={(event) => {
                              event.stopPropagation();
                              void changeTaskStatus(task.id, "today");
                            }}
                          >
                            {isUpdating ? "กำลังบันทึก..." : "พักไว้"}
                          </button>
                          <button
                            type="button"
                            className="min-h-9 rounded-button border border-border bg-surface px-3 text-xs font-semibold text-text-primary transition-[border-color,background-color] duration-[120ms] hover:border-border-strong active:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 max-[640px]:flex-1"
                            disabled={isUpdating}
                            onClick={(event) => {
                              event.stopPropagation();
                              void changeTaskStatus(task.id, "done");
                            }}
                          >
                            เสร็จแล้ว
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <section className="rounded-modal border border-border bg-surface p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                  TODAY TASKS
                </p>
                <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
                  งานของวันนี้
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={creatingTask}
                  onClick={() => void handleAddTask()}
                >
                  {creatingTask ? "กำลังสร้าง..." : "+ เพิ่มงาน"}
                </button>
                <span className="inline-grid h-[30px] min-w-[30px] place-items-center rounded-full bg-surface-muted px-2 text-xs font-bold text-text-primary">
                  {today.length}
                </span>
              </div>
            </div>

            {today.length === 0 ? (
              <EmptyState title="ยังไม่มีงานที่ตั้งไว้สำหรับวันนี้" compact />
            ) : (
              <div className="flex flex-col">
                {today.map((task, index) => {
                  const isUpdating = updatingTaskId === task.id;

                  return (
                    <article
                      key={task.id}
                      className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-4 border-t border-border py-3 first:border-t-0 max-[640px]:grid-cols-[38px_minmax(0,1fr)]"
                    >
                      <div className="grid h-[38px] w-[38px] place-items-center rounded-button bg-surface-muted text-[11px] font-bold text-text-secondary">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <button
                        type="button"
                        className="min-w-0 cursor-pointer border-none bg-transparent p-0 text-left"
                        onClick={() => openTaskDrawer(task.id)}
                      >
                        <h3 className="m-0 text-sm font-semibold">
                          {task.title}
                        </h3>

                        {task.description ? (
                          <p className="mt-1 mb-0 line-clamp-2 text-xs text-text-secondary">
                            {task.description}
                          </p>
                        ) : null}

                        {task.estimatedPomodoros > 0 ? (
                          <p className="m-0 text-xs text-text-secondary">
                            ประมาณ {task.estimatedPomodoros} รอบโฟกัส
                          </p>
                        ) : (
                          <p className="m-0 text-xs text-text-secondary">
                            ยังไม่ได้กำหนดเวลาประมาณการ
                          </p>
                        )}
                      </button>

                      <button
                        type="button"
                        className="min-h-9 shrink-0 rounded-button border border-black bg-black px-3 text-xs font-semibold text-white transition-[border-color,background-color] duration-[120ms] hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50 max-[640px]:col-span-2 max-[640px]:w-full"
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
            <section className="rounded-modal border border-border bg-surface p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                    PROGRESS
                  </p>
                  <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
                    วันนี้คืบหน้า
                  </h2>
                </div>
                <span className="text-[13px] text-text-secondary">
                  {todayStats.done} / {todayStats.total} งาน
                </span>
              </div>

              <div
                className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
                aria-label={`เสร็จแล้ว ${todayStats.done} จาก ${todayStats.total} งาน`}
              >
                <div
                  className="zebra-fill h-full rounded-full transition-[width] duration-[350ms]"
                  style={{
                    width: `${Math.round((todayStats.done / todayStats.total) * 100)}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-[13px] text-text-secondary">
                <span>{focusCount} รอบโฟกัส</span>
                <span
                  className="h-1 w-1 rounded-full bg-text-secondary"
                  aria-hidden="true"
                />
                <span>
                  {focusMinutes >= 60
                    ? `${Math.floor(focusMinutes / 60)} ชม. ${focusMinutes % 60} นาที`
                    : `${focusMinutes} นาที`}
                </span>
              </div>
            </section>
          ) : null}

          {recentNotes.length > 0 ? (
            <section>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-text-secondary uppercase">
                    RECENT NOTES
                  </p>
                  <h2 className="m-0 text-[18px] leading-[1.25] tracking-[-0.02em] text-text-primary">
                    โน้ตล่าสุด
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 max-[1024px]:grid-cols-1">
                {recentNotes.map((note) => (
                  <article
                    key={note.id}
                    className="flex min-w-0 items-center gap-3 rounded-card border border-border bg-surface p-3"
                  >
                    <div
                      className="zebra-tile grid h-[34px] w-[34px] shrink-0 place-items-center rounded-button border border-border text-[11px] font-extrabold"
                      aria-hidden="true"
                    >
                      N
                    </div>

                    <div className="min-w-0">
                      <h3 className="m-0 truncate text-sm font-semibold">
                        {note.title}
                      </h3>
                      <p className="m-0 text-xs text-text-secondary">
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

      <TaskDetailDrawer
        task={selectedTask}
        pomodoroTaskId={pomodoro.taskId}
        open={drawerOpen}
        onClose={closeTaskDrawer}
        onTaskUpdated={handleTaskUpdated}
        onStatusChange={changeTaskStatus}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
