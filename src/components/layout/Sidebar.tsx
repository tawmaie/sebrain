import type { AppView } from "../../types/navigation";

const items: Array<{ id: AppView; label: string }> = [
  { id: "today", label: "Today" },
  { id: "inbox", label: "Inbox" },
  { id: "tasks", label: "Tasks" },
  { id: "notes", label: "Notes" },
  { id: "focus", label: "Focus" },
];

interface SidebarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  inboxCount: number;
}

export function Sidebar({ view, onNavigate, inboxCount }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true" />
        <span className="sidebar-brand-name">SeBrain</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              view === item.id ? "sidebar-item is-active" : "sidebar-item"
            }
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.label}</span>
            {item.id === "inbox" && inboxCount > 0 ? (
              <span className="sidebar-badge">{inboxCount}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className={
            view === "settings" ? "sidebar-item is-active" : "sidebar-item"
          }
          onClick={() => onNavigate("settings")}
        >
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
