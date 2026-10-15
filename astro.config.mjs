// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

// Dirección pública de la web. Se publica en Netlify, en la raíz (decisión de José, 15/10/2026).
// Al construir, Netlify da la dirección: URL es la principal (ideducando.netlify.app o, cuando se
// conecte, ideducando.es) y DEPLOY_PRIME_URL la de cada vista previa de un PR.
// Fuera de Netlify (en el ordenador o en la revisión automática) se usa ideducando.netlify.app.
const SITE =
  (process.env.CONTEXT === 'production' ? process.env.URL : process.env.DEPLOY_PRIME_URL) ??
  'https://ideducando.netlify.app';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    // smartypants desactivado: no convierte guiones en rayas ni cambia las comillas.
    processor: unified({ smartypants: false }),
  },
  build: {
    format: 'directory',
  },
});
