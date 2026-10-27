// Confirma el alta en el boletín. La página /boletin/confirmar/ manda aquí el código del enlace del correo
// cuando la persona pulsa «Sí, quiero el boletín». Si el código es bueno y tiene menos de 7 días, su correo
// entra en la lista «Boletín IdEducando» de Brevo. Hace falta pulsar el botón, y no basta con abrir el
// enlace, porque algunos antivirus de correo abren solos los enlaces y apuntarían a gente sin querer.
import { brevo, hayClave, json, LISTA_BOLETIN, vieneDeLaWeb } from '../lib/brevo.mjs';
import { comprobar } from '../lib/firma.mjs';

export const config = {
  path: '/api/boletin',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async (peticion) => {
  if (peticion.method !== 'POST') return json(405, { error: 'metodo' });
  if (!vieneDeLaWeb(peticion)) return json(403, { error: 'origen' });
  if (!hayClave()) {
    console.error('Falta la variable BREVO_API_KEY en Netlify: no se puede apuntar a nadie al boletín.');
    return json(503, { ok: false, motivo: 'error' });
  }

  const cuerpo = await peticion.json().catch(() => null);
  const datos = comprobar(cuerpo?.t);
  if (!datos) return json(400, { ok: false, motivo: 'caducado' });

  // Se vuelve a permitir el envío aunque antes se hubiera dado de baja: lo acaba de pedir y confirmar.
  const alta = { email: datos.correo, listIds: [LISTA_BOLETIN], updateEnabled: true, emailBlacklisted: false };
  // El campo del nombre se llama FIRSTNAME en unas cuentas de Brevo y NOMBRE en otras; si no existe
  // ninguno, se apunta solo el correo.
  const intentos = datos.nombre
    ? [{ ...alta, attributes: { FIRSTNAME: datos.nombre } }, { ...alta, attributes: { NOMBRE: datos.nombre } }, alta]
    : [alta];
  let respuesta;
  for (const intento of intentos) {
    respuesta = await brevo('/contacts', { metodo: 'POST', cuerpo: intento });
    if (respuesta.ok || respuesta.estado !== 400) break;
  }
  if (!respuesta.ok) {
    console.error(`Brevo no ha apuntado el correo al boletín (estado ${respuesta.estado}, ${respuesta.datos?.code ?? 'sin código'}).`);
    return json(502, { ok: false, motivo: 'error' });
  }
  return json(200, { ok: true });
};
