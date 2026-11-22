import { GraduationCap } from "lucide-react";

export default function UsuarioDetalleLoading() {
  return (
    <div className="animate-fade-in min-h-[65vh] w-full flex flex-col items-center justify-center p-6 text-center">
      {/* Emblema con Anillo de Carga */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute -inset-1.5 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin pointer-events-none" />
      </div>

      {/* Textos Institucionales */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-bold font-serif text-foreground tracking-tight">
          Consultando datos del estudiante...
        </h3>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Recuperando expediente doctoral, adendas e historial académico en la Unidad de Gestión de Doctorados (UGD).
        </p>
      </div>
    </div>
  );
}
