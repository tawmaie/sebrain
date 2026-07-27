import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MiniPomodoroApp } from "./MiniPomodoroApp";
import { WorkLogApp } from "./WorkLogApp";
import { TaskDetailApp } from "./TaskDetailApp";
import "./index.css";

const mode = new URLSearchParams(window.location.search).get("mode");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {mode === "mini" ? (
      <MiniPomodoroApp />
    ) : mode === "work-log" ? (
      <WorkLogApp />
    ) : mode === "task-detail" ? (
      <TaskDetailApp />
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
