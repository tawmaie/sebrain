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

const sidebarItemBase =
  "relative flex min-h-9 items-center justify-between gap-2 rounded-button border-none px-3 py-2 text-left font-medium";

/** Inactive — use alone */
const sidebarItem = `${sidebarItemBase} bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary`;

/** Active — use alone (do not cn with sidebarItem) */
const sidebarItemActive = `${sidebarItemBase} nav-active bg-black text-white hover:bg-black hover:text-white`;

const sidebarBadge =
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-surface-muted px-[5px] text-[11px] font-semibold text-text-secondary";
const sidebarBadgeActive =
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/18 px-[5px] text-[11px] font-semibold text-white";

export function Sidebar({ view, onNavigate, inboxCount }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6 border-r border-border bg-surface px-3 py-4">
      <div className="flex items-center gap-2 px-2">
        <span
          className="zebra-mark h-[22px] w-[22px] shrink-0 rounded-[6px] bg-black"
          aria-hidden="true"
        />
        <span className="text-[20px] font-bold tracking-[-0.01em] max-[1100px]:hidden">
          SeBrain
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={active ? sidebarItemActive : sidebarItem}
              onClick={() => onNavigate(item.id)}
            >
              <span className="max-[1100px]:hidden">{item.label}</span>
              {item.id === "inbox" && inboxCount > 0 ? (
                <span
                  className={active ? sidebarBadgeActive : sidebarBadge}
                >
                  {inboxCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          className={
            view === "settings" ? sidebarItemActive : sidebarItem
          }
          onClick={() => onNavigate("settings")}
        >
          <span className="max-[1100px]:hidden">Settings</span>
        </button>
      </div>
    </aside>
  );
}
