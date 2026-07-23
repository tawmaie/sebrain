import {
  CheckSquare,
  FileText,
  Inbox,
  ScrollText,
  Settings,
  Sun,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { AppView } from "../../types/navigation";
import { cn } from "../../lib/ui";

const items: Array<{ id: AppView; label: string; icon: LucideIcon }> = [
  { id: "today", label: "Today", icon: Sun },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "log", label: "Log", icon: ScrollText },
  { id: "focus", label: "Focus", icon: Timer },
];

interface SidebarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  inboxCount: number;
}

const sidebarItemBase =
  "relative flex min-h-9 items-center gap-2 rounded-button border-none px-3 py-2 text-left font-medium max-[1100px]:justify-center max-[1100px]:px-2";

const sidebarItem = `${sidebarItemBase} bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary`;

const sidebarItemActive = `${sidebarItemBase} nav-active bg-black text-white hover:bg-black hover:text-white`;

const sidebarBadge =
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-surface-muted px-[5px] text-[11px] font-semibold text-text-secondary max-[1100px]:absolute max-[1100px]:-top-1 max-[1100px]:-right-1";

const sidebarBadgeActive =
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/18 px-[5px] text-[11px] font-semibold text-white max-[1100px]:absolute max-[1100px]:-top-1 max-[1100px]:-right-1";

export function Sidebar({ view, onNavigate, inboxCount }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6 border-r border-border bg-surface px-3 py-4">
      <div className="flex items-center gap-2 px-2 max-[1100px]:justify-center max-[1100px]:px-0">
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
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                active ? sidebarItemActive : sidebarItem,
                item.id === "inbox" && inboxCount > 0 && "max-[1100px]:mr-0",
              )}
              title={item.label}
              aria-label={item.label}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex-1 max-[1100px]:hidden">{item.label}</span>
              {item.id === "inbox" && inboxCount > 0 ? (
                <span className={active ? sidebarBadgeActive : sidebarBadge}>
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
          className={view === "settings" ? sidebarItemActive : sidebarItem}
          title="Settings"
          aria-label="Settings"
          onClick={() => onNavigate("settings")}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span className="max-[1100px]:hidden">Settings</span>
        </button>
      </div>
    </aside>
  );
}
