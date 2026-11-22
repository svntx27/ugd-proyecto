import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { thesisConfig } from '@/lib/shared';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ugd-docs.uce.edu.ec'),
  title: {
    template: '%s | Sistema UGD - Manual Técnico',
    default: 'Sistema UGD - Manual Técnico | Universidad Central del Ecuador',
  },
  description: `${thesisConfig.shortTitle}: ${thesisConfig.title}. ${thesisConfig.degree}`,
  applicationName: 'Sistema UGD - Documentación Técnica',
  authors: thesisConfig.authors.map((a) => ({ name: a.name })),
  creator: 'Freddy Xavier Tapia Rea & Dennis Adrian Trujillo Vistin',
  publisher: 'Universidad Central del Ecuador - Facultad de Ingeniería y Ciencias Aplicadas',
  keywords: [
    'UGD',
    'Universidad Central del Ecuador',
    'UCE',
    'FICA',
    'Manual Técnico',
    'Proyecto Integrador',
    'Trabajo de Titulación',
    'Doctorados',
    'Docentes Becarios',
    'Ingeniería en Ciencias de la Computación',
    'Backend API',
    'Express.js',
    'Prisma ORM',
    'PostgreSQL',
    'Server-Sent Events',
    'RBAC',
  ],
  openGraph: {
    title: 'Sistema UGD - Manual Técnico de la Plataforma Modular',
    description: thesisConfig.title,
    siteName: 'Sistema UGD - Manual Técnico',
    locale: 'es_EC',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema UGD - Manual Técnico',
    description: thesisConfig.title,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
