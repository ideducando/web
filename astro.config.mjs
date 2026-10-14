// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

// Dirección pública de la web.
// Hoy: https://ideducando.github.io/web/
// Cuando ideducando.es apunte a GitHub Pages: SITE = 'https://ideducando.es' y BASE = '/'.
const SITE = 'https://ideducando.github.io';
const BASE = '/web';

// En los textos de Markdown se escriben los enlaces internos sin la base: /oposiciones/.
// Esta pieza les añade /web delante al construir, para que funcionen en cualquier dirección.
function enlacesConBase() {
  const prefijo = BASE.replace(/\/+$/, '');
  /** @param {any} nodo */
  const visitar = (nodo) => {
    if (nodo.type === 'element' && (nodo.tagName === 'a' || nodo.tagName === 'img')) {
      const atributo = nodo.tagName === 'a' ? 'href' : 'src';
      const valor = nodo.properties?.[atributo];
      if (
        prefijo &&
        typeof valor === 'string' &&
        valor.startsWith('/') &&
        !valor.startsWith('//') &&
        !valor.startsWith(`${prefijo}/`)
      ) {
        nodo.properties[atributo] = `${prefijo}${valor}`;
      }
    }
    for (const hijo of nodo.children ?? []) visitar(hijo);
  };
  /** @param {any} arbol */
  return (arbol) => visitar(arbol);
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    // smartypants desactivado: no convierte guiones en rayas ni cambia las comillas.
    processor: unified({ rehypePlugins: [enlacesConBase], smartypants: false }),
  },
  build: {
    format: 'directory',
  },
});
