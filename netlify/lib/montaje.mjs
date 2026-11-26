// «¿Lo necesitas montado?» (José, 26/11/2026): lo que comprueba la función antes de avisar al equipo.
// Pide el nombre y, para poder contestar, el correo o el teléfono: al menos uno de los dos.
// Todo lo que llega del formulario se limpia aquí; el título y el enlace del material salen siempre
// del catálogo de la web (/datos/montaje.json), nunca de lo que escriba quien rellena el formulario.

export const CORREO = /^[^\s@<>()[\]\\,;:"']{1,64}@[^\s@<>()[\]\\,;:"']+\.[^\s@<>()[\]\\,;:"']{2,}$/;
// Nombre y apellidos: letras, espacios, apóstrofos, puntos y guiones. Sin cifras ni símbolos, así nadie
// mete enlaces en el aviso que nos llega.
const NOMBRE = /^[\p{L}\p{M}][\p{L}\p{M} '’.-]{0,79}$/u;
// «material:agenda-visual» o «tienda:kit-para-montar»: de dónde viene y su identificador.
const PRODUCTO = /^(material|tienda):[a-z0-9-]{1,100}$/;

/** El nombre, limpio; vacío si no vale. */
export function limpiarNombre(texto) {
  const nombre = String(texto ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  return NOMBRE.test(nombre) ? nombre : '';
}

/**
 * El teléfono, solo con sus cifras (y el + del prefijo, si lo lleva): '' si no lo han escrito y null si
 * no parece un teléfono. Vale con espacios, puntos, guiones o paréntesis, y de 9 a 15 cifras.
 */
export function limpiarTelefono(texto) {
  const escrito = String(texto ?? '').trim();
  if (!escrito) return '';
  if (escrito.length > 25 || !/^[+\d(][\d\s().-]*$/.test(escrito)) return null;
  const cifras = escrito.replace(/[^\d+]/g, '');
  return /^\+?\d{9,15}$/.test(cifras) ? cifras : null;
}

/** El teléfono para pulsarlo en el móvil: los de 9 cifras, con el prefijo de España. */
export function telefonoParaLlamar(telefono) {
  if (telefono.startsWith('+')) return telefono;
  if (telefono.startsWith('00')) return `+${telefono.slice(2)}`;
  return /^[6789]\d{8}$/.test(telefono) ? `+34${telefono}` : telefono;
}

/** «612 345 678» para leerlo de un vistazo; los demás, tal cual. */
export function telefonoParaLeer(telefono) {
  return /^[6789]\d{8}$/.test(telefono) ? telefono.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : telefono;
}

/**
 * Comprueba el formulario (URLSearchParams). Devuelve { error } con el nombre del campo que falla, o
 * { datos: { nombre, correo, telefono, producto } } con todo limpio.
 */
export function leerPeticion(campos) {
  const nombre = limpiarNombre(campos.get('nombre'));
  if (!nombre) return { error: 'nombre' };

  const correo = String(campos.get('correo') ?? '').trim();
  if (correo && (correo.length > 120 || !CORREO.test(correo))) return { error: 'correo' };

  const telefono = limpiarTelefono(campos.get('telefono'));
  if (telefono === null) return { error: 'telefono' };
  if (!correo && !telefono) return { error: 'contacto' };

  if (campos.get('privacidad') !== 'si') return { error: 'privacidad' };

  const producto = String(campos.get('producto') ?? '').trim();
  if (!PRODUCTO.test(producto)) return { error: 'producto' };

  return { datos: { nombre, correo, telefono, producto } };
}
