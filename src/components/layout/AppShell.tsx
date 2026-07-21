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
    <div className="flex h-full flex-col bg-bg">
      <Topbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenCapture={onOpenCapture}
        searchInputRef={searchInputRef}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[232px_1fr] max-[1100px]:grid-cols-[72px_1fr]">
        <Sidebar view={view} onNavigate={onNavigate} inboxCount={inboxCount} />
        <div className="min-h-0 min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
