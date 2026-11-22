"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SheetContext = React.createContext<{ isOpen: boolean; setIsOpen: (v: boolean) => void }>({ isOpen: false, setIsOpen: () => {} });

// Contador global para bloquear el scroll del fondo (body) mientras el panel lateral esté abierto
let openSheetsCount = 0;
let originalBodyOverflow = "";

function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const handleSetOpen = React.useCallback((val: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(val);
    }
    onOpenChange?.(val);
  }, [isControlled, onOpenChange]);

  React.useEffect(() => {
    if (!isOpen) return;

    if (openSheetsCount === 0) {
      originalBodyOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    }
    openSheetsCount++;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSetOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      openSheetsCount--;
      if (openSheetsCount <= 0) {
        openSheetsCount = 0;
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, [isOpen, handleSetOpen]);

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen: handleSetOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setIsOpen } = React.useContext(SheetContext);
  return (
    <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
      {children}
    </div>
  );
}

function SheetContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { isOpen, setIsOpen } = React.useContext(SheetContext);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
      <div className={cn("relative z-10 w-full max-w-md bg-card border-l border-border p-6 shadow-2xl overflow-y-auto text-foreground flex flex-col h-full", className)}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-muted-subtle hover:text-foreground p-1.5 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-foreground text-lg font-bold flex items-center gap-2", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 mt-auto", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
