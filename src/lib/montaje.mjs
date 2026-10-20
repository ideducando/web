// Instrucciones de montaje de los materiales, al estilo de un manual de IKEA.
//
// Los datos salen de la ficha de cada material (src/content/materiales/*.md):
//   necesitas  → lo que hay que tener o comprar, con cantidad y medida exactas («20 círculos de velcro…»)
//   imprimir   → qué páginas se imprimen, en qué papel y cómo
//   pasos      → los pasos, en orden, hasta tener el material terminado
//   cuidados   → consejos para que dure y avisos de seguridad
//   resultado  → lo que tendrás al terminar
//
// La ficha de la web los enseña en «Cómo montarlo» y herramientas/generar.mjs los pone en la
// página 2 del PDF. Como los dos usan este archivo, la web y el PDF dicen siempre lo mismo.
// Es JavaScript sin tipos para que lo puedan leer Astro y Node sin compilar nada.

/** Iconos de trazo (24 × 24), dibujados para IdEducando. Son decorativos: el texto dice lo mismo. */
export const ICONOS = {
  impresora:
    '<path d="M7 9V3h10v6"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/><path d="M17.5 12h.01"/>',
  papel: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 15h6M9 18h4"/>',
  plastificar:
    '<rect x="3.5" y="2.5" width="17" height="19" rx="2.5"/><path d="M7 6h10v12H7z"/><path d="M15.5 3.5l3 3"/>',
  velcro:
    '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 9.5a1.2 1.2 0 1 1 1.2 1.2M13 8.5a1.2 1.2 0 1 1 1.2 1.2M8.5 14a1.2 1.2 0 1 1 1.2 1.2M13.5 13.5a1.2 1.2 0 1 1 1.2 1.2"/>',
  tijeras:
    '<circle cx="6" cy="6.5" r="3"/><circle cx="6" cy="17.5" r="3"/><path d="M8.6 8.2L20 18M8.6 15.8L20 6"/>',
  perforadora: '<path d="M5 3h14v18H5z"/><circle cx="12" cy="8" r="2"/><path d="M9 14h6M9 17h6"/>',
  anilla: '<circle cx="12" cy="13.5" r="6.5"/><path d="M10 4.5h4v3h-4z"/>',
  pegamento:
    '<path d="M9.5 9V6a2.5 2.5 0 0 1 5 0v3"/><rect x="8" y="9" width="8" height="12" rx="1.5"/><path d="M8 13h8"/>',
  cinta: '<circle cx="11" cy="11" r="7.5"/><circle cx="11" cy="11" r="3"/><path d="M18 13.5L21 21h-5.5"/>',
  pinza: '<path d="M9.5 3h5L13 21h-2z"/><path d="M9 10.5h6"/><circle cx="12" cy="10.5" r="1.3"/>',
  encuadernador: '<circle cx="12" cy="6.5" r="3.5"/><path d="M11 10L9.5 21M13 10l1.5 11"/>',
  rotulador: '<path d="M14.5 4.5l5 5L9 20H4v-5z"/><path d="M12.5 6.5l5 5"/>',
  grapadora: '<path d="M3 18h18"/><path d="M4 18v-3h15l1 3"/><path d="M6 15l11-5.5a1 1 0 0 1 1.4.6L19 12"/>',
  iman: '<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4z"/><path d="M6 8h4M14 8h4"/>',
  reloj:
    '<path d="M7 3h10M7 21h10"/><path d="M8 3v2a4 4 0 0 0 1.6 3.2L12 10l2.4-1.8A4 4 0 0 0 16 5V3"/><path d="M8 21v-2a4 4 0 0 1 1.6-3.2L12 14l2.4 1.8A4 4 0 0 1 16 19v2"/>',
  foto: '<rect x="3" y="6.5" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6.5l1.5-2.5h4l1.5 2.5"/>',
  doblar: '<path d="M4 6h16v12H4z"/><path d="M12 6v12" stroke-dasharray="2 2"/><path d="M15 10l2 2-2 2"/>',
  colgar: '<path d="M9 3h6l-1 5 3 3H7l3-3z"/><path d="M12 11v10"/>',
  guardar: '<path d="M3 6.5h18v12H3z"/><path d="M3 6.5l9 7 9-7"/>',
  objeto: '<path d="M3 7.5l9-4 9 4v9l-9 4-9-4z"/><path d="M3 7.5l9 4 9-4M12 11.5v9"/>',
};

// Palabras que deciden el icono. Gana la que aparece antes en la frase: «4 hojas de cartulina
// (si tu impresora no la admite…)» es papel y no impresora. Si dos empiezan en el mismo sitio,
// gana la primera de esta lista.
const PALABRAS = [
  ['velcro', /velcro/],
  ['plastificar', /plastific/],
  ['impresora', /impresora|imprim/],
  ['tijeras', /tijera|recort|guillotina/],
  ['perforadora', /perfor|taladr|agujero/],
  ['anilla', /anilla|llavero/],
  ['pinza', /pinza/],
  ['encuadernador', /encuadernador/],
  ['grapadora', /grap/],
  ['iman', /iman/],
  ['cinta', /cinta|celo|doble cara/],
  ['pegamento', /pegamento|cola blanca|\bpega\b/],
  ['rotulador', /rotulador|lapiz|lapices|boli|ceras|colores|rellena|escribe/],
  ['reloj', /reloj|temporizador|cronometro/],
  ['foto', /foto/],
  ['doblar', /dobla|pliega/],
  ['papel', /cartulina|folio|papel|hoja/],
  ['colgar', /cuelga|colgar|pared|chincheta|coloca|\bpon\b/],
  ['guardar', /guarda|sobre|caja|bolsa/],
];

const sinTildes = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// «Antes de plastificar, rellena…» o «Si quieres cambiarla, pega…»: lo que cuenta es la acción
// que viene después de la coma, no la frase que la introduce.
const INTRODUCCION = /^(antes de|despues de|si |cuando |para |con |sin )[^,]{0,90},\s*/;

/** Nombre del icono que mejor encaja con una frase. */
export function iconoPara(texto) {
  const limpio = sinTildes(texto).replace(INTRODUCCION, '');
  // Un paso con velcro siempre lleva su icono, aunque empiece por «pega» o por «coloca».
  if (/velcro/.test(limpio)) return 'velcro';
  let mejor = ['objeto', Infinity];
  for (const [nombre, patron] of PALABRAS) {
    const sitio = limpio.search(patron);
    if (sitio >= 0 && sitio < mejor[1]) mejor = [nombre, sitio];
  }
  return mejor[0];
}

/** «20 círculos de velcro» → { cantidad: '20', resto: 'círculos de velcro' }. Sin número, cantidad vacía. */
export function separarCantidad(texto) {
  const partes = texto.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/s);
  return partes ? { cantidad: partes[1], resto: partes[2] } : { cantidad: '', resto: texto };
}

/** ¿Hay que explicar cómo se usa el velcro? Sale cuando algo de la lista lo lleva. */
export const llevaVelcro = (datos) => (datos.necesitas ?? []).some((n) => /velcro/i.test(n));

/** Criterio común de todos los materiales: así las tarjetas de uno sirven en los demás. */
export const CRITERIO_VELCRO =
  'En todos los materiales de IdEducando, la parte rugosa del velcro va en la base (tablero, agenda o tira) y la suave, en las tarjetas que se mueven. Así las tarjetas de un material se pegan en los demás. Si en tu centro ya usáis el criterio contrario, seguid con el vuestro.';

/** El SVG completo de un icono. */
export function svgIcono(nombre, clase = '') {
  const trazo = ICONOS[nombre] ?? ICONOS.objeto;
  return `<svg class="${clase}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${trazo}</svg>`;
}

/** ¿La ficha trae instrucciones de montaje? */
export const tieneMontaje = (datos) => (datos.pasos ?? []).length > 0;

const escapar = (texto) =>
  String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Página «Cómo montarlo» del PDF. Usa los estilos .montaje de herramientas/pdf/comun.css.
 * generar.mjs la pone en el hueco <section class="montaje" data-montaje></section> del HTML.
 */
export function hojaMontaje(datos) {
  const necesitas = datos.necesitas ?? [];
  const imprimir = datos.imprimir ?? [];
  const pasos = datos.pasos ?? [];
  const cuidados = datos.cuidados ?? [];

  const piezas = necesitas
    .map((n) => {
      const { cantidad, resto } = separarCantidad(n);
      return `<li>${svgIcono(iconoPara(n), 'montaje__icono')}<span class="montaje__cantidad">${escapar(cantidad)}</span><span>${escapar(resto)}</span></li>`;
    })
    .join('');

  const hojas = imprimir.map((i) => `<li>${svgIcono('papel', 'montaje__icono-mini')}<span>${escapar(i)}</span></li>`).join('');

  const lista = pasos
    .map(
      (p, i) =>
        `<li><span class="montaje__numero">${i + 1}</span>${svgIcono(iconoPara(p), 'montaje__icono')}<p>${escapar(p)}</p></li>`,
    )
    .join('');

  return `<section class="montaje" data-montaje>
  <p class="antetitulo">Antes de empezar</p>
  <h1>Cómo montarlo</h1>
  <p class="montaje__intro">${svgIcono('reloj', 'montaje__icono-mini')}<span>${
    datos.tiempo ? `<strong>Tiempo:</strong> ${escapar(datos.tiempo)}. ` : ''
  }Estas instrucciones también están en la ficha del material, en ideducando.es.</span></p>
  <div class="montaje__columnas">
    <div>
      ${piezas ? `<h2>Lo que necesitas</h2><ul class="montaje__piezas">${piezas}</ul>` : ''}
      ${llevaVelcro(datos) ? `<p class="montaje__velcro">${svgIcono('velcro', 'montaje__icono-mini')}<span>${escapar(CRITERIO_VELCRO)}</span></p>` : ''}
      ${hojas ? `<h2>Qué imprimir</h2><ul class="montaje__imprimir">${hojas}</ul>` : ''}
    </div>
    <div>
      <h2>Paso a paso</h2>
      <ol class="montaje__pasos">${lista}</ol>
      ${datos.resultado ? `<p class="montaje__resultado"><strong>Al terminar tendrás:</strong> ${escapar(datos.resultado)}</p>` : ''}
    </div>
  </div>
  ${
    cuidados.length
      ? `<div class="caja caja--verde montaje__cuidados"><h3>Para que dure y sea seguro</h3><ul>${cuidados
          .map((c) => `<li>${escapar(c)}</li>`)
          .join('')}</ul></div>`
      : ''
  }
</section>`;
}
