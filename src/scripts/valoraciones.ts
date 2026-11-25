// Valoraciones con estrellas de las fichas (src/components/ValorarMaterial.astro).
// El navegador recuerda en su almacenamiento local, sin cookies, cuántas estrellas diste a cada material,
// para no volver a pedírtelo. Ese dato no sale de tu dispositivo: a la web solo llega el voto, sin nombre.

const CLAVE = 'ideducando-valoraciones';

export type Resumen = { votos: number; media: number | null };

function leerVotos(): Record<string, number> {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '{}');
    return guardado && typeof guardado === 'object' && !Array.isArray(guardado) ? guardado : {};
  } catch {
    return {};
  }
}

/** Las estrellas que diste a este material desde este navegador, o null si todavía no lo has valorado. */
export function miVoto(id: string): number | null {
  const n = leerVotos()[id];
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function recordarVoto(id: string, estrellas: number) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...leerVotos(), [id]: estrellas }));
  } catch {
    // Sin almacenamiento local el voto no se recuerda, pero ya se ha contado.
  }
}

const decimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** «4,6 de 5 (12 valoraciones)», o null si todavía no hay media. */
export function textoMedia({ votos, media }: Resumen): string | null {
  if (typeof media !== 'number') return null;
  return `${decimal.format(media)} de 5 (${votos} valoraciones)`;
}

/** «1 estrella», «4 estrellas». */
export const estrellasEnTexto = (n: number) => (n === 1 ? '1 estrella' : `${n} estrellas`);

/** Las valoraciones de todos los materiales, o null si no se pueden leer (por ejemplo, sin conexión). */
export async function pedirResumenes(direccion: string): Promise<Record<string, Resumen> | null> {
  try {
    const respuesta = await fetch(direccion, { signal: AbortSignal.timeout(5000) });
    if (!respuesta.ok) return null;
    const datos = await respuesta.json();
    return datos && typeof datos === 'object' && !Array.isArray(datos) ? datos : null;
  } catch {
    return null;
  }
}

export type Envio = { ok: true; resumen: Resumen } | { ok: false; motivo: 'muchas' | 'error' };

/** Manda el voto a la función valorar.mjs y, si se guarda, lo recuerda en este navegador. */
export async function enviarVoto(direccion: string, id: string, estrellas: number): Promise<Envio> {
  try {
    const respuesta = await fetch(direccion, {
      method: 'POST',
      body: new URLSearchParams({ material: id, estrellas: String(estrellas) }),
      signal: AbortSignal.timeout(10000),
    });
    if (respuesta.status === 429) return { ok: false, motivo: 'muchas' };
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok || datos?.guardado !== true) return { ok: false, motivo: 'error' };
    recordarVoto(id, estrellas);
    return { ok: true, resumen: { votos: datos.votos, media: datos.media } };
  } catch {
    return { ok: false, motivo: 'error' };
  }
}
