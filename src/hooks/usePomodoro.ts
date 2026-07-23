import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveTimer, SessionType, TimerStatus } from "../types/pomodoro";
import type { AppSettings } from "../types/settings";
import {
  clearActiveTimer,
  createSession,
  findRunningSessionForTimer,
  getActiveTimer,
  listRecentSessions,
  updateSessionStatus,
  upsertActiveTimer,
} from "../repositories/pomodoroRepository";
import { incrementCompletedPomodoros } from "../repositories/taskRepository";
import { getSettings } from "../repositories/settingsRepository";
import { notifySessionCompleted } from "../services/notificationService";
import type { PomodoroSession } from "../types/pomodoro";

function remainingFromEndAt(endAt: string | null): number {
  if (!endAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((new Date(endAt).getTime() - Date.now()) / 1000));
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
      body: "พักสักครู่แล้วเริ่มรอบถัดไปได้เลย",
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
  const [durationSeconds, setDurationSeconds] = useState(1500);
  const [endAt, setEndAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);

  const finalizingRef = useRef(false);
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

  const finalizeCompletion = useCallback(
    async (timer: {
      taskId: string | null;
      noteId: string | null;
      sessionType: SessionType;
      durationSeconds: number;
      startedAt: string;
    }) => {
      if (finalizingRef.current) {
        return;
      }
      finalizingRef.current = true;

      try {
        const endedAt = new Date().toISOString();
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
          await updateSessionStatus(sessionId, "completed", endedAt);
        } else {
          await createSession({
            taskId: timer.taskId,
            noteId: timer.noteId,
            sessionType: timer.sessionType,
            status: "completed",
            durationSeconds: timer.durationSeconds,
            startedAt: timer.startedAt,
            endedAt,
          });
        }

        if (timer.sessionType === "focus" && timer.taskId) {
          await incrementCompletedPomodoros(timer.taskId);
        }

        await clearActiveTimer();
        sessionIdRef.current = null;

        setStatus("idle");
        setEndAt(null);
        setStartedAt(null);
        setRemainingSeconds(timer.durationSeconds);

        if (settingsRef.current?.notificationEnabled) {
          const { title, body } = sessionNotificationText(timer.sessionType);
          await notifySessionCompleted(title, body);
        }

        setLastCompletedAt(endedAt);
        await refreshSessions();
      } finally {
        finalizingRef.current = false;
      }
    },
    [refreshSessions],
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
          setStartedAt(active.startedAt);
          setEndAt(null);
        } else if (active.status === "running" && active.endAt) {
          const remaining = remainingFromEndAt(active.endAt);
          setSessionType(active.sessionType);
          setTaskId(active.taskId);
          setNoteId(active.noteId);
          setDurationSeconds(active.durationSeconds);
          setStartedAt(active.startedAt);

          if (remaining <= 0) {
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
    if (status !== "running" || !endAt) {
      return;
    }

    const tick = () => {
      const remaining = remainingFromEndAt(endAt);
      setRemainingSeconds(remaining);
      const snapshot = timerSnapshotRef.current;
      if (remaining <= 0 && snapshot.startedAt) {
        void finalizeCompletion({
          taskId: snapshot.taskId,
          noteId: snapshot.noteId,
          sessionType: snapshot.sessionType,
          durationSeconds: snapshot.durationSeconds,
          startedAt: snapshot.startedAt,
        });
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [status, endAt, finalizeCompletion]);

  const applySessionType = (nextType: SessionType) => {
    if (status === "running" || status === "paused") {
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
    if (!settings || status === "running") {
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

    const timer: Omit<ActiveTimer, "id"> = {
      taskId,
      noteId,
      sessionType,
      status: "running",
      durationSeconds: duration,
      remainingSeconds: null,
      startedAt: started,
      endAt: nextEndAt,
      pausedAt: null,
      updatedAt: started,
    };

    await upsertActiveTimer(timer);

    setDurationSeconds(duration);
    setRemainingSeconds(duration);
    setStartedAt(started);
    setEndAt(nextEndAt);
    setStatus("running");
    setError(null);
    await refreshSessions();
  };

  const pause = async () => {
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
      startedAt,
      endAt: null,
      pausedAt: now,
      updatedAt: now,
    });

    setRemainingSeconds(remaining);
    setEndAt(null);
    setStatus("paused");
  };

  const resume = async () => {
    if (status !== "paused" || !startedAt) {
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
      startedAt,
      endAt: nextEndAt,
      pausedAt: null,
      updatedAt,
    });

    setEndAt(nextEndAt);
    setStatus("running");
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

    const duration = settings
      ? durationForType(settings, sessionType)
      : durationSeconds;

    setStatus("idle");
    setEndAt(null);
    setStartedAt(null);
    setDurationSeconds(duration);
    setRemainingSeconds(duration);
    await refreshSessions();
  };

  const finishEarly = async () => {
    if (!startedAt || (status !== "running" && status !== "paused")) {
      return;
    }

    await finalizeCompletion({
      taskId,
      noteId,
      sessionType,
      durationSeconds,
      startedAt,
    });
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
