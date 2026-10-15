// Ayudas para construir enlaces que funcionen en cualquier dirección: en la raíz
// (Netlify: ideducando.netlify.app y después ideducando.es) o bajo /web (GitHub Pages).

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Enlace interno: ruta('/contacto/') → '/contacto/' en Netlify y '/web/contacto/' en GitHub Pages. */
export function ruta(camino = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(camino)) return camino;
  const limpio = camino.startsWith('/') ? camino : `/${camino}`;
  return `${base}${limpio}`;
}

/** Compara la página actual con un enlace del menú. */
export function esActual(actual: string, enlace: string): 'page' | 'true' | undefined {
  const a = actual.replace(/\/+$/, '/') || '/';
  const e = ruta(enlace);
  if (a === e) return 'page';
  if (enlace !== '/' && a.startsWith(e)) return 'true';
  return undefined;
}
