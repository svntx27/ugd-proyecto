"use client";

import { useSidebarStore } from "@/store/sidebarStore";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { NotificationSyncProvider } from "@/providers/NotificationSyncProvider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out w-full bg-background text-foreground
      ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}
      pl-0
      `}
    >
      <NotificationSyncProvider />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col">
        <TopHeader />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
