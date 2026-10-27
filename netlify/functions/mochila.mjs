// Mi mochila: recibe el formulario, comprueba que todo está bien y pide a Brevo el correo con los enlaces
// del material. Si la persona marca la casilla del boletín, le manda además un correo para confirmarlo.
// Si Brevo no puede (por ejemplo, porque se han gastado los 300 correos del día), contesta «enviado: false»
// y la página enseña la descarga en pantalla: nadie se queda sin su material.
import { brevo, enviosDeHoy, hayClave, json, LISTA_BOLETIN, vieneDeLaWeb } from '../lib/brevo.mjs';
import { correoConfirmacion, correoMaterial } from '../lib/correos.mjs';
import { firmar } from '../lib/firma.mjs';

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

// El catálogo se lee de la propia web (/datos/mochila.json, src/pages/datos/mochila.json.ts) y se recuerda
// 10 minutos. Los enlaces del correo salen siempre de aquí, nunca de lo que mande el formulario.
let catalogo = { base: '', hora: 0, porId: new Map() };

async function leerCatalogo(base) {
  if (catalogo.base === base && Date.now() - catalogo.hora < 10 * 60 * 1000) return catalogo.porId;
  const respuesta = await fetch(`${base}/datos/mochila.json`, { signal: AbortSignal.timeout(4000) });
  if (!respuesta.ok) throw new Error(`el catálogo ha contestado ${respuesta.status}`);
  const lista = await respuesta.json();
  catalogo = { base, hora: Date.now(), porId: new Map(lista.map((m) => [m.id, m])) };
  return catalogo.porId;
}

function limpiarNombre(texto) {
  const nombre = String(texto ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  return NOMBRE.test(nombre) ? nombre : '';
}

/** ¿Hay que mandar la confirmación del boletín? «ya» si está en la lista; «pendiente» si se le mandó hoy. */
async function estadoBoletin(correo, hoy) {
  const contacto = await brevo(`/contacts/${encodeURIComponent(correo)}`);
  const lista = contacto.ok ? contacto.datos?.listIds ?? [] : [];
  if (lista.includes(LISTA_BOLETIN) && !contacto.datos?.emailBlacklisted) return 'ya';
  if (hoy.boletin >= 1) return 'pendiente';
  return 'enviar';
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

  // Lo del boletín se mira antes, para que el correo del material avise si llega otro para confirmarlo.
  let boletin = campos.get('boletin') === 'si' ? await estadoBoletin(correo, hoy) : 'no';

  const envio = await brevo('/smtp/email', {
    metodo: 'POST',
    cuerpo: correoMaterial({
      base,
      correo,
      nombre,
      materiales,
      boletin: boletin === 'enviar' ? 'enviado' : boletin,
    }),
  });
  if (!envio.ok) {
    console.error(`Brevo no ha enviado el material (estado ${envio.estado}, ${envio.datos?.code ?? 'sin código'}).`);
    return json(200, { enviado: false, motivo: 'brevo' });
  }

  if (boletin === 'enviar') {
    const enlace = `${base}/boletin/confirmar/?t=${firmar(correo, nombre)}`;
    const confirmacion = await brevo('/smtp/email', {
      metodo: 'POST',
      cuerpo: correoConfirmacion({ base, correo, nombre, enlace }),
    });
    boletin = confirmacion.ok ? 'enviado' : 'error';
    if (!confirmacion.ok) {
      console.error(`Brevo no ha enviado la confirmación del boletín (estado ${confirmacion.estado}).`);
    }
  }

  return json(200, { enviado: true, boletin });
};
