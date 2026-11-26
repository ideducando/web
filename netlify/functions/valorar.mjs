// Recibe la valoración con estrellas que alguien da desde la ficha de un material y la suma a sus cuentas
// (netlify/lib/valoraciones.mjs). Solo acepta materiales del catálogo y de 1 a 5 estrellas, y contesta
// con el resumen nuevo del material para que la ficha lo enseñe al momento. No guarda quién vota.
import { abrirAlmacen, estrellasValidas, idValido, sumarVoto } from '../lib/valoraciones.mjs';
import { json, leerCatalogo, vieneDeLaWeb } from '../lib/web.mjs';

export const config = {
  path: '/api/valorar',
  method: 'POST',
  // Como mucho 6 valoraciones cada 3 minutos desde la misma conexión; a partir de ahí, Netlify contesta 429.
  rateLimit: { windowLimit: 6, windowSize: 180, aggregateBy: ['ip', 'domain'] },
};

export default async (peticion, contexto) => {
  if (peticion.method !== 'POST') return json(405, { error: 'metodo' });
  if (!vieneDeLaWeb(peticion)) return json(403, { error: 'origen' });

  const campos = new URLSearchParams(await peticion.text().catch(() => ''));
  const id = campos.get('material') ?? '';
  const estrellas = Number(campos.get('estrellas'));
  if (!idValido(id)) return json(400, { error: 'material' });
  if (!estrellasValidas(estrellas)) return json(400, { error: 'estrellas' });

  try {
    const porId = await leerCatalogo(new URL(peticion.url).origin);
    if (!porId.has(id)) return json(400, { error: 'material' });
  } catch (error) {
    console.error(`No se ha podido leer el catálogo para valorar: ${error.message}`);
    return json(503, { error: 'catalogo' });
  }

  try {
    const resultado = await sumarVoto(abrirAlmacen(contexto), id, estrellas);
    if (!resultado) return json(503, { error: 'ocupado' });
    return json(200, { guardado: true, ...resultado });
  } catch (error) {
    console.error(`No se ha podido guardar la valoración: ${error.message}`);
    return json(503, { error: 'almacen' });
  }
};
