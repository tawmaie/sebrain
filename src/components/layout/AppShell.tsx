import type { ReactNode, Ref } from "react";
import type { AppView } from "../../types/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCapture: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  inboxCount: number;
  searchInputRef?: Ref<HTMLInputElement>;
  children: ReactNode;
}

export function AppShell({
  view,
  onNavigate,
  onOpenCapture,
  searchQuery,
  onSearchChange,
  inboxCount,
  searchInputRef,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Topbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenCapture={onOpenCapture}
        searchInputRef={searchInputRef}
      />
      <div className="app-body">
        <Sidebar view={view} onNavigate={onNavigate} inboxCount={inboxCount} />
        <div className="app-main">{children}</div>
      </div>
    </div>
  );
}
