import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lee desde official y escribe en el directorio demo local
const inputPath = path.resolve(__dirname, "../official/import_neon_doctorandos.sql");
const outputPath = path.resolve(__dirname, "./import_neon_doctorandos.demo.sql");

if (!fs.existsSync(inputPath)) {
  console.error(`[ERROR] No se encontró el archivo oficial en: ${inputPath}`);
  console.error("Asegúrese de colocar 'import_neon_doctorandos.sql' dentro de prisma/data/official/");
  process.exit(1);
}

console.log(`[READ] Leyendo archivo oficial de la UGD: ${inputPath}`);
const sql = fs.readFileSync(inputPath, "utf-8");
let cedulaCounter = 1;

// Regex para capturar VALUES ('doc_X', '...', num, 'CEDULA'
const modified = sql.replace(
  /VALUES\s*\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*'(\d{10})'/g,
  (match, id, carpeta, num, oldCedula) => {
    // Cédula sintética única de 10 dígitos (prefijo 179 + 7 dígitos secuenciales)
    const fakeCedula = "179" + String(cedulaCounter++).padStart(7, "0");
    return `VALUES ('${id}', '${carpeta}', ${num}, '${fakeCedula}'`;
  }
);

fs.writeFileSync(outputPath, modified, "utf-8");
console.log(`[SUCCESS] Archivo demo generado con éxito: ${outputPath}`);
console.log(`[INFO] Total cédulas adulteradas/ficticias generadas: ${cedulaCounter - 1}`);
