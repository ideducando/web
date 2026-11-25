// Lo que comparten todas las funciones de Netlify, hablen o no con Brevo: las respuestas JSON, la
// comprobación de que la petición sale de la propia web y el catálogo del material gratuito.

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

// El catálogo se lee de la propia web (/datos/mochila.json, que sale de src/pages/datos/mochila.json.ts)
// y se recuerda 10 minutos. Las funciones solo aceptan materiales que estén aquí: los enlaces de los
// correos de la mochila salen de él y las valoraciones con estrellas solo cuentan sus materiales.
let catalogo = { base: '', hora: 0, porId: new Map() };

export async function leerCatalogo(base) {
  if (catalogo.base === base && Date.now() - catalogo.hora < 10 * 60 * 1000) return catalogo.porId;
  const respuesta = await fetch(`${base}/datos/mochila.json`, { signal: AbortSignal.timeout(4000) });
  if (!respuesta.ok) throw new Error(`el catálogo ha contestado ${respuesta.status}`);
  const lista = await respuesta.json();
  catalogo = { base, hora: Date.now(), porId: new Map(lista.map((m) => [m.id, m])) };
  return catalogo.porId;
}
