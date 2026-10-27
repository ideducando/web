// Conversación con Brevo, el servicio que manda los correos de IdEducando (cuenta de hola@, plan gratuito:
// 300 correos al día). La clave vive en la variable secreta BREVO_API_KEY de Netlify, nunca en el repositorio:
// se creó el 27/10/2026 con permisos solo para correos transaccionales, contactos y leer la cuenta,
// y caduca el 27/10/2027 (aviso en el calendario del Despacho).

const API = 'https://api.brevo.com/v3';

export const REMITENTE = { name: 'IdEducando', email: 'hola@ideducando.es' };

/** «Boletín IdEducando», la lista de Brevo creada el 27/10/2026. */
export const LISTA_BOLETIN = 3;

export function hayClave() {
  return Boolean(process.env.BREVO_API_KEY);
}

/**
 * Llama a la API de Brevo. Nunca lanza error: devuelve { ok, estado, datos } para que quien llama decida.
 * Si Brevo tarda más de 4 segundos, se da por fallida: Netlify corta las funciones a los 10 segundos.
 */
export async function brevo(ruta, { metodo = 'GET', cuerpo } = {}) {
  try {
    const respuesta = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: {
        'api-key': process.env.BREVO_API_KEY ?? '',
        accept: 'application/json',
        ...(cuerpo ? { 'content-type': 'application/json' } : {}),
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(4000),
    });
    const texto = await respuesta.text();
    let datos = null;
    try {
      datos = texto ? JSON.parse(texto) : null;
    } catch {
      // Brevo a veces contesta sin cuerpo (204); no pasa nada.
    }
    return { ok: respuesta.ok, estado: respuesta.status, datos };
  } catch {
    return { ok: false, estado: 0, datos: null };
  }
}

/**
 * Cuántos correos de cada etiqueta («mochila», «boletin») ha pedido hoy la web para esta dirección,
 * según el registro de Brevo. Sirve de freno: así nadie puede usar el formulario para llenar el buzón
 * de otra persona. Si Brevo no contesta, cuenta 0 para no dejar a nadie sin su material; lo frena
 * igualmente el límite por conexión de la función.
 */
export async function enviosDeHoy(correo) {
  const consulta = new URLSearchParams({ email: correo, event: 'requests', days: '1', limit: '50' });
  const respuesta = await brevo(`/smtp/statistics/events?${consulta}`);
  if (!respuesta.ok) console.warn(`Brevo no ha dado el registro de envíos (estado ${respuesta.estado}).`);
  const cuenta = { mochila: 0, boletin: 0 };
  for (const evento of respuesta.datos?.events ?? []) {
    if (evento.tag in cuenta) cuenta[evento.tag]++;
  }
  return cuenta;
}

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
