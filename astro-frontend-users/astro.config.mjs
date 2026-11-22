import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// Vercel inyecta automáticamente la variable de entorno VERCEL=1
const isVercel = !!process.env.VERCEL;

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  output: 'server',
  // Precarga la sección al pasar el mouse por un enlace: el cambio de página se siente inmediato
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  adapter: isVercel
    ? vercel()
    : node({
        mode: 'standalone',
      }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
