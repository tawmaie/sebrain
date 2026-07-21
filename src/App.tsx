import { useCallback, useEffect, useRef, useState } from "react";
import type { AppView } from "./types/navigation";
import { getDatabase } from "./services/database";
import { listInboxItems } from "./repositories/inboxRepository";
import { AppShell } from "./components/layout/AppShell";
import { ErrorMessage } from "./components/common/ErrorMessage";
import { LoadingState } from "./components/common/LoadingState";
import { TodayPage } from "./features/today/TodayPage";
import { InboxPage } from "./features/inbox/InboxPage";
import { TasksPage } from "./features/tasks/TasksPage";
import { NotesPage } from "./features/notes/NotesPage";
import { FocusPage } from "./features/focus/FocusPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { usePomodoro } from "./hooks/usePomodoro";
import "./App.css";

type BootState = "loading" | "ready" | "error";

function App() {
  const [bootState, setBootState] = useState<BootState>("loading");
  const [bootError, setBootError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [captureRequestId, setCaptureRequestId] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const pomodoro = usePomodoro();
  const searchInputRef = useRef<HTMLInputElement>(null);

  async function bootstrap() {
    setBootState("loading");
    setBootError(null);
    try {
      await getDatabase();
      setBootState("ready");
    } catch (err) {
      setBootError(err instanceof Error ? err.message : String(err));
      setBootState("error");
    }
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  const refreshInboxCount = useCallback((count: number) => {
    setInboxCount(count);
  }, []);

  useEffect(() => {
    if (bootState !== "ready") {
      return;
    }
    void listInboxItems()
      .then((items) => setInboxCount(items.length))
      .catch(() => undefined);
  }, [bootState]);

  const openCapture = useCallback(() => {
    setView("inbox");
    setCaptureRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" &&
            target.getAttribute("type") !== "search"));

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isEditable) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCapture();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [openCapture]);

  if (bootState === "loading") {
    return (
      <div className="boot-screen">
        <div className="boot-brand">
          <span className="boot-mark" aria-hidden="true" />
          <LoadingState label="กำลังเตรียมฐานข้อมูล SeBrain..." />
        </div>
      </div>
    );
  }

  if (bootState === "error") {
    return (
      <div className="boot-screen">
        <ErrorMessage
          message={bootError ?? "เปิดฐานข้อมูลไม่สำเร็จ"}
          onRetry={() => void bootstrap()}
        />
      </div>
    );
  }

  return (
    <AppShell
      view={view}
      onNavigate={setView}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onOpenCapture={openCapture}
      inboxCount={inboxCount}
      searchInputRef={searchInputRef}
    >
      {view === "today" ? (
        <TodayPage pomodoro={pomodoro} captureRequestId={captureRequestId} />
      ) : null}
      {view === "inbox" ? (
        <InboxPage
          searchQuery={searchQuery}
          captureRequestId={captureRequestId}
          onCountChange={refreshInboxCount}
        />
      ) : null}
      {view === "tasks" ? <TasksPage searchQuery={searchQuery} /> : null}
      {view === "notes" ? <NotesPage searchQuery={searchQuery} /> : null}
      {view === "focus" ? <FocusPage pomodoro={pomodoro} /> : null}
      {view === "settings" ? (
        <SettingsPage onSaved={() => void pomodoro.reloadSettings()} />
      ) : null}
    </AppShell>
  );
}

export default App;
