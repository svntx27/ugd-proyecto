export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Skeleton Encabezado de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted/70 rounded-xl" />
          <div className="h-4 w-96 bg-muted/50 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-muted/60 rounded-xl" />
          <div className="h-10 w-36 bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* Skeleton Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border/60 flex items-center justify-between"
          >
            <div className="space-y-2.5 flex-1">
              <div className="h-3.5 w-24 bg-muted/50 rounded-md" />
              <div className="h-7 w-16 bg-muted/70 rounded-lg" />
              <div className="h-3 w-32 bg-muted/40 rounded-md" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Skeleton Vista Principal y Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="h-5 w-40 bg-muted/60 rounded-lg" />
              <div className="h-8 w-24 bg-muted/50 rounded-lg" />
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="h-16 w-full bg-muted/40 rounded-xl border border-border/30"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
            <div className="h-5 w-36 bg-muted/60 rounded-lg" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((k) => (
                <div
                  key={k}
                  className="h-20 w-full bg-muted/40 rounded-xl border border-border/30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
