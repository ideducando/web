// Ayudas para construir enlaces que funcionen tanto en
// https://ideducando.github.io/web/ como, más adelante, en https://ideducando.es/.

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Enlace interno: ruta('/contacto/') → '/web/contacto/'. */
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
