import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function resolveSqlPath(isExplicitDemo: boolean, isExplicitOfficial: boolean): { path: string; mode: string } {
  const officialPaths = [
    path.resolve(__dirname, "./data/official/import_neon_doctorandos.sql"),
    path.resolve(process.cwd(), "prisma/data/official/import_neon_doctorandos.sql"),
    path.resolve(process.cwd(), "express-backend-api/prisma/data/official/import_neon_doctorandos.sql"),
  ];

  const demoPaths = [
    path.resolve(__dirname, "./data/demo/import_neon_doctorandos.demo.sql"),
    path.resolve(process.cwd(), "prisma/data/demo/import_neon_doctorandos.demo.sql"),
    path.resolve(process.cwd(), "express-backend-api/prisma/data/demo/import_neon_doctorandos.demo.sql"),
  ];

  if (isExplicitDemo) {
    for (const p of demoPaths) {
      if (fs.existsSync(p)) return { path: p, mode: "DEMO (Cédulas adulteradas para tribunal)" };
    }
    throw new Error("[ERROR] No se encontró el archivo demo en prisma/data/demo/import_neon_doctorandos.demo.sql");
  }

  if (isExplicitOfficial) {
    for (const p of officialPaths) {
      if (fs.existsSync(p)) return { path: p, mode: "OFICIAL (Datos institucionales UGD)" };
    }
    throw new Error("[ERROR] No se encontró el archivo oficial en prisma/data/official/import_neon_doctorandos.sql");
  }

  // Comportamiento por defecto: Preferir oficial si existe, o usar demo como fallback amigable
  for (const p of officialPaths) {
    if (fs.existsSync(p)) return { path: p, mode: "OFICIAL (Datos institucionales UGD)" };
  }

  for (const p of demoPaths) {
    if (fs.existsSync(p)) {
      console.log("[INFO] No se encontró archivo oficial en 'prisma/data/official/'. Usando datos de 'prisma/data/demo/' automáticamente.");
      return { path: p, mode: "DEMO (Fallback automático)" };
    }
  }

  throw new Error("[ERROR] No se encontraron archivos de datos ni en 'prisma/data/official/' ni en 'prisma/data/demo/'.");
}

async function main() {
  const isExplicitDemo = process.argv.includes("--demo");
  const isExplicitOfficial = process.argv.includes("--official");

  console.log(`[START] Iniciando proceso de importación de doctorandos...`);
  const { path: sqlPath, mode } = resolveSqlPath(isExplicitDemo, isExplicitOfficial);
  console.log(`[MODE] Modo seleccionado: ${mode}`);
  console.log(`[FILE] Leyendo script SQL: ${sqlPath}`);

  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Dividir por punto y coma seguido de salto de línea
  const rawParts = sql.split(/;\s*[\r\n]+/);
  const statements: string[] = [];

  for (const part of rawParts) {
    const s = part.trim();
    if (!s) continue;
    if (s.startsWith("--")) {
      const lines = s.split(/[\r\n]+/).filter((l) => !l.trim().startsWith("--")).join("\n").trim();
      if (lines && lines !== "BEGIN" && lines !== "COMMIT") {
        statements.push(lines);
      }
    } else if (s !== "BEGIN" && s !== "COMMIT") {
      statements.push(s);
    }
  }

  console.log(`[SQL] Total de sentencias válidas a ejecutar: ${statements.length}`);

  // Lotes optimizados con transacciones atómicas
  const BATCH_SIZE = 100;
  const startTime = Date.now();

  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    const chunk = statements.slice(i, i + BATCH_SIZE);

    // Ejecutar el lote dentro de una transacción Prisma para minimizar round-trips a Neon
    await prisma.$transaction(
      chunk.map((stmt) => prisma.$executeRawUnsafe(stmt))
    );

    const progress = Math.min(i + BATCH_SIZE, statements.length);
    const percent = ((progress / statements.length) * 100).toFixed(0);
    console.log(`[BATCH] Progreso: ${progress}/${statements.length} sentencias procesadas (${percent}%)...`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  // Verificación de registros
  const countResult: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM doctorandos;`);
  const total = countResult?.[0]?.count ?? 0;

  console.log(`[SUCCESS] Base de datos poblada en Neon exitosamente en ${elapsed}s.`);
  console.log(`[VERIFY] Total de doctorandos registrados: ${total}`);
}

main()
  .catch((e) => {
    console.error("[ERROR] Fallo en la importación de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
