// Escalera de habilidades específicas de Pedagogía Terapéutica (PT) y Audición y Lenguaje (AL).
// Banco propio de IdEducando para elegir, redactar y seguir las habilidades del PAP en la Región de Murcia.
//
// Construye el HTML del PDF con las áreas y las habilidades de escalera-habilidades-datos.mjs. Lo llama
// generar.mjs antes de imprimir (entrada «escalera-habilidades-pt-al») y escribe
// pdf/escalera-habilidades-pt-al.generado.html, que no se sube al repositorio.
//
// Diseño e iconos propios, en A4 apaisado: portada, cómo usarla, el mapa de las áreas, una página por área
// (primero las de PT y después las de AL), la hoja de seguimiento y las fuentes. Cada hoja mide lo mismo que
// el hueco de la página (189 mm de alto) y recorta lo que se salga: si un área crece, hay que comprobar que
// su tabla sigue cabiendo.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AREAS, PELDANOS } from './escalera-habilidades-datos.mjs';

// Color de cada área: [bordes e icono, fondo claro, texto sobre el color, fondo de los textos pequeños].
// Los textos pequeños en blanco (el código de cada habilidad y el número del peldaño) necesitan 4,5:1 de
// contraste. Con el verde (3,1:1) y el coral (3,6:1) no llegan, así que detrás de esos textos se oscurecen
// lo justo: #198461 (4,65:1) y #CA4A36 (4,62:1). Los demás colores ya llegan y se usan tal cual.
const COLORES = {
  azul: ['#2F6FD6', '#e4edfb', '#fff'],
  verde: ['#1FA67A', '#dcf3ea', '#fff', '#198461'],
  coral: ['#E8553E', '#fde5e0', '#fff', '#CA4A36'],
  morado: ['#8C4FB8', '#efe5f7', '#fff'],
  naranja: ['#F5961F', '#fde8cf', '#1E2B55'],
  amarillo: ['#F6C12E', '#fdf0c7', '#1E2B55'],
  marino: ['#1E2B55', '#e8eaf2', '#fff'],
};

const colores = (a) => {
  const [c, t, tx, cf = c] = COLORES[a.color];
  return { c, tx, estilo: `--c:${c};--t:${t};--tx:${tx};--cf:${cf}` };
};

const e = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- Iconos propios (24 × 24, trazo) ----------
const ICONOS = {
  ojo: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lista: '<path d="M10 6h11M10 12h11M10 18h11"/><path d="M3 6l1.5 1.5L7.5 4.5M3 12l1.5 1.5 3-3M3 18l1.5 1.5 3-3"/>',
  mochila: '<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7M5 13h14M10 16.5h4"/>',
  corazon: '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.6 4.5 6.8 4.5c2 0 3.6 1.2 5.2 3.2 1.6-2 3.2-3.2 5.2-3.2 3.2 0 5.1 3.1 4 6.2C19.5 15.4 12 20 12 20z"/>',
  lapiz: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>',
  numeros: '<path d="M6.5 7.5v9M2 12h9M14 9.5h7.5M14 14.5h7.5"/>',
  sonido: '<path d="M3 9.5v5h4l5 4v-13l-5 4H3z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.5 6.2a8 8 0 0 1 0 11.6"/>',
  bocadillos: '<path d="M3 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-4 3v-3H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M18 9h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-4a2 2 0 0 1-2-2v-1"/>',
  tablero: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
  pregunta: '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.3a2.9 2.9 0 1 1 4.3 2.5c-.9.5-1.5 1.2-1.5 2.3v.4"/><path d="M12 17.4v.2"/>',
  bocadillo: '<path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"/>',
  boca: '<path d="M2.5 12c2.5-3.2 5-4.5 6.5-4.5 1.2 0 2.2.8 3 .8s1.8-.8 3-.8c1.5 0 4 1.3 6.5 4.5-2.8 3.6-6 5-9.5 5S5.3 15.6 2.5 12z"/><path d="M2.5 12h19"/>',
  personas: '<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 20c.6-3.4 2.8-5.5 5.5-5.5s4.9 2.1 5.5 5.5M13.6 15.2c.9-.6 1.9-.9 3-.9 2.3 0 4.1 1.8 4.6 4.7"/>',
};
const icono = (nombre, color = 'currentColor', grosor = 2) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre]}</svg>`;

// La estrella de «lo generaliza» dentro del texto. Ninguna letra de la marca tiene el signo ★, y Chromium lo
// pintaba con una letra del sistema, engrosada porque el texto va en negrita. Aquí va dibujada con la forma,
// el grosor, el tamaño y el sitio de ese signo, para que el PDF lleve solo las letras de la marca. Las medidas
// están en unidades de letra (2048 por cada em) y el CSS de .estrella las pasa a em. Toma el color del texto.
// El role="img" con su nombre va en el trazo, que es lo que se pinta: así Chromium lo etiqueta en el PDF como
// una imagen con texto alternativo y los lectores de pantalla leen «estrella».
const ESTRELLA =
  '<span class="estrella"><svg viewBox="46 -1816 2048 2048"><path role="img" aria-label="estrella" ' +
  'd="M1070 -382L1620 14L1404 -632L1954 -1030H1280L1070 -1676L862 -1030H186L738 -632L520 14Z" fill="currentColor" stroke="currentColor" stroke-width="70"/></svg></span>';

// ---------- La escalera de ayudas: F, M, P, S y la estrella ----------
const estrella = (cx, cy, r, ri) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 ? ri : r;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(ang)).toFixed(2)} ${(cy + rad * Math.sin(ang)).toFixed(2)}`;
  }
  return `${d}Z`;
};
const LETRAS = ['F', 'M', 'P', 'S'];
function escalera(color, escala = 1) {
  const ancho = 30;
  const alto = 8.2;
  const paso = 5.3;
  const hueco = 0.55;
  const alturas = [3.4, 4.7, 6, 7.3];
  let svg = `<svg class="escalera" viewBox="0 0 ${ancho} ${alto}" width="${(ancho * escala).toFixed(2)}mm" height="${(alto * escala).toFixed(2)}mm" aria-hidden="true">`;
  LETRAS.forEach((letra, i) => {
    const x = 0.3 + i * (paso + hueco);
    const h = alturas[i];
    const y = alto - 0.3 - h;
    svg += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${paso}" height="${h}" rx="0.7" fill="#fff" stroke="${color}" stroke-width="0.4"/>`;
    svg += `<text x="${(x + paso / 2).toFixed(2)}" y="${(alto - 1.05).toFixed(2)}" text-anchor="middle" font-size="2.4" font-family="Outfit" font-weight="700" fill="#1E2B55">${letra}</text>`;
  });
  const cx = 0.3 + 4 * (paso + hueco) + 2.75;
  svg += `<path d="${estrella(cx, 3.1, 2.8, 1.25)}" fill="#fff" stroke="${color}" stroke-width="0.4" stroke-linejoin="round"/>`;
  return `${svg}</svg>`;
}

// ---------- Páginas ----------
const total = AREAS.reduce((n, a) => n + a.peldanos.flat().length, 0);
const areasDe = (parte) => AREAS.filter((a) => a.parte === parte);
const PT = areasDe('Pedagogía Terapéutica');
const AL = areasDe('Audición y Lenguaje');

function portada() {
  const escalones = ['#2F6FD6', '#1FA67A', '#F6C12E', '#E8553E', '#8C4FB8']
    .map((c, i) => `<rect x="${20 + i * 46}" y="${200 - (i + 1) * 34}" width="46" height="${(i + 1) * 34}" rx="6" fill="${c}"/>`)
    .join('');
  // La P va en marino: en blanco, sobre el escalón amarillo, se leía mal (1,7:1; con marino, 8,2:1).
  // Es lo mismo que hacen las páginas de las áreas amarillas y naranjas.
  const letras = ['F', 'M', 'P', 'S']
    .map(
      (l, i) =>
        `<text x="${43 + i * 46}" y="${200 - (i + 1) * 34 + 26}" text-anchor="middle" font-family="Outfit" font-weight="900" font-size="20" fill="${i === 2 ? '#1E2B55' : '#fff'}">${l}</text>`,
    )
    .join('');
  return `<section class="portada" data-miniatura>
  <div class="portada__texto">
    <p class="portada__ante">Pedagogía Terapéutica y Audición y Lenguaje</p>
    <h1>Escalera de habilidades específicas</h1>
    <p class="portada__sub">Para elegir, redactar y seguir las habilidades del PAP (Plan de Actuación Personalizado) en la Región de Murcia.</p>
    <ul class="portada__lista">
      <li><strong>${total} habilidades</strong> en ${AREAS.length} áreas, cada una en tres peldaños.</li>
      <li><strong>Una escalera de ayudas</strong> para ver cuánto avanza cada trimestre.</li>
      <li><strong>Una hoja de seguimiento</strong> para cada alumno o alumna.</li>
    </ul>
    <img class="portada__logo" src="../../marca/09-logo-horizontal-transparente.png" alt="IdEducando" />
  </div>
  <div class="portada__dibujo" aria-hidden="true">
    <svg viewBox="0 0 280 230">
      <path d="M8 200h264" stroke="#1E2B55" stroke-width="3" stroke-linecap="round"/>
      ${escalones}${letras}
      <path d="${estrella(250, 22, 20, 9)}" fill="#F6C12E" stroke="#1E2B55" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 150c40-30 90-60 150-95" fill="none" stroke="#1E2B55" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>
    </svg>
  </div>
  <p class="portada__licencia">IdEducando · Todos los derechos reservados · ideducando.es</p>
</section>`;
}

function guia() {
  const pasos = [
    ['F', 'Con ayuda física', 'Lo hace si le guiamos las manos o el cuerpo.'],
    ['M', 'Con modelo', 'Lo hace después de vernos hacerlo.'],
    ['P', 'Con pista', 'Le basta una palabra, un gesto o una imagen.'],
    ['S', 'Sin ayuda', 'Lo hace por su cuenta en la situación en que lo trabajamos.'],
    [ESTRELLA, 'Lo generaliza', 'Lo hace también en otros sitios, con otras personas o materiales.'],
  ];
  return `<section class="hoja guia">
  <div class="rayos"></div>
  <p class="antetitulo">Antes de empezar</p>
  <h1>Cómo usar la escalera</h1>
  <div class="guia__columnas">
    <div>
      <p>El PAP (Plan de Actuación Personalizado) recoge la respuesta educativa de cada alumno o alumna con necesidades específicas de apoyo educativo. En la Región de Murcia lo regula la Resolución de 20 de noviembre de 2023. En él, los especialistas de Pedagogía Terapéutica (PT) y de Audición y Lenguaje (AL) concretan las habilidades específicas que trabajan.</p>
      <p>Esta escalera es un banco para elegirlas. Tiene ${total} habilidades en ${AREAS.length} áreas: ${PT.length} de PT y ${AL.length} de AL. En cada área, las habilidades suben en tres peldaños: <strong>primeros pasos</strong>, <strong>avanzando</strong> y <strong>lo consolida</strong>. Cada una tiene un código (por ejemplo, AT-05) para copiarla en el PAP.</p>
      <h2>Paso a paso</h2>
      <ol>
        <li>Parte de la evaluación psicopedagógica y de lo que observas en el aula.</li>
        <li>Elige pocas habilidades y bien elegidas: entre seis y diez por especialista suele ser manejable.</li>
        <li>Ajusta cada una al alumno o la alumna: añade la situación y el criterio de logro.</li>
        <li>Escríbelas en la hoja de seguimiento, con su código.</li>
        <li>Al final de cada trimestre, colorea el peldaño más alto que ha alcanzado y pásalo al PAP.</li>
      </ol>
      <div class="caja caja--verde">
        <h3>Para redactar una habilidad nueva</h3>
        <p>Una acción que se vea, la situación y el criterio. Por ejemplo: «Pide ayuda con una tarjeta cuando se atasca en una ficha, en cuatro de cada cinco ocasiones».</p>
      </div>
    </div>
    <div>
      <h2>La escalera de ayudas</h2>
      <p>Saber si lo consigue no basta: interesa con cuánta ayuda. Cada trimestre, colorea el peldaño más alto que alcanza.</p>
      <div class="leyenda-grande">${escalera('#8C4FB8', 2)}</div>
      <ul class="pasos-ayuda">${pasos.map(([l, t, d]) => `<li><span class="letra">${l}</span><strong>${t}.</strong> ${d}</li>`).join('')}</ul>
      <div class="caja caja--amarilla">
        <h3>Si el PAP pide conseguido, en proceso o no conseguido</h3>
        <p>Una equivalencia posible: <strong>S</strong> y <strong>${ESTRELLA}</strong>, conseguido; <strong>M</strong> y <strong>P</strong>, en proceso; <strong>F</strong> o sin empezar, no conseguido. Acordadla en el centro y usadla siempre igual.</p>
      </div>
    </div>
  </div>
</section>`;
}

function tarjetaArea(a) {
  const { tx, estilo } = colores(a);
  const n = a.peldanos.flat().length;
  return `<div class="mapa__area" style="${estilo}">
    <span class="mapa__icono">${icono(a.icono, tx)}</span>
    <div>
      <p class="mapa__nombre"><span class="codigo-mini">${a.codigo}</span>${e(a.nombre)}</p>
      <p class="mapa__desc">${e(a.desc)}</p>
      <p class="mapa__n">${n} habilidades</p>
    </div>
  </div>`;
}

function mapa() {
  return `<section class="hoja mapa">
  <div class="rayos"></div>
  <p class="antetitulo">De un vistazo</p>
  <h1>Las ${AREAS.length} áreas</h1>
  <div class="mapa__partes">
    <div class="mapa__parte">
      <h2><span class="parte-etiqueta pt">PT</span> Pedagogía Terapéutica</h2>
      <div class="mapa__rejilla">${PT.map(tarjetaArea).join('')}</div>
      <div class="caja caja--azul mapa__codigos"><h3>Cómo se leen los códigos</h3><p>Dos letras para el área y un número para la habilidad: <strong>AT-05</strong> es la quinta habilidad de «Atención y percepción». Los números siguen el orden de los peldaños, de lo más sencillo a lo más autónomo.</p></div>
    </div>
    <div class="mapa__parte">
      <h2><span class="parte-etiqueta al">AL</span> Audición y Lenguaje</h2>
      <div class="mapa__rejilla">${AL.map(tarjetaArea).join('')}</div>
    </div>
  </div>
</section>`;
}

function paginaArea(a, i, lista) {
  const { c, tx, estilo } = colores(a);
  let n = 0;
  // Cada peldaño es un grupo de filas (tbody) con su título (scope="rowgroup"). Así el título del peldaño
  // acompaña solo a sus habilidades, y no a todas las de la tabla, en el PDF etiquetado.
  const grupos = a.peldanos
    .map((grupo, p) => {
      const cab = `<tr class="peldano"><th colspan="6" scope="rowgroup"><span class="peldano__num">${p + 1}</span>${PELDANOS[p]}</th></tr>`;
      const habilidades = grupo
        .map((texto) => {
          n += 1;
          const codigo = `${a.codigo}-${String(n).padStart(2, '0')}`;
          return `<tr><td class="codigo"><span>${codigo}</span></td><td class="texto">${e(texto)}</td>${[1, 2, 3]
            .map(() => `<td class="esc">${escalera(c, 0.9)}</td>`)
            .join('')}<td class="obs"></td></tr>`;
        })
        .join('');
      return `<tbody>${cab}${habilidades}</tbody>`;
    })
    .join('');
  const materiales = a.materiales.length
    ? `<p class="trabajar"><strong>Para trabajarlas, en IdEducando:</strong> ${a.materiales.map(e).join(' · ')}</p>`
    : '<p class="trabajar"></p>';
  return `<section class="hoja area" style="${estilo}">
  <header class="area__cab">
    <span class="area__icono">${icono(a.icono, tx, 1.9)}</span>
    <div class="area__tit">
      <p class="area__parte">${a.parte} · Área ${i + 1} de ${lista.length}</p>
      <h1>${e(a.nombre)}</h1>
      <p class="area__desc">${e(a.desc)}</p>
    </div>
    <div class="area__datos">
      <p><span class="etq">Alumno o alumna</span><span class="raya"></span></p>
      <p><span class="etq">Curso</span><span class="raya corta"></span><span class="etq">Especialista</span><span class="raya"></span></p>
    </div>
  </header>
  <div class="area__barra">
    ${materiales}
    <p class="leyenda-mini">${escalera(c, 0.72)}<span><b>F</b> física · <b>M</b> modelo · <b>P</b> pista · <b>S</b> sin ayuda · <b>${ESTRELLA}</b> generaliza</span></p>
  </div>
  <table class="banco">
    <colgroup><col class="c-codigo" /><col class="c-texto" /><col class="c-esc" /><col class="c-esc" /><col class="c-esc" /><col /></colgroup>
    <thead><tr><th scope="col">Código</th><th scope="col">Habilidad</th><th scope="col">1.er trimestre</th><th scope="col">2.º trimestre</th><th scope="col">3.er trimestre</th><th scope="col">Observaciones</th></tr></thead>
    ${grupos}
  </table>
</section>`;
}

function seguimiento() {
  const filas = Array.from({ length: 10 }, () => `<tr><td class="codigo-vacio"></td><td></td>${[1, 2, 3].map(() => `<td class="esc">${escalera('#46578C', 0.9)}</td>`).join('')}<td></td></tr>`).join('');
  return `<section class="hoja seguimiento">
  <div class="rayos"></div>
  <p class="antetitulo">Una por alumno o alumna y especialista</p>
  <h1>Hoja de seguimiento</h1>
  <div class="seg__datos">
    <p><span class="etq">Alumno o alumna</span><span class="raya"></span></p>
    <p><span class="etq">Curso y grupo</span><span class="raya"></span></p>
    <p><span class="etq">Centro</span><span class="raya"></span></p>
    <p><span class="etq">Especialista</span><span class="opcion">PT</span><span class="opcion">AL</span><span class="raya"></span></p>
    <p><span class="etq">Curso escolar</span><span class="raya"></span></p>
  </div>
  <table class="banco banco--seg">
    <colgroup><col class="c-codigo" /><col class="c-texto" /><col class="c-esc" /><col class="c-esc" /><col class="c-esc" /><col /></colgroup>
    <thead><tr><th scope="col">Código</th><th scope="col">Habilidad, con su situación y su criterio</th><th scope="col">1.er trimestre</th><th scope="col">2.º trimestre</th><th scope="col">3.er trimestre</th><th scope="col">Observaciones</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <p class="seg__nota"><b>F</b> con ayuda física · <b>M</b> con modelo · <b>P</b> con pista · <b>S</b> sin ayuda · <b>${ESTRELLA}</b> lo generaliza. Colorea el peldaño más alto que alcanza en cada trimestre.</p>
</section>`;
}

function fuentesPagina() {
  const refs = [
    'Resolución de 20 de noviembre de 2023, de la Dirección General de Atención a la Diversidad, sobre los planes de actuación personalizados (PAP). Región de Murcia.',
    'Decreto 196/2022, de 3 de noviembre, por el que se establece el currículo de la etapa de Educación Infantil en la Comunidad Autónoma de la Región de Murcia. BORM n.º 255, de 4 de noviembre de 2022.',
    'Decreto n.º 209/2022, de 17 de noviembre, de ordenación y currículo de la Educación Primaria en la Región de Murcia. BORM n.º 267, de 18 de noviembre de 2022.',
    'Diamond, A. (2013). Executive functions. <em>Annual Review of Psychology</em>, 64, 135-168. DOI: 10.1146/annurev-psych-113011-143750.',
    'Bloom, L. y Lahey, M. (1978). <em>Language development and language disorders</em>. Nueva York: Wiley.',
    'Beukelman, D. R. y Light, J. C. (2020). <em>Augmentative and alternative communication: Supporting children and adults with complex communication needs</em> (5.ª ed.). Baltimore: Paul H. Brookes.',
    'Hume, K. y otros (2021). Evidence-based practices for children, youth, and young adults with autism: Third generation review. <em>Journal of Autism and Developmental Disorders</em>, 51(11), 4013-4032. DOI: 10.1007/s10803-020-04844-2.',
    'Stokes, T. F. y Baer, D. M. (1977). An implicit technology of generalization. <em>Journal of Applied Behavior Analysis</em>, 10(2), 349-367. DOI: 10.1901/jaba.1977.10-349.',
    'CAST (2024). <em>Universal Design for Learning Guidelines</em> version 3.0. udlguidelines.cast.org.',
  ];
  return `<section class="hoja fuentes">
  <div class="rayos"></div>
  <p class="antetitulo">Fuentes y créditos</p>
  <h1>De dónde sale esta escalera</h1>
  <div class="fuentes__columnas">
    <div>
      <p>Las áreas, el orden y los textos de las habilidades son propios del equipo de IdEducando. Se han escrito a partir del currículo de Infantil y de Primaria de la Región de Murcia y de modelos clásicos: las funciones ejecutivas (Diamond, 2013), la forma, el contenido y el uso del lenguaje (Bloom y Lahey, 1978) y la comunicación aumentativa y alternativa (Beukelman y Light, 2020).</p>
      <p>La escalera de ayudas se apoya en las ayudas o <em>prompting</em>, una práctica basada en la evidencia (Hume y otros, 2021), y en la idea de que una habilidad está aprendida cuando se usa fuera de donde se enseñó (Stokes y Baer, 1977).</p>
      <p>Es un punto de partida: cada habilidad se ajusta a cada alumno o alumna, y la escalera crece con lo que propongáis.</p>
    </div>
    <ul class="referencias">${refs.map((r) => `<li>${r}</li>`).join('')}</ul>
  </div>
  <div class="creditos">
    <p><strong>Escalera de habilidades específicas: Pedagogía Terapéutica y Audición y Lenguaje.</strong> Equipo IdEducando, noviembre de 2026. <span class="url">ideducando.es</span></p>
    <p>© IdEducando, 2026. Todos los derechos reservados. Puedes imprimirla y fotocopiarla para usarla en el aula o en casa tantas veces como quieras. No se puede compartir el archivo, subirlo a otra web ni venderlo: para recomendarla, comparte el enlace de su ficha en ideducando.es.</p>
  </div>
</section>`;
}

function documento() {
  return `<!doctype html>
<html lang="es-ES"><head><meta charset="utf-8" />
<title>Escalera de habilidades específicas: Pedagogía Terapéutica y Audición y Lenguaje · IdEducando</title>
<meta name="author" content="IdEducando" />
<link rel="stylesheet" href="comun.css" />
<style>
@font-face { font-family: 'Outfit'; font-weight: 800; src: url('../../node_modules/@fontsource/outfit/files/outfit-latin-800-normal.woff2') format('woff2'); }
@font-face { font-family: 'Outfit'; font-weight: 900; src: url('../../node_modules/@fontsource/outfit/files/outfit-latin-900-normal.woff2') format('woff2'); }
/* Sin pictogramas de ARASAAC: todos los derechos reservados (José, 28/10/2026). */
@page { @bottom-left { content: 'IdEducando · Todos los derechos reservados · ideducando.es'; } }
@page hoja { size: A4 landscape; margin: 8mm 9mm 13mm 9mm; }
@page tapa { size: A4 landscape; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
/* Chromium no siempre aplica a la primera hoja el margen cero de la portada cuando lleva imágenes, y la
   portada sale corrida hacia abajo y a la derecha. Esta regla lo asegura. */
@page :first { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
.hoja { page: hoja; break-after: page; height: 189mm; display: flex; flex-direction: column; overflow: hidden; }
.hoja:last-child { break-after: auto; }
.rayos { flex: none; margin-bottom: 3.5mm; }
.hoja h1 { margin: 0 0 3mm; font-size: 24pt; }
.antetitulo { margin-bottom: 1.2mm; }

/* La estrella dibujada (ESTRELLA) ocupa lo mismo que el signo ★ al que sustituye: el mismo ancho (2140 de 2048)
   y la línea de base en su sitio. El margen de arriba, negativo, evita que una línea con interlineado 1 crezca. */
.estrella svg { width: 1em; height: 1em; margin: -.02em .0225em 0; vertical-align: -.1133em; }

/* ---------- Portada ---------- */
.portada { page: tapa; break-after: page; width: 297mm; height: 210mm; overflow: hidden; background: var(--crema); display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; padding: 0 16mm 0 20mm; gap: 8mm; position: relative; }
.portada::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 5mm; background: linear-gradient(90deg, var(--azul) 0 20%, var(--verde) 20% 40%, var(--amarillo) 40% 60%, var(--coral) 60% 80%, var(--morado) 80% 100%); }
.portada__ante { margin: 0 0 3mm; font-family: var(--titulos); font-weight: 700; font-size: 12pt; letter-spacing: .08em; text-transform: uppercase; color: var(--morado-texto); }
.portada h1 { margin: 0 0 5mm; font-family: var(--titulos); font-weight: 900; font-size: 40pt; line-height: 1.02; }
.portada__sub { margin: 0 0 6mm; font-size: 13pt; line-height: 1.4; color: var(--suave); }
.portada__lista { margin: 0 0 9mm; padding: 0; list-style: none; font-size: 12pt; }
.portada__lista li { margin: 0 0 2.4mm; padding-left: 7mm; position: relative; }
.portada__lista li::before { content: ''; position: absolute; left: 0; top: 1.6mm; width: 3.4mm; height: 3.4mm; border-radius: 1mm; background: var(--amarillo); }
.portada__logo { height: 16mm; width: auto; display: block; }
.portada__dibujo svg { width: 100%; height: auto; display: block; }
/* La portada no tiene márgenes y no le cabe el pie de @page: lleva el mismo pie dentro, en el mismo sitio
   y con la misma letra que el de las demás hojas (allí cae 1 px más abajo de lo que dicen sus medidas:
   13 mm de margen y 5 mm de relleno). */
.portada__licencia { position: absolute; left: 9mm; top: calc(202mm + 1px); margin: 0; font-size: 8pt; line-height: normal; color: var(--suave); }

/* ---------- Guía ---------- */
.guia__columnas { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 9mm; font-size: 11pt; line-height: 1.4; }
.guia h2 { font-size: 14pt; margin: 3mm 0 1.5mm; }
.guia__columnas > div > h2:first-child { margin-top: 0; }
.guia p { margin: 0 0 2.4mm; }
.guia ol { margin: 0 0 3mm; }
.guia li { margin-bottom: 1mm; }
.guia .caja { padding: 2.6mm 4mm; margin: 0 0 3mm; }
.guia .caja h3 { font-size: 11.5pt; margin: 0 0 1mm; }
.leyenda-grande { margin: 1mm 0 2mm; }
.pasos-ayuda { list-style: none; margin: 0 0 3mm; padding: 0; }
.pasos-ayuda li { margin: 0 0 1.4mm; padding-left: 9mm; position: relative; }
.pasos-ayuda .letra { position: absolute; left: 0; top: 0.2mm; width: 6.4mm; height: 6.4mm; border-radius: 50%; background: var(--morado); color: #fff; display: grid; place-items: center; font-family: var(--titulos); font-weight: 800; font-size: 10pt; line-height: 1; }

/* ---------- Mapa ---------- */
.mapa__partes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8mm; flex: 1; min-height: 0; }
.mapa__parte h2 { font-size: 14pt; margin: 0 0 2.4mm; display: flex; align-items: center; gap: 2mm; }
.parte-etiqueta { display: inline-grid; place-items: center; height: 7mm; padding: 0 2.4mm; border-radius: 1.6mm; color: #fff; font-size: 10.5pt; font-weight: 800; }
.parte-etiqueta.pt { background: var(--morado); }
.parte-etiqueta.al { background: var(--azul); }
.mapa__rejilla { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2.6mm; }
.mapa__area { display: grid; grid-template-columns: 13mm minmax(0, 1fr); gap: 2.6mm; align-items: start; background: var(--t); border: .5mm solid var(--c); border-radius: 3mm; padding: 2.6mm; min-height: 31mm; }
.mapa__icono { width: 13mm; height: 13mm; border-radius: 3mm; background: var(--c); display: grid; place-items: center; }
.mapa__icono svg { width: 8.6mm; height: 8.6mm; }
.mapa__nombre { margin: 0 0 1mm; font-family: var(--titulos); font-weight: 800; font-size: 11.5pt; line-height: 1.12; }
.codigo-mini { display: inline-block; margin-right: 1.6mm; padding: .3mm 1.4mm; border-radius: 1mm; background: var(--cf); color: var(--tx); font-size: 9pt; letter-spacing: .04em; vertical-align: .2mm; }
.mapa__desc { margin: 0 0 1mm; font-size: 10pt; line-height: 1.3; }
.mapa__n { margin: 0; font-size: 9pt; color: var(--suave); font-weight: 700; }
.mapa__codigos { margin: 3mm 0 0; padding: 2.6mm 4mm; font-size: 10.5pt; }
.mapa__codigos h3 { font-size: 11.5pt; margin: 0 0 1mm; }
.mapa__codigos p { margin: 0; }

/* ---------- Página de cada área ---------- */
.area__cab { flex: none; display: grid; grid-template-columns: 17mm minmax(0, 1fr) 86mm; gap: 4mm; align-items: center; margin-bottom: 1.8mm; }
.area__icono { width: 17mm; height: 17mm; border-radius: 4mm; background: var(--c); display: grid; place-items: center; }
.area__icono svg { width: 11mm; height: 11mm; }
.area__parte { margin: 0 0 .6mm; font-family: var(--titulos); font-weight: 700; font-size: 9.5pt; letter-spacing: .08em; text-transform: uppercase; color: var(--suave); }
.area h1 { margin: 0 0 .8mm; font-size: 22pt; line-height: 1.05; font-weight: 800; }
.area__desc { margin: 0; font-size: 11pt; color: var(--suave); }
.area__datos p, .seg__datos p { margin: 0 0 2mm; display: flex; align-items: flex-end; gap: 2mm; font-size: 10pt; }
.etq { flex: none; font-weight: 700; }
.raya { flex: 1; min-width: 12mm; height: 5mm; border-bottom: .35mm solid var(--suave); }
.raya.corta { flex: 0 0 16mm; }
.area__barra { flex: none; display: flex; justify-content: space-between; align-items: center; gap: 6mm; margin-bottom: 1.6mm; padding: 1.2mm 3mm; border-radius: 2.4mm; background: var(--t); }
.trabajar { margin: 0; font-size: 10pt; }
.leyenda-mini { margin: 0; display: flex; align-items: center; gap: 2mm; font-size: 9pt; white-space: nowrap; }
table.banco { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0; font-size: 11pt; }
.banco col.c-codigo { width: 16mm; }
.banco col.c-texto { width: 128mm; }
.banco col.c-esc { width: 30mm; }
.banco thead th { background: var(--marino); color: #fff; font-family: var(--titulos); font-weight: 700; font-size: 9.5pt; padding: 1.4mm 2mm; text-align: left; vertical-align: middle; border: 0; }
.banco thead th:first-child { border-radius: 2mm 0 0 0; }
.banco thead th:last-child { border-radius: 0 2mm 0 0; }
.banco tr.peldano th { background: var(--t); color: var(--marino); font-family: var(--titulos); font-weight: 800; font-size: 10pt; padding: .5mm 2mm; border-bottom: .35mm solid var(--c); text-align: left; }
.peldano__num { display: inline-grid; place-items: center; width: 5mm; height: 5mm; margin-right: 1.8mm; border-radius: 50%; background: var(--cf); color: var(--tx); font-size: 9pt; line-height: 1; }
.banco td { padding: .8mm 2mm; border-bottom: .3mm solid var(--linea); vertical-align: middle; line-height: 1.22; }
.banco td.codigo span { display: inline-block; padding: .4mm 1.4mm; border-radius: 1.2mm; background: var(--cf); color: var(--tx); font-family: var(--titulos); font-weight: 800; font-size: 9.5pt; letter-spacing: .03em; white-space: nowrap; }
.banco td.esc { padding: .5mm 1mm; }
.banco td.esc svg { display: block; }
.banco td.obs { border-left: .3mm dashed var(--linea); }

/* ---------- Hoja de seguimiento ---------- */
.seg__datos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 6mm; margin-bottom: 2mm; }
.opcion { flex: none; display: inline-grid; place-items: center; width: 9mm; height: 5.6mm; border: .35mm solid var(--suave); border-radius: 1.2mm; font-weight: 700; font-size: 9.5pt; }
.banco--seg tbody tr { height: 12.6mm; }
.banco--seg td { border-bottom: .35mm solid #d9c7a4; }
.banco--seg td:nth-child(2), .banco--seg td:last-child { border-left: .3mm dashed var(--linea); }
.seg__nota { margin: 2mm 0 0; font-size: 9.5pt; color: var(--suave); }

/* ---------- Fuentes ---------- */
.fuentes__columnas { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: 9mm; font-size: 10.5pt; line-height: 1.4; }
.fuentes__columnas p { margin: 0 0 2.4mm; }
.referencias { margin: 0; padding-left: 5mm; font-size: 9.5pt; line-height: 1.35; }
.referencias li { margin-bottom: 1.4mm; }
.fuentes .creditos { margin-top: auto; }
</style></head><body>
${portada()}
${guia()}
${mapa()}
${PT.map((a, i) => paginaArea(a, i, PT)).join('\n')}
${AL.map((a, i) => paginaArea(a, i, AL)).join('\n')}
${seguimiento()}
${fuentesPagina()}
</body></html>`;
}

/** Escribe pdf/escalera-habilidades-pt-al.generado.html. `raiz` no hace falta: las rutas del HTML son relativas. */
export function generarEscalera(raiz, carpetaPdf) {
  writeFileSync(join(carpetaPdf, 'escalera-habilidades-pt-al.generado.html'), documento());
}
