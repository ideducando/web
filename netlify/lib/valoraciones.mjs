// Valoraciones con estrellas del material gratuito (José, 25/11/2026). Son anónimas: de cada material solo se
// guarda cuántos votos ha recibido de 1, 2, 3, 4 y 5 estrellas. Ni nombres, ni correos, ni direcciones IP.
// Todo va en un único dato, «cuentas», del almacén de Netlify Blobs:
//   { "id-del-material": [votos de 1 estrella, de 2, de 3, de 4, de 5], … }
// Se puede ver y descargar en Netlify: proyecto > Data & Storage > Blobs.
import { getStore } from '@netlify/blobs';

/** Con menos de 5 votos la web no enseña la media: con dos o tres votos dice muy poco. */
export const MINIMO_PARA_MEDIA = 5;

/** Nombre del dato que guarda todas las cuentas. */
export const CLAVE = 'cuentas';

const ID = /^[a-z0-9-]{1,100}$/;

export const idValido = (id) => typeof id === 'string' && ID.test(id);

export const estrellasValidas = (n) => Number.isInteger(n) && n >= 1 && n <= 5;

/**
 * La web publicada guarda los votos en el almacén «valoraciones». Las vistas previas de los PR usan
 * «valoraciones-pruebas»: lo que se vota al revisar un cambio no cuenta en la web de verdad.
 * Los dos están en Fráncfort (Alemania), y por eso cada llamada lleva la región.
 */
export function abrirAlmacen(contexto) {
  const nombre = contexto?.deploy?.context === 'production' ? 'valoraciones' : 'valoraciones-pruebas';
  return getStore({ name: nombre, region: 'eu-central-1' });
}

/** Deja las cuentas en orden aunque lo guardado venga roto: solo materiales válidos y cinco números enteros. */
export function limpiarCuentas(datos) {
  const limpias = {};
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return limpias;
  for (const [id, votos] of Object.entries(datos)) {
    if (!idValido(id) || !Array.isArray(votos)) continue;
    limpias[id] = [0, 1, 2, 3, 4].map((i) => (Number.isSafeInteger(votos[i]) && votos[i] > 0 ? votos[i] : 0));
  }
  return limpias;
}

/** Lo que enseña la web de un material: cuántos votos tiene y, desde 5, la media con un decimal. */
export function resumen(votos = [0, 0, 0, 0, 0]) {
  const total = votos.reduce((suma, n) => suma + n, 0);
  if (total < MINIMO_PARA_MEDIA) return { votos: total, media: null };
  const estrellas = votos.reduce((suma, n, i) => suma + n * (i + 1), 0);
  return { votos: total, media: Math.round((estrellas / total) * 10) / 10 };
}

/** El resumen de todos los materiales que tienen algún voto. */
export function resumenes(cuentas) {
  return Object.fromEntries(Object.entries(cuentas).map(([id, votos]) => [id, resumen(votos)]));
}

const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

/**
 * Lee la versión más reciente de las cuentas, sin pasar por las copias de la red de Netlify, que pueden
 * tardar hasta un minuto en ponerse al día. Si el entorno no permite esa lectura, se usa la normal.
 */
async function leerUltima(almacen) {
  try {
    return await almacen.getWithMetadata(CLAVE, { type: 'json', consistency: 'strong' });
  } catch (error) {
    if (error?.name !== 'BlobsConsistencyError') throw error;
    return almacen.getWithMetadata(CLAVE, { type: 'json' });
  }
}

/**
 * Suma un voto y devuelve el resumen del material, o null si no ha podido guardarlo.
 * Si dos personas votan a la vez, no se pierde ningún voto: se lee la versión más reciente con su ETag
 * (la «huella» de esa versión) y solo se escribe si nadie la ha cambiado entretanto (onlyIfMatch).
 * Si alguien se ha adelantado, se vuelve a leer y se repite, hasta cinco veces.
 */
export async function sumarVoto(almacen, id, estrellas, { intentos = 5, pausa = 120 } = {}) {
  for (let intento = 1; intento <= intentos; intento++) {
    const actual = await leerUltima(almacen);
    const cuentas = limpiarCuentas(actual?.data);
    const votos = cuentas[id] ?? [0, 0, 0, 0, 0];
    votos[estrellas - 1] += 1;
    cuentas[id] = votos;
    const condicion = actual ? { onlyIfMatch: actual.etag } : { onlyIfNew: true };
    const escrito = await almacen.setJSON(CLAVE, cuentas, condicion);
    if (escrito.modified) return resumen(votos);
    if (intento < intentos) await esperar(pausa * intento * (0.5 + Math.random()));
  }
  return null;
}
