// Los dos correos que manda la web con Brevo: el del material de Mi mochila y el que pide confirmar el boletín.
// Van en HTML sencillo (tablas y estilos dentro de cada etiqueta, que es lo que entienden todos los programas
// de correo) y en texto plano, con los colores de la marca. Lo que llega del formulario se escapa antes de
// entrar en el correo, y los enlaces salen siempre del catálogo de la web.
import { REMITENTE } from './brevo.mjs';

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

/** Correo con los enlaces del material que alguien ha pedido en Mi mochila. */
export function correoMaterial({ base, correo, nombre, materiales, boletin }) {
  const absoluta = (ruta) => new URL(ruta, base).href;
  const varios = materiales.length > 1;
  const asunto = varios
    ? `Tu material de IdEducando: ${materiales.length} materiales`
    : `Tu material de IdEducando: ${materiales[0].titulo}`;
  const todoJunto = `${base}/mi-mochila/?descargar=${materiales.map((m) => m.id).join(',')}`;
  const saludo = nombre ? `Hola, ${nombre}:` : 'Hola:';
  const montaje = ' En la ficha tienes cómo montarlo.';
  const despedida =
    'Puedes imprimirlo y compartirlo con otras familias y docentes, siempre sin venderlo. ' +
    'Si te sirve o echas algo en falta, contesta a este correo: lo lee el equipo.';
  const avisoBoletin = 'Para el boletín te llega otro correo con un botón para confirmarlo. Sin ese paso no te apuntamos.';
  const { html: pieHtml, texto: pieTexto } = pie(
    base,
    'Te escribimos porque has pedido este material en nuestra web. No te hemos apuntado a ninguna lista.',
  );

  const filas = materiales
    .map(
      (m) => `<tr><td style="padding:14px 0;border-top:1px solid ${COLOR.linea};">
<p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;color:${COLOR.suave};">${escapar(m.tipo)}</p>
<p style="margin:2px 0 4px;font-size:18px;font-weight:bold;line-height:1.3;"><a href="${escapar(absoluta(m.ficha))}" style="color:${COLOR.marino};">${escapar(m.titulo)}</a></p>
<p style="margin:0 0 10px;font-size:14px;color:${COLOR.suave};">${escapar(m.detalle)}.${m.montaje ? escapar(montaje) : ''}</p>
${boton(absoluta(m.archivo), 'Descargar el PDF')}
</td></tr>`,
    )
    .join('\n');

  const contenido = [
    parrafo(escapar(saludo)),
    parrafo('Aquí tienes el material que has elegido en Mi mochila. Todo es gratis.', '0 0 16px'),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">\n${filas}\n</table>`,
    varios ? parrafo('¿Lo quieres todo de una vez, en un ZIP?', '20px 0 8px') + boton(todoJunto, 'Descargarlo todo junto') : '',
    parrafo(escapar(despedida), '20px 0 0'),
    boletin === 'enviado' ? parrafo(escapar(avisoBoletin), '14px 0 0') : '',
  ].join('\n');

  const texto = [
    saludo,
    '',
    'Aquí tienes el material que has elegido en Mi mochila. Todo es gratis.',
    '',
    ...materiales.flatMap((m) => [
      `* ${m.titulo} (${m.tipo}, ${m.detalle})`,
      `  Descargar el PDF: ${absoluta(m.archivo)}`,
      `  Ficha${m.montaje ? ' y cómo montarlo' : ''}: ${absoluta(m.ficha)}`,
      '',
    ]),
    ...(varios ? [`Todo junto, en un ZIP: ${todoJunto}`, ''] : []),
    despedida,
    ...(boletin === 'enviado' ? ['', avisoBoletin] : []),
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

/** Correo que pide confirmar el alta en el boletín. Sin pulsar su botón, nadie entra en la lista. */
export function correoConfirmacion({ base, correo, nombre, enlace }) {
  const asunto = 'Confirma tu alta en el boletín de IdEducando';
  const saludo = nombre ? `Hola, ${nombre}:` : 'Hola:';
  const explicacion = 'Has pedido recibir el boletín de IdEducando, con material nuevo y novedades de oposiciones.';
  const caduca = 'El enlace vale 7 días.';
  const siNo = 'Si no lo has pedido tú, no hagas nada: sin confirmar no te apuntamos y no te volveremos a escribir.';
  const { html: pieHtml, texto: pieTexto } = pie(
    base,
    'Te escribimos porque alguien ha pedido el boletín con esta dirección en nuestra web.',
  );

  const contenido = [
    parrafo(escapar(saludo)),
    parrafo(escapar(explicacion)),
    parrafo('Para apuntarte, pulsa el botón:', '0 0 10px'),
    boton(enlace, 'Sí, quiero el boletín'),
    parrafo(escapar(caduca), '16px 0 14px'),
    parrafo(escapar(siNo), '0'),
  ].join('\n');

  const texto = [
    saludo,
    '',
    explicacion,
    '',
    `Para apuntarte, abre este enlace y pulsa «Sí, quiero el boletín»: ${enlace}`,
    caduca,
    '',
    siNo,
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
      resumen: 'Un clic y listo. Sin confirmar, no te apuntamos.',
      contenido,
      pie: pieHtml,
    }),
    textContent: texto,
    tags: ['boletin'],
  };
}
