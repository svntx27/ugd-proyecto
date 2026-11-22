"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  children: React.ReactNode;
}

function DropdownMenu({ children }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

const DropdownContext = React.createContext<{ isOpen: boolean; setIsOpen: (v: boolean) => void }>({ isOpen: false, setIsOpen: () => {} });

function DropdownMenuTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) {
  const { isOpen, setIsOpen } = React.useContext(DropdownContext);
  return (
    <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
      {children}
    </div>
  );
}

function DropdownMenuContent({ className, align = "end", children }: { className?: string; align?: "start" | "end"; children: React.ReactNode }) {
  const { isOpen, setIsOpen } = React.useContext(DropdownContext);
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      <div className={cn("absolute z-50 mt-2 w-56 rounded-2xl bg-card border border-border p-1.5 shadow-xl text-foreground animate-in fade-in duration-150", align === "end" ? "right-0" : "left-0", className)}>
        {children}
      </div>
    </>
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-3 py-1.5 text-[11px] font-semibold text-muted-subtle uppercase tracking-wider", className)} {...props} />;
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border-subtle", className)} />;
}

function DropdownMenuItem({ className, children, disabled, ...props }: React.ComponentProps<"div"> & { asChild?: boolean; disabled?: boolean }) {
  const { setIsOpen } = React.useContext(DropdownContext);
  return (
    <div
      onClick={() => { if (!disabled) setIsOpen(false); }}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors font-medium text-foreground-soft",
        disabled ? "opacity-50 cursor-not-allowed text-muted-subtle" : "hover:bg-surface-hover hover:text-foreground cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
};
