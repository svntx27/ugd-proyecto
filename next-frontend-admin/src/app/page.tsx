"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-foreground-muted font-medium text-sm">
      <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      <span>Cargando Portal UGD...</span>
    </div>
  );
}
