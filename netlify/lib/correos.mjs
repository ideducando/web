// Los correos que manda la web con Brevo: el del material de Mi mochila (que lleva también el botón para
// confirmar el boletín) y el aviso de «¿Lo necesitas montado?», que nos llega a hola@. Van en HTML sencillo (tablas y estilos dentro
// de cada etiqueta, que es lo que entienden todos los programas de correo) y en texto plano, con los colores
// de la marca. Lo que llega del formulario se escapa antes de entrar en el correo, y los enlaces salen
// siempre de los catálogos de la web.
import { REMITENTE } from './brevo.mjs';
import { telefonoParaLeer, telefonoParaLlamar } from './montaje.mjs';

const COLOR = {
  crema: '#FFF6E6',
  marino: '#1E2B55',
  enlace: '#2B6CD5',
  suave: '#46578C',
  linea: '#EAD9BB',
  blanco: '#FFFFFF',
};
const LETRA = 'Arial, Helvetica, sans-serif';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapar = (texto) => String(texto).replace(/[&<>"']/g, (letra) => ESCAPES[letra]);

function boton(href, texto) {
  return (
    `<a href="${escapar(href)}" style="display:inline-block;background:${COLOR.enlace};color:${COLOR.blanco};` +
    `font-family:${LETRA};font-size:16px;font-weight:bold;line-height:1.2;text-decoration:none;` +
    `padding:12px 20px;border-radius:999px;">${escapar(texto)}</a>`
  );
}

function parrafo(html, margen = '0 0 14px') {
  return `<p style="margin:${margen};">${html}</p>`;
}

function plantilla({ base, titulo, resumen, contenido, pie }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(titulo)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.crema};">
<div style="display:none;max-height:0;overflow:hidden;">${escapar(resumen)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.crema};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.blanco};border:1px solid ${COLOR.linea};border-radius:16px;">
<tr><td style="padding:24px 24px 4px;font-family:${LETRA};color:${COLOR.marino};">
<img src="${escapar(base)}/apple-touch-icon.png" width="44" height="44" alt="" style="vertical-align:middle;border-radius:10px;">
<span style="vertical-align:middle;margin-left:8px;font-size:22px;font-weight:bold;">IdEducando</span>
</td></tr>
<tr><td style="padding:12px 24px 24px;font-family:${LETRA};font-size:16px;line-height:1.5;color:${COLOR.marino};">
${contenido}
</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-family:${LETRA};font-size:13px;line-height:1.5;color:${COLOR.suave};">${pie}</p>
</td></tr>
</table>
</body>
</html>`;
}

/** Pie común: por qué le escribimos y dónde está la política de privacidad. */
function pie(base, porque) {
  const web = new URL(base).host;
  const enlace = (href, texto) => `<a href="${escapar(href)}" style="color:${COLOR.enlace};">${escapar(texto)}</a>`;
  return {
    html: `${escapar(porque)} ${enlace(`${base}/privacidad/`, 'Privacidad')} · ${enlace(`${base}/`, web)}`,
    texto: `${porque}\nPrivacidad: ${base}/privacidad/\nIdEducando: ${base}/`,
  };
}

/** Las redes de IdEducando (las mismas que src/data/sitio.json). */
const REDES = {
  instagram: 'https://www.instagram.com/ideducando/',
  pinterest: 'https://www.pinterest.com/ideducando/',
};

/** Lo que el boletín promete, igual que la casilla de Mi mochila y la página de confirmar. */
export const QUE_ES_EL_BOLETIN =
  'Una vez por semana, material nuevo y cómo montarlo, y novedades de la tienda y de nuestras redes. Te das de baja con un clic cuando quieras.';

/** Enlace para compartir por WhatsApp: lleva a la ficha (o al catálogo, si son varios), nunca al PDF. */
function enlaceWhatsApp(base, materiales) {
  const texto =
    materiales.length === 1
      ? `Te paso este material gratis de IdEducando: «${materiales[0].titulo}» ${new URL(materiales[0].ficha, base).href}`
      : `Material gratis para acompañar a peques con necesidades específicas, en el aula y en casa: ${base}/material-gratuito/`;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

/**
 * Correo con los enlaces del material que alguien ha pedido en Mi mochila (José, 27/11/2026: un solo correo).
 * Además del material lleva las gracias, cómo compartirlo, las redes, las estrellas y el boletín:
 * - boletin.estado «pedido»: marcó la casilla; el botón para confirmarlo va aquí, sin un segundo correo.
 * - «invitar»: no la marcó; se le invita con el mismo botón. Solo entra si lo pulsa y lo confirma en la web.
 * - «ya»: ya está en el boletín; no se le pide nada.
 */
export function correoMaterial({ base, correo, nombre, materiales, boletin = { estado: 'invitar', enlace: '' } }) {
  const absoluta = (ruta) => new URL(ruta, base).href;
  const varios = materiales.length > 1;
  const asunto = varios
    ? `Tu material de IdEducando: ${materiales.length} materiales`
    : `Tu material de IdEducando: ${materiales[0].titulo}`;
  const todoJunto = `${base}/mi-mochila/?descargar=${materiales.map((m) => m.id).join(',')}`;
  const saludo = nombre ? `Hola, ${nombre}:` : 'Hola:';
  const montaje = ' En la ficha tienes cómo montarlo y, si no tienes tiempo, ahí mismo puedes pedirlo montado.';
  const enlace = (href, texto) => `<a href="${escapar(href)}" style="color:${COLOR.enlace};font-weight:bold;">${escapar(texto)}</a>`;
  const whatsapp = enlaceWhatsApp(base, materiales);
  const gracias = '¡Gracias por confiar en IdEducando!';
  const ayuda =
    'Lo hace un equipo de profesionales de Pedagogía Terapéutica y Audición y Lenguaje, y nos ayuda muchísimo que lo compartas y que nos cuentes qué te ha parecido.';
  const compartir = 'Puedes imprimirlo y compartirlo con otras familias y docentes, siempre sin venderlo.';
  const opinion = '¿Qué te ha parecido? Contesta a este correo: lo lee el equipo.';
  const { estado, enlace: confirmar } = boletin;
  const tituloBoletin = estado === 'pedido' ? 'Último paso para el boletín' : '¿Te escribimos cuando haya material nuevo?';
  const textoBoletin =
    estado === 'pedido'
      ? `Has pedido el boletín de IdEducando. ${QUE_ES_EL_BOLETIN} Para apuntarte, pulsa el botón y confírmalo en nuestra web. El enlace vale 7 días.`
      : `${QUE_ES_EL_BOLETIN} Solo te apuntamos si pulsas el botón y lo confirmas en nuestra web.`;
  const botonBoletin = estado === 'pedido' ? 'Sí, confirmo el boletín' : 'Quiero el boletín';
  const { html: pieHtml, texto: pieTexto } = pie(
    base,
    'Te escribimos porque has pedido este material en nuestra web. Sin tu confirmación no te apuntamos a ninguna lista.',
  );

  const filas = materiales
    .map(
      (m) => `<tr><td style="padding:14px 0;border-top:1px solid ${COLOR.linea};">
<p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;color:${COLOR.suave};">${escapar(m.tipo)}</p>
<p style="margin:2px 0 4px;font-size:18px;font-weight:bold;line-height:1.3;"><a href="${escapar(absoluta(m.ficha))}" style="color:${COLOR.marino};">${escapar(m.titulo)}</a></p>
<p style="margin:0 0 10px;font-size:14px;color:${COLOR.suave};">${escapar(m.detalle)}.${m.montaje ? escapar(montaje) : ''}</p>
${boton(absoluta(m.archivo), 'Descargar el PDF')}
<p style="margin:10px 0 0;font-size:14px;">${enlace(`${absoluta(m.ficha)}#valorar`, '¿Te ha servido? Valóralo con estrellas')}</p>
</td></tr>`,
    )
    .join('\n');

  const cajaBoletin =
    estado === 'ya'
      ? ''
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:${COLOR.crema};border:2px solid #F6C12E;border-radius:14px;">
<tr><td style="padding:16px 18px;">
<p style="margin:0 0 6px;font-size:17px;font-weight:bold;">${escapar(tituloBoletin)}</p>
<p style="margin:0 0 12px;font-size:15px;">${escapar(textoBoletin)}</p>
${boton(confirmar, botonBoletin)}
</td></tr></table>`;

  const contenido = [
    parrafo(escapar(saludo)),
    parrafo('Aquí tienes el material que has elegido en Mi mochila. Todo es gratis.', '0 0 16px'),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">\n${filas}\n</table>`,
    varios ? parrafo('¿Lo quieres todo de una vez, en un ZIP?', '20px 0 8px') + boton(todoJunto, 'Descargarlo todo junto') : '',
    estado === 'pedido' ? cajaBoletin : '',
    `<p style="margin:24px 0 6px;font-size:18px;font-weight:bold;">${escapar(gracias)}</p>`,
    parrafo(escapar(ayuda), '0 0 12px'),
    boton(whatsapp, 'Compártelo por WhatsApp'),
    parrafo(
      `Y síguenos para ver lo que preparamos cada semana: ${enlace(REDES.instagram, 'Instagram')} y ${enlace(REDES.pinterest, 'Pinterest')}.`,
      '14px 0 12px',
    ),
    parrafo(`${escapar(compartir)} ${escapar(opinion)}`, '0'),
    estado === 'invitar' ? cajaBoletin : '',
    estado === 'ya' ? parrafo('Ya recibes nuestro boletín: gracias por seguirnos.', '14px 0 0') : '',
  ].join('\n');

  const texto = [
    saludo,
    '',
    'Aquí tienes el material que has elegido en Mi mochila. Todo es gratis.',
    '',
    ...materiales.flatMap((m) => [
      `* ${m.titulo} (${m.tipo}, ${m.detalle})`,
      `  Descargar el PDF: ${absoluta(m.archivo)}`,
      `  Ficha${m.montaje ? ', cómo montarlo y pedirlo montado' : ''}: ${absoluta(m.ficha)}`,
      `  ¿Te ha servido? Valóralo con estrellas: ${absoluta(m.ficha)}#valorar`,
      '',
    ]),
    ...(varios ? [`Todo junto, en un ZIP: ${todoJunto}`, ''] : []),
    ...(estado === 'pedido' ? [tituloBoletin, textoBoletin, `${botonBoletin}: ${confirmar}`, ''] : []),
    gracias,
    ayuda,
    `Compártelo por WhatsApp: ${whatsapp}`,
    `Instagram: ${REDES.instagram}`,
    `Pinterest: ${REDES.pinterest}`,
    '',
    compartir,
    opinion,
    ...(estado === 'invitar' ? ['', tituloBoletin, textoBoletin, `${botonBoletin}: ${confirmar}`] : []),
    ...(estado === 'ya' ? ['', 'Ya recibes nuestro boletín: gracias por seguirnos.'] : []),
    '',
    '--',
    pieTexto,
  ].join('\n');

  return {
    sender: REMITENTE,
    to: [{ email: correo, ...(nombre ? { name: nombre } : {}) }],
    replyTo: REMITENTE,
    subject: asunto,
    htmlContent: plantilla({
      base,
      titulo: asunto,
      resumen: 'Los enlaces para descargar lo que has elegido. Todo es gratis.',
      contenido,
      pie: pieHtml,
    }),
    textContent: texto,
    tags: ['mochila'],
  };
}

/**
 * Aviso para el equipo cuando alguien pide un material montado desde una ficha o desde la tienda
 * (netlify/functions/montaje.mjs). Llega a hola@; si la persona dejó su correo, al contestar le llega a ella.
 */
export function correoMontaje({ base, nombre, correo, telefono, producto }) {
  const absoluta = (ruta) => new URL(ruta, base).href;
  const asunto = `¿Lo necesitas montado? ${producto.titulo} · ${nombre}`;
  const donde = producto.origen === 'tienda' ? 'Tienda' : 'Material gratuito';
  const enlace = (href, texto) => `<a href="${escapar(href)}" style="color:${COLOR.enlace};">${escapar(texto)}</a>`;
  const sinDato = 'No lo ha dejado';
  const filas = [
    ['Nombre', escapar(nombre)],
    ['Correo', correo ? enlace(`mailto:${correo}`, correo) : sinDato],
    ['Teléfono', telefono ? enlace(`tel:${telefonoParaLlamar(telefono)}`, telefonoParaLeer(telefono)) : sinDato],
    ['Material', `${enlace(absoluta(producto.ficha), producto.titulo)} (${donde})`],
  ];
  const celda = `border-top:1px solid ${COLOR.linea};vertical-align:top;`;
  const tabla =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">\n' +
    filas
      .map(
        ([clave, valor]) =>
          `<tr><td style="${celda}padding:8px 14px 8px 0;font-weight:bold;white-space:nowrap;">${clave}</td>` +
          `<td style="${celda}padding:8px 0;">${valor}</td></tr>`,
      )
      .join('\n') +
    '\n</table>';
  const entrada = `${nombre} quiere «${producto.titulo}» montado y pide que os pongáis en contacto.`;
  const contestar = correo
    ? 'Para contestar por correo, responde a este mensaje: le llega a esa persona.'
    : 'No ha dejado correo: llámala o escríbele al teléfono.';
  const arasaac = producto.arasaac
    ? 'Lleva pictogramas de ARASAAC: el PDF es gratis siempre. Hasta tener por escrito la respuesta de ARASAAC, no se cobra por montarlo.'
    : '';
  const borrar = 'Cuando cerréis la petición, borrad este correo: en la política de privacidad decimos que la guardamos como mucho un año.';
  const { html: pieHtml, texto: pieTexto } = pie(base, 'Te llega porque alguien ha rellenado «¿Lo necesitas montado?» en la web.');

  const contenido = [
    parrafo(escapar(entrada), '0 0 16px'),
    tabla,
    parrafo(escapar(contestar), '18px 0 0'),
    arasaac ? parrafo(escapar(arasaac), '14px 0 0') : '',
    parrafo(escapar(borrar), '14px 0 0'),
  ].join('\n');

  const texto = [
    entrada,
    '',
    `Nombre: ${nombre}`,
    `Correo: ${correo || sinDato}`,
    `Teléfono: ${telefono ? telefonoParaLeer(telefono) : sinDato}`,
    `Material: ${producto.titulo} (${donde}) ${absoluta(producto.ficha)}`,
    '',
    contestar,
    ...(arasaac ? ['', arasaac] : []),
    '',
    borrar,
    '',
    '--',
    pieTexto,
  ].join('\n');

  return {
    sender: REMITENTE,
    to: [{ email: REMITENTE.email, name: REMITENTE.name }],
    replyTo: correo ? { email: correo, name: nombre } : REMITENTE,
    subject: asunto,
    htmlContent: plantilla({ base, titulo: asunto, resumen: entrada, contenido, pie: pieHtml }),
    textContent: texto,
    tags: ['montaje'],
  };
}
