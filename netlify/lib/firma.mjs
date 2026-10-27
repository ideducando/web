// Enlaces firmados para confirmar el boletín. El enlace lleva el correo y la hora, y una firma que solo
// pueden calcular las funciones de la web: así nadie puede apuntar a otra persona inventándose el enlace.
// La llave de la firma sale de la clave de Brevo; si algún día se cambia la clave, los enlaces que estén
// sin confirmar dejan de valer y basta con pedir el boletín otra vez.
import { createHmac, timingSafeEqual } from 'node:crypto';

const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

function llave() {
  const clave = process.env.BREVO_API_KEY;
  if (!clave) throw new Error('Falta BREVO_API_KEY');
  return createHmac('sha256', clave).update('ideducando-boletin-v1').digest();
}

function firma(cuerpo) {
  return createHmac('sha256', llave()).update(cuerpo).digest('base64url');
}

/** Crea el código del enlace: correo, nombre (si lo hay) y hora, firmados. */
export function firmar(correo, nombre = '', ahora = Date.now()) {
  const cuerpo = Buffer.from(JSON.stringify({ c: correo, n: nombre, t: ahora })).toString('base64url');
  return `${cuerpo}.${firma(cuerpo)}`;
}

/**
 * Comprueba el código de un enlace. Devuelve { correo, nombre } si la firma es buena y tiene menos de 7 días;
 * si no, null.
 */
export function comprobar(codigo, ahora = Date.now()) {
  if (typeof codigo !== 'string' || codigo.length > 1000) return null;
  const [cuerpo, recibida, sobra] = codigo.split('.');
  if (!cuerpo || !recibida || sobra !== undefined) return null;
  const esperada = Buffer.from(firma(cuerpo));
  const dada = Buffer.from(recibida);
  if (esperada.length !== dada.length || !timingSafeEqual(esperada, dada)) return null;
  try {
    const { c, n, t } = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
    if (typeof c !== 'string' || typeof t !== 'number') return null;
    if (ahora - t > SIETE_DIAS || t - ahora > 60_000) return null;
    return { correo: c, nombre: typeof n === 'string' ? n : '' };
  } catch {
    return null;
  }
}
