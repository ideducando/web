// Ayudas para construir enlaces internos. La web va en la raíz de www.ideducando.es; si algún día
// se publicara bajo una carpeta, ruta() se la añadiría sola.

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Enlace interno: ruta('/contacto/') → '/contacto/'. */
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
