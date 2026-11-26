// Da las valoraciones de todos los materiales en un solo dato pequeño: cada ficha busca en él la suya.
// La respuesta se guarda 5 minutos en la red de Netlify y 1 minuto en el navegador. Así casi ninguna visita
// enciende la función y se gasta lo mínimo: cada petición cuesta 2 créditos por cada 10.000.
import { abrirAlmacen, CLAVE, limpiarCuentas, resumenes } from '../lib/valoraciones.mjs';
import { json } from '../lib/web.mjs';

export const config = {
  path: '/api/valoraciones',
  method: 'GET',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async (peticion, contexto) => {
  let cuentas;
  try {
    cuentas = limpiarCuentas(await abrirAlmacen(contexto).get(CLAVE, { type: 'json' }));
  } catch (error) {
    console.error(`No se han podido leer las valoraciones: ${error.message}`);
    return json(503, { error: 'almacen' });
  }
  return new Response(JSON.stringify(resumenes(cuentas)), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
      // Solo para la red de Netlify (CDN): 5 minutos, compartido entre sus nodos («durable»); pasado ese
      // tiempo sigue sirviendo la copia anterior mientras pide una nueva por detrás.
      'netlify-cdn-cache-control': 'public, durable, max-age=300, stale-while-revalidate=86400',
    },
  });
};
