"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Datos considerados frescos por 1 minuto (evita re-fetching inmediato)
            gcTime: 10 * 60 * 1000, // Almacenar en caché de memoria durante 10 minutos
            refetchOnWindowFocus: false, // Evitar ráfagas de peticiones al alternar entre ventanas
            retry: 1, // 1 reintento transparente antes de marcar error
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
