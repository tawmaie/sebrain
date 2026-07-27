import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveTimer, SessionType, TimerStatus } from "../types/pomodoro";
import type { AppSettings } from "../types/settings";
import {
  clearActiveTimer,
  createSession,
  findRunningSessionForTimer,
  getActiveTimer,
  listRecentSessions,
  updateSessionCompletion,
  updateSessionStatus,
  upsertActiveTimer,
} from "../repositories/pomodoroRepository";
import { incrementCompletedPomodoros } from "../repositories/taskRepository";
import { getSettings } from "../repositories/settingsRepository";
import { notifySessionCompleted } from "../services/notificationService";
import { emitPomodoroChanged, onPomodoroChanged } from "../services/pomodoroEvents";
import type { PomodoroSession } from "../types/pomodoro";

function remainingFromEndAt(endAt: string | null): number {
  if (!endAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((new Date(endAt).getTime() - Date.now()) / 1000));
}

function overtimeFromEndAt(endAt: string | null): number {
  if (!endAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((Date.now() - new Date(endAt).getTime()) / 1000));
}

function durationForType(
  settings: AppSettings,
  sessionType: SessionType,
): number {
  if (sessionType === "focus") {
    return settings.focusDurationSeconds;
  }
  if (sessionType === "short_break") {
    return settings.shortBreakDurationSeconds;
  }
  return settings.longBreakDurationSeconds;
}

function sessionNotificationText(sessionType: SessionType): {
  title: string;
  body: string;
} {
  if (sessionType === "focus") {
    return {
      title: "จบรอบโฟกัสแล้ว",
      body: "ยังโฟกัสต่อได้ — กดจบโฟกัสเมื่อเสร็จงาน",
    };
  }
  if (sessionType === "short_break") {
    return {
      title: "พักสั้นเสร็จแล้ว",
      body: "พร้อมเริ่มโฟกัสรอบถัดไป",
    };
  }
  return {
    title: "พักยาวเสร็จแล้ว",
    body: "พร้อมเริ่มโฟกัสรอบถัดไป",
  };
}

export function usePomodoro() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(1500);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(1500);
  const [endAt, setEndAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);

  const finalizingRef = useRef(false);
  const enteringOvertimeRef = useRef(false);
  const overtimeHandledRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const settingsRef = useRef<AppSettings | null>(null);
  const timerSnapshotRef = useRef({
    taskId: null as string | null,
    noteId: null as string | null,
    sessionType: "focus" as SessionType,
    durationSeconds: 1500,
    startedAt: null as string | null,
  });

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    timerSnapshotRef.current = {
      taskId,
      noteId,
      sessionType,
      durationSeconds,
      startedAt,
    };
  }, [taskId, noteId, sessionType, durationSeconds, startedAt]);

  const refreshSessions = useCallback(async () => {
    const recent = await listRecentSessions(10);
    setSessions(recent);
  }, []);

  const notifyChanged = useCallback(async () => {
    await emitPomodoroChanged();
  }, []);

  const syncFromDatabase = useCallback(async () => {
    const loadedSettings = settingsRef.current ?? (await getSettings());
    if (!settingsRef.current) {
      setSettings(loadedSettings);
    }

    const active = await getActiveTimer();

    if (!active) {
      setStatus("idle");
      setSessionType("focus");
      setTaskId(null);
      setNoteId(null);
      setEndAt(null);
      setStartedAt(null);
      setOvertimeSeconds(0);
      overtimeHandledRef.current = false;
      sessionIdRef.current = null;
      const duration = durationForType(loadedSettings, "focus");
      setDurationSeconds(duration);
      setRemainingSeconds(duration);
      return;
    }

    setSessionType(active.sessionType);
    setTaskId(active.taskId);
    setNoteId(active.noteId);
    setDurationSeconds(active.durationSeconds);
    setStartedAt(active.startedAt);

    if (active.status === "paused") {
      setStatus("paused");
      setRemainingSeconds(active.remainingSeconds ?? active.durationSeconds);
      setOvertimeSeconds(active.overtimeSeconds);
      setEndAt(null);
      overtimeHandledRef.current = active.overtimeSeconds > 0;
      return;
    }

    if (active.status === "overtime" && active.endAt) {
      setStatus("overtime");
      setEndAt(active.endAt);
      setRemainingSeconds(0);
      setOvertimeSeconds(overtimeFromEndAt(active.endAt));
      overtimeHandledRef.current = true;
      return;
    }

    if (active.status === "running" && active.endAt) {
      const remaining = remainingFromEndAt(active.endAt);
      if (remaining <= 0) {
        return;
      }
      setStatus("running");
      setEndAt(active.endAt);
      setRemainingSeconds(remaining);
      setOvertimeSeconds(0);
      overtimeHandledRef.current = false;
    }
  }, []);

  const finalizeCompletion = useCallback(
    async (
      timer: {
        taskId: string | null;
        noteId: string | null;
        sessionType: SessionType;
        durationSeconds: number;
        startedAt: string;
      },
      options?: {
        skipNotification?: boolean;
        skipPomodoroIncrement?: boolean;
      },
    ) => {
      if (finalizingRef.current) {
        return;
      }
      finalizingRef.current = true;

      try {
        const endedAt = new Date().toISOString();
        const actualDuration = Math.max(
          1,
          Math.ceil(
            (new Date(endedAt).getTime() - new Date(timer.startedAt).getTime()) /
              1000,
          ),
        );
        let sessionId = sessionIdRef.current;

        if (!sessionId) {
          const existing = await findRunningSessionForTimer({
            taskId: timer.taskId,
            noteId: timer.noteId,
            sessionType: timer.sessionType,
            startedAt: timer.startedAt,
          });
          sessionId = existing?.id ?? null;
        }

        if (sessionId) {
          await updateSessionCompletion(sessionId, endedAt, actualDuration);
        } else {
          await createSession({
            taskId: timer.taskId,
            noteId: timer.noteId,
            sessionType: timer.sessionType,
            status: "completed",
            durationSeconds: actualDuration,
            startedAt: timer.startedAt,
            endedAt,
          });
        }

        if (
          timer.sessionType === "focus" &&
          timer.taskId &&
          !options?.skipPomodoroIncrement
        ) {
          await incrementCompletedPomodoros(timer.taskId);
        }

        await clearActiveTimer();
        sessionIdRef.current = null;
        overtimeHandledRef.current = false;

        setStatus("idle");
        setEndAt(null);
        setStartedAt(null);
        setOvertimeSeconds(0);
        setRemainingSeconds(timer.durationSeconds);

        if (
          settingsRef.current?.notificationEnabled &&
          !options?.skipNotification
        ) {
          const { title, body } = sessionNotificationText(timer.sessionType);
          await notifySessionCompleted(title, body);
        }

        setLastCompletedAt(endedAt);
        await refreshSessions();
        await notifyChanged();
      } finally {
        finalizingRef.current = false;
      }
    },
    [refreshSessions, notifyChanged],
  );

  const enterOvertime = useCallback(
    async (timer: {
      taskId: string | null;
      noteId: string | null;
      sessionType: SessionType;
      durationSeconds: number;
      startedAt: string;
      targetEndAt: string;
    }) => {
      if (enteringOvertimeRef.current || overtimeHandledRef.current) {
        return;
      }
      enteringOvertimeRef.current = true;

      try {
        const now = new Date().toISOString();

        await upsertActiveTimer({
          taskId: timer.taskId,
          noteId: timer.noteId,
          sessionType: timer.sessionType,
          status: "overtime",
          durationSeconds: timer.durationSeconds,
          remainingSeconds: 0,
          overtimeSeconds: 0,
          startedAt: timer.startedAt,
          endAt: timer.targetEndAt,
          pausedAt: null,
          updatedAt: now,
        });

        if (timer.sessionType === "focus" && timer.taskId) {
          await incrementCompletedPomodoros(timer.taskId);
        }

        if (settingsRef.current?.notificationEnabled) {
          const { title, body } = sessionNotificationText(timer.sessionType);
          await notifySessionCompleted(title, body);
        }

        overtimeHandledRef.current = true;
        setStatus("overtime");
        setRemainingSeconds(0);
        setOvertimeSeconds(overtimeFromEndAt(timer.targetEndAt));
        setEndAt(timer.targetEndAt);
        await notifyChanged();
      } finally {
        enteringOvertimeRef.current = false;
      }
    },
    [notifyChanged],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const loadedSettings = await getSettings();
        if (cancelled) return;
        setSettings(loadedSettings);

        const active = await getActiveTimer();
        if (cancelled) return;

        if (!active) {
          setStatus("idle");
          setSessionType("focus");
          setRemainingSeconds(loadedSettings.focusDurationSeconds);
          setDurationSeconds(loadedSettings.focusDurationSeconds);
        } else if (active.status === "paused") {
          setStatus("paused");
          setSessionType(active.sessionType);
          setTaskId(active.taskId);
          setNoteId(active.noteId);
          setDurationSeconds(active.durationSeconds);
          setRemainingSeconds(
            active.remainingSeconds ?? active.durationSeconds,
          );
          setOvertimeSeconds(active.overtimeSeconds);
          setStartedAt(active.startedAt);
          setEndAt(null);
          if (active.overtimeSeconds > 0) {
            overtimeHandledRef.current = true;
          }
        } else if (active.status === "overtime" && active.endAt) {
          setStatus("overtime");
          setSessionType(active.sessionType);
          setTaskId(active.taskId);
          setNoteId(active.noteId);
          setDurationSeconds(active.durationSeconds);
          setStartedAt(active.startedAt);
          setEndAt(active.endAt);
          setRemainingSeconds(0);
          setOvertimeSeconds(overtimeFromEndAt(active.endAt));
          overtimeHandledRef.current = true;
        } else if (active.status === "running" && active.endAt) {
          const remaining = remainingFromEndAt(active.endAt);
          setSessionType(active.sessionType);
          setTaskId(active.taskId);
          setNoteId(active.noteId);
          setDurationSeconds(active.durationSeconds);
          setStartedAt(active.startedAt);

          if (remaining <= 0 && active.sessionType === "focus") {
            const now = new Date().toISOString();
            await upsertActiveTimer({
              taskId: active.taskId,
              noteId: active.noteId,
              sessionType: active.sessionType,
              status: "overtime",
              durationSeconds: active.durationSeconds,
              remainingSeconds: 0,
              overtimeSeconds: overtimeFromEndAt(active.endAt),
              startedAt: active.startedAt,
              endAt: active.endAt,
              pausedAt: null,
              updatedAt: now,
            });
            setStatus("overtime");
            setEndAt(active.endAt);
            setRemainingSeconds(0);
            setOvertimeSeconds(overtimeFromEndAt(active.endAt));
            overtimeHandledRef.current = true;
          } else if (remaining <= 0) {
            await finalizeCompletion({
              taskId: active.taskId,
              noteId: active.noteId,
              sessionType: active.sessionType,
              durationSeconds: active.durationSeconds,
              startedAt: active.startedAt,
            });
            const refreshed = await getSettings();
            if (!cancelled) {
              setRemainingSeconds(
                durationForType(refreshed, active.sessionType),
              );
              setDurationSeconds(
                durationForType(refreshed, active.sessionType),
              );
            }
          } else {
            setStatus("running");
            setEndAt(active.endAt);
            setRemainingSeconds(remaining);
          }
        }

        await refreshSessions();
        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setReady(true);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // Restore timer once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void onPomodoroChanged(() => {
      void syncFromDatabase();
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => {
      unlisten?.();
    };
  }, [syncFromDatabase]);

  useEffect(() => {
    if (status !== "running" || !endAt) {
      return;
    }

    const tick = () => {
      const remaining = remainingFromEndAt(endAt);
      setRemainingSeconds(remaining);
      const snapshot = timerSnapshotRef.current;
      if (remaining <= 0 && snapshot.startedAt) {
        if (snapshot.sessionType === "focus") {
          void enterOvertime({
            taskId: snapshot.taskId,
            noteId: snapshot.noteId,
            sessionType: snapshot.sessionType,
            durationSeconds: snapshot.durationSeconds,
            startedAt: snapshot.startedAt,
            targetEndAt: endAt,
          });
        } else {
          void finalizeCompletion({
            taskId: snapshot.taskId,
            noteId: snapshot.noteId,
            sessionType: snapshot.sessionType,
            durationSeconds: snapshot.durationSeconds,
            startedAt: snapshot.startedAt,
          });
        }
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [status, endAt, finalizeCompletion, enterOvertime]);

  useEffect(() => {
    if (status !== "overtime" || !endAt) {
      return;
    }

    const tick = () => {
      setOvertimeSeconds(overtimeFromEndAt(endAt));
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [status, endAt]);

  const applySessionType = (nextType: SessionType) => {
    if (
      status === "running" ||
      status === "paused" ||
      status === "overtime"
    ) {
      return;
    }
    setSessionType(nextType);
    if (settings) {
      const duration = durationForType(settings, nextType);
      setDurationSeconds(duration);
      setRemainingSeconds(duration);
    }
  };

  const start = async () => {
    if (
      !settings ||
      status === "running" ||
      status === "overtime"
    ) {
      return;
    }

    const duration = durationForType(settings, sessionType);
    const now = new Date();
    const started = now.toISOString();
    const nextEndAt = new Date(now.getTime() + duration * 1000).toISOString();

    const session = await createSession({
      taskId,
      noteId,
      sessionType,
      status: "running",
      durationSeconds: duration,
      startedAt: started,
    });
    sessionIdRef.current = session.id;
    overtimeHandledRef.current = false;

    const timer: Omit<ActiveTimer, "id"> = {
      taskId,
      noteId,
      sessionType,
      status: "running",
      durationSeconds: duration,
      remainingSeconds: null,
      overtimeSeconds: 0,
      startedAt: started,
      endAt: nextEndAt,
      pausedAt: null,
      updatedAt: started,
    };

    await upsertActiveTimer(timer);

    setDurationSeconds(duration);
    setRemainingSeconds(duration);
    setOvertimeSeconds(0);
    setStartedAt(started);
    setEndAt(nextEndAt);
    setStatus("running");
    setError(null);
    await refreshSessions();
    await notifyChanged();
  };

  const pause = async () => {
    if (status === "overtime" && endAt && startedAt) {
      const overtime = overtimeFromEndAt(endAt);
      const now = new Date().toISOString();

      await upsertActiveTimer({
        taskId,
        noteId,
        sessionType,
        status: "paused",
        durationSeconds,
        remainingSeconds: 0,
        overtimeSeconds: overtime,
        startedAt,
        endAt: null,
        pausedAt: now,
        updatedAt: now,
      });

      setOvertimeSeconds(overtime);
      setEndAt(null);
      setStatus("paused");
      await notifyChanged();
      return;
    }

    if (status !== "running" || !endAt || !startedAt) {
      return;
    }

    const remaining = remainingFromEndAt(endAt);
    const now = new Date().toISOString();

    await upsertActiveTimer({
      taskId,
      noteId,
      sessionType,
      status: "paused",
      durationSeconds,
      remainingSeconds: remaining,
      overtimeSeconds: 0,
      startedAt,
      endAt: null,
      pausedAt: now,
      updatedAt: now,
    });

    setRemainingSeconds(remaining);
    setEndAt(null);
    setStatus("paused");
    await notifyChanged();
  };

  const resume = async () => {
    if (!startedAt) {
      return;
    }

    if (status === "paused" && overtimeSeconds > 0) {
      const now = new Date();
      const reconstructedEndAt = new Date(
        now.getTime() - overtimeSeconds * 1000,
      ).toISOString();
      const updatedAt = now.toISOString();

      await upsertActiveTimer({
        taskId,
        noteId,
        sessionType,
        status: "overtime",
        durationSeconds,
        remainingSeconds: 0,
        overtimeSeconds,
        startedAt,
        endAt: reconstructedEndAt,
        pausedAt: null,
        updatedAt,
      });

      setEndAt(reconstructedEndAt);
      setStatus("overtime");
      await notifyChanged();
      return;
    }

    if (status !== "paused") {
      return;
    }

    const now = new Date();
    const nextEndAt = new Date(
      now.getTime() + remainingSeconds * 1000,
    ).toISOString();
    const updatedAt = now.toISOString();

    await upsertActiveTimer({
      taskId,
      noteId,
      sessionType,
      status: "running",
      durationSeconds,
      remainingSeconds: null,
      overtimeSeconds: 0,
      startedAt,
      endAt: nextEndAt,
      pausedAt: null,
      updatedAt,
    });

    setEndAt(nextEndAt);
    setStatus("running");
    await notifyChanged();
  };

  const reset = async () => {
    if (sessionIdRef.current) {
      await updateSessionStatus(
        sessionIdRef.current,
        "cancelled",
        new Date().toISOString(),
      );
      sessionIdRef.current = null;
    } else if (startedAt) {
      const existing = await findRunningSessionForTimer({
        taskId,
        noteId,
        sessionType,
        startedAt,
      });
      if (existing) {
        await updateSessionStatus(
          existing.id,
          "cancelled",
          new Date().toISOString(),
        );
      }
    }

    await clearActiveTimer();
    overtimeHandledRef.current = false;

    const duration = settings
      ? durationForType(settings, sessionType)
      : durationSeconds;

    setStatus("idle");
    setEndAt(null);
    setStartedAt(null);
    setOvertimeSeconds(0);
    setDurationSeconds(duration);
    setRemainingSeconds(duration);
    await refreshSessions();
    await notifyChanged();
  };

  const finishEarly = async () => {
    if (
      !startedAt ||
      (status !== "running" && status !== "paused" && status !== "overtime")
    ) {
      return;
    }

    const wasOvertime = status === "overtime" || overtimeHandledRef.current;

    await finalizeCompletion(
      {
        taskId,
        noteId,
        sessionType,
        durationSeconds,
        startedAt,
      },
      {
        skipNotification: wasOvertime,
        skipPomodoroIncrement: wasOvertime,
      },
    );
  };

  const reloadSettings = async () => {
    const loaded = await getSettings();
    setSettings(loaded);
    if (status === "idle") {
      const duration = durationForType(loaded, sessionType);
      setDurationSeconds(duration);
      setRemainingSeconds(duration);
    }
  };

  return {
    ready,
    error,
    settings,
    status,
    sessionType,
    taskId,
    noteId,
    remainingSeconds,
    overtimeSeconds,
    durationSeconds,
    sessions,
    setTaskId,
    setNoteId,
    applySessionType,
    start,
    pause,
    resume,
    reset,
    finishEarly,
    reloadSettings,
    refreshSessions,
    lastCompletedAt,
  };
}
