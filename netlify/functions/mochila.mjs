// Mi mochila: recibe el formulario, comprueba que todo está bien y pide a Brevo el correo con los enlaces
// del material. Es un solo correo (José, 27/11/2026): lleva también las gracias, cómo compartirlo, las redes y
// el boletín. A quien marcó la casilla le pide ahí que lo confirme; a quien no, le invita. Solo entra en la
// lista quien pulsa el botón y lo confirma en /boletin/confirmar/.
// Si Brevo no puede (por ejemplo, porque se han gastado los 300 correos del día), contesta «enviado: false»
// y la página enseña la descarga en pantalla: nadie se queda sin su material.
import { brevo, enviosDeHoy, hayClave, LISTA_BOLETIN } from '../lib/brevo.mjs';
import { correoMaterial } from '../lib/correos.mjs';
import { firmar } from '../lib/firma.mjs';
import { json, leerCatalogo, vieneDeLaWeb } from '../lib/web.mjs';

export const config = {
  path: '/api/mochila',
  method: 'POST',
  // Como mucho 6 peticiones cada 3 minutos desde la misma conexión; a partir de ahí, Netlify contesta 429.
  rateLimit: { windowLimit: 6, windowSize: 180, aggregateBy: ['ip', 'domain'] },
};

const MAX_MATERIALES = 40;
// Correos de material al día para una misma dirección. Frena a quien quiera llenar el buzón de otra persona.
const CORREOS_AL_DIA = 3;
const CORREO = /^[^\s@<>()[\]\\,;:"']{1,64}@[^\s@<>()[\]\\,;:"']+\.[^\s@<>()[\]\\,;:"']{2,}$/;
// El nombre solo puede llevar letras, espacios, apóstrofos y guiones: así nadie mete enlaces en nuestros correos.
const NOMBRE = /^[\p{L}\p{M}][\p{L}\p{M} '’-]{0,39}$/u;

function limpiarNombre(texto) {
  const nombre = String(texto ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  return NOMBRE.test(nombre) ? nombre : '';
}

/** ¿Ya está en la lista del boletín? Así no se le invita otra vez. Si Brevo no contesta, se le invita. */
async function yaEnElBoletin(correo) {
  const contacto = await brevo(`/contacts/${encodeURIComponent(correo)}`);
  const lista = contacto.ok ? contacto.datos?.listIds ?? [] : [];
  return lista.includes(LISTA_BOLETIN) && !contacto.datos?.emailBlacklisted;
}

export default async (peticion) => {
  if (peticion.method !== 'POST') return json(405, { error: 'metodo' });
  if (!vieneDeLaWeb(peticion)) return json(403, { error: 'origen' });

  const campos = new URLSearchParams(await peticion.text().catch(() => ''));
  // El campo trampa solo lo rellenan los robots: se les contesta como si nada.
  if ((campos.get('sitio_web') ?? '').trim()) return json(200, { enviado: true, boletin: 'no' });

  const correo = (campos.get('correo') ?? '').trim();
  if (correo.length > 120 || !CORREO.test(correo)) return json(400, { error: 'correo' });
  if (campos.get('privacidad') !== 'si') return json(400, { error: 'privacidad' });
  const nombre = limpiarNombre(campos.get('nombre'));
  const ids = [
    ...new Set(
      (campos.get('materiales') ?? '')
        .split(/[\s,]+/)
        .filter((id) => /^[a-z0-9-]{1,100}$/.test(id)),
    ),
  ];
  if (!ids.length || ids.length > MAX_MATERIALES) return json(400, { error: 'materiales' });

  const base = new URL(peticion.url).origin;
  let materiales;
  try {
    const porId = await leerCatalogo(base);
    materiales = ids.map((id) => porId.get(id)).filter(Boolean);
  } catch (error) {
    console.error(`No se ha podido leer el catálogo de la mochila: ${error.message}`);
    return json(200, { enviado: false, motivo: 'catalogo' });
  }
  if (!materiales.length) return json(400, { error: 'materiales' });

  if (!hayClave()) {
    console.error('Falta la variable BREVO_API_KEY en Netlify: la mochila enseña la descarga en pantalla.');
    return json(200, { enviado: false, motivo: 'sin-clave' });
  }
  const hoy = await enviosDeHoy(correo);
  if (hoy.mochila >= CORREOS_AL_DIA) return json(200, { enviado: false, motivo: 'repetido' });

  // El boletín va dentro del mismo correo: el botón para confirmarlo (si marcó la casilla) o la invitación.
  const ya = await yaEnElBoletin(correo);
  const estado = ya ? 'ya' : campos.get('boletin') === 'si' ? 'pedido' : 'invitar';
  const enlace = ya ? '' : `${base}/boletin/confirmar/?t=${firmar(correo, nombre)}`;

  const envio = await brevo('/smtp/email', {
    metodo: 'POST',
    cuerpo: correoMaterial({ base, correo, nombre, materiales, boletin: { estado, enlace } }),
  });
  if (!envio.ok) {
    console.error(`Brevo no ha enviado el material (estado ${envio.estado}, ${envio.datos?.code ?? 'sin código'}).`);
    return json(200, { enviado: false, motivo: 'brevo' });
  }

  // Para la página: «enviado» si en el correo va el botón para confirmar, «ya» si ya está, «no» si se le invita.
  return json(200, { enviado: true, boletin: estado === 'pedido' ? 'enviado' : estado === 'ya' ? 'ya' : 'no' });
};
