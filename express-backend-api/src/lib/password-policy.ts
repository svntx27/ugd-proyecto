/**
 * Política de contraseñas de las cuentas de doctorandos.
 * Debe coincidir con las reglas que muestra el portal en DoctorandoActivationWizard.tsx,
 * para que la API no acepte contraseñas que la pantalla rechazaría.
 */
const REGLAS: { cumple: (p: string) => boolean; mensaje: string }[] = [
  { cumple: (p) => p.length >= 8, mensaje: "mínimo 8 caracteres" },
  { cumple: (p) => /[A-Z]/.test(p), mensaje: "una mayúscula" },
  { cumple: (p) => /[a-z]/.test(p), mensaje: "una minúscula" },
  { cumple: (p) => /[0-9]/.test(p), mensaje: "un número" },
  { cumple: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(p), mensaje: "un carácter especial" },
];

/** Devuelve el mensaje de error, o null si la contraseña cumple todas las reglas. */
export function validarPassword(password: unknown): string | null {
  if (typeof password !== "string") return "La contraseña es obligatoria";
  const faltan = REGLAS.filter((r) => !r.cumple(password)).map((r) => r.mensaje);
  return faltan.length ? `La contraseña debe tener ${faltan.join(", ")}` : null;
}
