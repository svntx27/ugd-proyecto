import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Sistema UGD - Manual Técnico';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Información oficial del proyecto de titulación para Metadata y SEO
export const thesisConfig = {
  title:
    'Diseño e implementación de una plataforma web modular para la gestión integral de docentes becarios de doctorado de la Universidad Central del Ecuador',
  shortTitle: 'Sistema UGD - Manual Técnico',
  degree:
    'Trabajo de titulación – Modalidad: Proyecto integrador, presentado para obtener el grado académico de Ingeniero en Ciencias de la Computación.',
  institution: 'Universidad Central del Ecuador',
  faculty: 'Facultad de Ingeniería y Ciencias Aplicadas',
  career: 'Carrera de Ingeniería en Ciencias de la Computación',
  authors: [
    { name: 'Tapia Rea Freddy Xavier' },
    { name: 'Trujillo Vistin Dennis Adrian' },
  ],
  tutor: 'Galo Javier González Hernández, Ph.D.',
  advisor: 'Director de la Unidad de Gestión de Doctorados',
  location: 'Quito, Ecuador',
  year: 2026,
};

// Configuración del repositorio
export const gitConfig = {
  user: 'UGD',
  repo: 'Proyecto-Integrador',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
