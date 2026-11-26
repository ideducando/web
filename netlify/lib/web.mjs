// Lo que comparten todas las funciones de Netlify, hablen o no con Brevo: las respuestas JSON, la
// comprobación de que la petición sale de la propia web y los catálogos de la web.

/** Respuesta JSON que nadie guarda en caché. */
export function json(estado, datos) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Las funciones solo atienden peticiones hechas desde la propia web (o desde su vista previa). */
export function vieneDeLaWeb(peticion) {
  const origen = peticion.headers.get('origin');
  if (!origen) return false;
  try {
    return new URL(origen).host === new URL(peticion.url).host;
  } catch {
    return false;
  }
}

// Los catálogos se leen de la propia web y se recuerdan 10 minutos. Las funciones solo aceptan lo que
// esté en ellos, nunca lo que escriba quien rellena un formulario:
// - /datos/mochila.json (src/pages/datos/mochila.json.ts): el material gratuito. Los enlaces de los correos
//   de la mochila salen de él y las valoraciones con estrellas solo cuentan sus materiales.
// - /datos/montaje.json (src/pages/datos/montaje.json.ts): lo que se puede pedir montado.
const catalogos = new Map();

async function leerDatos(base, archivo) {
  const guardado = catalogos.get(archivo);
  if (guardado && guardado.base === base && Date.now() - guardado.hora < 10 * 60 * 1000) return guardado.porId;
  const respuesta = await fetch(`${base}/datos/${archivo}`, { signal: AbortSignal.timeout(4000) });
  if (!respuesta.ok) throw new Error(`el catálogo ${archivo} ha contestado ${respuesta.status}`);
  const lista = await respuesta.json();
  const porId = new Map(lista.map((m) => [m.id, m]));
  catalogos.set(archivo, { base, hora: Date.now(), porId });
  return porId;
}

export const leerCatalogo = (base) => leerDatos(base, 'mochila.json');
export const leerMontaje = (base) => leerDatos(base, 'montaje.json');
