// «¿Lo necesitas montado?» (José, 26/11/2026): recibe el formulario de una ficha o de la tienda y manda el
// aviso a hola@ con Brevo, para que el equipo se ponga en contacto con esa persona. La web no guarda nada:
// el aviso se queda en el buzón de hola@. No se anuncian precios ni se vende nada desde aquí.
// Si Brevo no puede, contesta «enviado: false» y la ficha ofrece escribirnos a hola@.
import { brevo, enviosDeHoy, hayClave, REMITENTE } from '../lib/brevo.mjs';
import { correoMontaje } from '../lib/correos.mjs';
import { leerPeticion } from '../lib/montaje.mjs';
import { json, leerMontaje, vieneDeLaWeb } from '../lib/web.mjs';

export const config = {
  path: '/api/montaje',
  method: 'POST',
  // Como mucho 6 peticiones cada 3 minutos desde la misma conexión; a partir de ahí, Netlify contesta 429.
  rateLimit: { windowLimit: 6, windowSize: 180, aggregateBy: ['ip', 'domain'] },
};

// Avisos al día como mucho. Así un abuso no se come los 300 correos diarios de Brevo que usa Mi mochila.
export const AVISOS_AL_DIA = 30;

export default async (peticion) => {
  if (peticion.method !== 'POST') return json(405, { error: 'metodo' });
  if (!vieneDeLaWeb(peticion)) return json(403, { error: 'origen' });

  const campos = new URLSearchParams(await peticion.text().catch(() => ''));
  // El campo trampa solo lo rellenan los robots: se les contesta como si nada.
  if ((campos.get('sitio_web') ?? '').trim()) return json(200, { enviado: true });

  const { error, datos } = leerPeticion(campos);
  if (error) return json(400, { error });

  const base = new URL(peticion.url).origin;
  let producto;
  try {
    producto = (await leerMontaje(base)).get(datos.producto);
  } catch (fallo) {
    console.error(`No se ha podido leer el catálogo de montaje: ${fallo.message}`);
    return json(200, { enviado: false, motivo: 'catalogo' });
  }
  if (!producto) return json(400, { error: 'producto' });

  if (!hayClave()) {
    console.error('Falta la variable BREVO_API_KEY en Netlify: la ficha ofrece escribirnos a hola@.');
    return json(200, { enviado: false, motivo: 'sin-clave' });
  }
  const hoy = await enviosDeHoy(REMITENTE.email);
  if (hoy.montaje >= AVISOS_AL_DIA) {
    console.warn(`Hoy ya han llegado ${hoy.montaje} peticiones de montaje: las demás, por correo.`);
    return json(200, { enviado: false, motivo: 'cupo' });
  }

  const envio = await brevo('/smtp/email', { metodo: 'POST', cuerpo: correoMontaje({ base, ...datos, producto }) });
  if (!envio.ok) {
    console.error(`Brevo no ha enviado el aviso de montaje (estado ${envio.estado}, ${envio.datos?.code ?? 'sin código'}).`);
    return json(200, { enviado: false, motivo: 'brevo' });
  }
  return json(200, { enviado: true });
};
