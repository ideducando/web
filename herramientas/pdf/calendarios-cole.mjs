// Los cuatro calendarios del curso 2026-2027 en Cartagena (Educación Infantil y Primaria):
//   calendario-cole-2026-2027          un mes en cada hoja, de septiembre a junio
//   calendario-semanal-cole-2026-2027  una semana en cada hoja, de lunes a domingo
//   semana-de-apoyos-2026-2027         una hoja por semana de cole (PT, AL, asociación, terapias) y 42 tarjetas
//   semana-del-aula-2026-2027          una hoja por semana de cole con huecos grandes y 24 tarjetas grandes
// Se diseñaron con programas sueltos (noviembre de 2026) y se pasaron aquí sin cambiar su diseño.
//
// generar.mjs llama a generarCalendario(raiz, carpetaPdf, id) antes de imprimir, y esta función escribe
// pdf/<id>.generado.html, que no se sube al repositorio. Los cuatro comparten las fechas, los festivos,
// los colores, la cabecera y el pie. Las hojas del calendario son A4 apaisadas y sin márgenes: el pie, con
// la licencia, va dentro de cada hoja. La guía del final usa la hoja A4 vertical de comun.css.
// Si una palabra no cabe en su hueco, un <script> del propio HTML le baja la letra antes de imprimir.
//
// Fechas comprobadas en el BORM (Boletín Oficial de la Región de Murcia):
//  - Calendario escolar 2026-2027 (BORM n.º 132, 11/06/2026): Infantil y Primaria del 8/9/2026 al 22/6/2027;
//    Navidad del 24/12 al 6/1; Semana Santa del 22 al 29/3; patrón de Infantil y Primaria el 27/11/2026;
//    día no lectivo de la Dirección General el 23/12/2026. Cartagena: fiestas locales el 25/9/2026 y el 7/1/2027;
//    otros días no lectivos el 24/9/2026, el 8/1/2027 y el 8/2/2027.
//  - Fiestas laborales de 2026 (BORM n.º 163, 17/07/2025): 12/10, 7/12 (Constitución, trasladada del domingo 6),
//    8/12 y 25/12. El 1/11 cae en domingo y no se traslada: lo sustituye el 9/6/2026.
//  - Fiestas laborales de 2027 (BORM n.º 171, 27/07/2026): 1/1, 6/1, 19/3, 25/3, 26/3, 1/5 (sábado) y 9/6.
// Vuelto a mirar el 23/11/2026 en los PDF de borm.es. El calendario escolar es la Resolución de 8 de junio de
// 2026 de la Dirección General de Centros Educativos e Infraestructuras por la que se establece el período
// lectivo del curso escolar 2026-2027: anexo I en la pág. 13616 y Cartagena, en el anexo V, en la pág. 13622
// (los demás municipios también están en ese anexo). Las fiestas laborales son dos resoluciones de la
// Dirección General de Trabajo: págs. 19391 y 19392 (2026) y 18208 y 18209 (2027).
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Fechas y festivos
// ---------------------------------------------------------------------------

const INICIO_CURSO = '2026-09-08';
const FIN_CURSO = '2027-06-22';

const fecha = (f) => {
  const [a, m, d] = f.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
};
const clave = (d) => d.toISOString().slice(0, 10);
const masDias = (d, n) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};

// Lo que trae el primer hueco de la mañana: [pictograma de ARASAAC, palabra]. El calendario por meses
// y el semanal escriben la palabra en mayúsculas (con CSS).
const MOTIVOS = {
  cole: [32446, 'Cole'],
  fiesta: [7099, 'Fiesta'],
  nohaycole: [39447, 'No hay cole'],
  vacaciones: [32442, 'Vacaciones'],
  navidad: [3092, 'Navidad'],
  anonuevo: [5071, 'Año Nuevo'],
  reyes: [5072, 'Reyes'],
  semanasanta: [3153, 'Semana Santa'],
  verano: [2826, 'Verano'],
};

// Días entre semana sin cole: [lo que trae la mañana, nota pequeña junto al número]. Los fines de semana
// no cuentan: en ellos solo sale la nota de NOTAS_FINDE.
const SIN_COLE = {};
const rango = (desde, hasta, motivo) => {
  for (let d = fecha(desde); clave(d) <= hasta; d = masDias(d, 1)) SIN_COLE[clave(d)] = [motivo, ''];
};
rango('2026-08-31', '2026-09-07', 'verano');
rango('2026-12-24', '2027-01-06', 'vacaciones');
rango('2027-03-22', '2027-03-29', 'vacaciones');
rango('2027-06-23', '2027-07-02', 'verano');
Object.assign(SIN_COLE, {
  '2026-09-24': ['nohaycole', 'No lectivo'],
  '2026-09-25': ['fiesta', 'Fiesta local'],
  '2026-10-12': ['fiesta', 'Fiesta Nacional'],
  '2026-11-27': ['nohaycole', 'Día del patrón'],
  '2026-12-07': ['fiesta', 'Constitución'],
  '2026-12-08': ['fiesta', 'Inmaculada'],
  '2026-12-23': ['nohaycole', 'No lectivo'],
  '2026-12-24': ['vacaciones', 'Nochebuena'],
  '2026-12-25': ['navidad', ''],
  '2026-12-31': ['vacaciones', 'Nochevieja'],
  '2027-01-01': ['anonuevo', ''],
  '2027-01-06': ['reyes', ''],
  '2027-01-07': ['fiesta', 'Fiesta local'],
  '2027-01-08': ['nohaycole', 'No lectivo'],
  '2027-02-08': ['nohaycole', 'No lectivo'],
  '2027-03-19': ['fiesta', 'San José'],
  '2027-03-22': ['vacaciones', 'Semana Santa'],
  '2027-03-25': ['semanasanta', 'Jueves Santo'],
  '2027-03-26': ['semanasanta', 'Viernes Santo'],
  '2027-03-29': ['vacaciones', 'Lunes de Pascua'],
  '2027-06-09': ['fiesta', 'Día de la Región'],
  '2027-06-23': ['verano', '¡Vacaciones!'],
});
// El calendario por meses avisa también del 1 de septiembre, que abre su primera hoja.
const NOTAS_MES = { '2026-09-01': 'Vacaciones' };
// Fiestas que caen en fin de semana: solo la nota.
const NOTAS_FINDE = { '2026-11-01': 'Todos los Santos', '2027-05-01': 'Día del Trabajo' };
const NOTAS_COLE = { '2026-09-08': 'Primer día', '2027-06-22': 'Último día' };

const esLectivo = (f) => f >= INICIO_CURSO && f <= FIN_CURSO && !SIN_COLE[f];

// La lista de días sin cole de la guía. comprobarFechas() mira que diga lo mismo que las hojas.
const DIAS_SIN_COLE = [
  ['2026-09-24', null, 'día no lectivo de Cartagena'],
  ['2026-09-25', null, 'fiesta local de Cartagena'],
  ['2026-10-12', null, 'Fiesta Nacional de España'],
  ['2026-11-27', null, 'patrón de Infantil y Primaria'],
  ['2026-12-07', null, 'Día de la Constitución (el 6 es domingo)'],
  ['2026-12-08', null, 'Inmaculada Concepción'],
  ['2026-12-23', null, 'día no lectivo en toda la Región'],
  ['2026-12-24', '2027-01-06', 'vacaciones de Navidad'],
  ['2027-01-07', null, 'fiesta local de Cartagena'],
  ['2027-01-08', null, 'día no lectivo de Cartagena'],
  ['2027-02-08', null, 'día no lectivo de Cartagena'],
  ['2027-03-19', null, 'San José'],
  ['2027-03-22', '2027-03-29', 'vacaciones de Semana Santa'],
  ['2027-06-09', null, 'Día de la Región de Murcia'],
];

function comprobarFechas() {
  const enGuia = new Set();
  for (const [desde, hasta] of DIAS_SIN_COLE) {
    for (let d = fecha(desde); clave(d) <= (hasta ?? desde); d = masDias(d, 1)) enGuia.add(clave(d));
  }
  for (let d = fecha(INICIO_CURSO); clave(d) <= FIN_CURSO; d = masDias(d, 1)) {
    const f = clave(d);
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;
    if (Boolean(SIN_COLE[f]) !== enGuia.has(f)) {
      throw new Error(`calendarios-cole.mjs: el ${f} no dice lo mismo en las hojas y en la lista de la guía`);
    }
  }
}

// ---------------------------------------------------------------------------
// Meses, días y piezas comunes
// ---------------------------------------------------------------------------

const NOMBRES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const PICTO_MES = [6488, 6498, 6558, 6024, 6559, 6539, 6538, 6034, 6613, 6571, 6570, 6476];
const ACENTOS = ['#2F6FD6', '#1FA67A', '#E8553E', '#8C4FB8', '#F5961F', '#F6C12E'];
// Cada mes con su color, el mismo en los cuatro calendarios (septiembre azul, octubre verde…). m, de 1 a 12.
const acentoMes = (m) => ACENTOS[(m + 3) % 6];
const DIAS = [
  ['Lunes', 'lunes'],
  ['Martes', 'martes'],
  ['Miércoles', 'miercoles'],
  ['Jueves', 'jueves'],
  ['Viernes', 'viernes'],
  ['Sábado', 'finde'],
  ['Domingo', 'finde'],
];

const e = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Rutas relativas a esta carpeta (herramientas/pdf). Se apunta cada pictograma para comprobar que existe.
const usados = new Set();
const picto = (id) => {
  usados.add(id);
  return `pictogramas/${id}.png`;
};
const LOGO = '../../marca/09-logo-horizontal-transparente.png';

const CURSO_SEMANAS = 'Curso 2026-2027 · Cartagena';
const FESTIVOS = 'Festivos de Cartagena, de la Región de Murcia y nacionales, según el BORM';
const PICTOS = 'Pictogramas: Sergio Palao. Procedencia: ARASAAC (arasaac.org). Licencia: CC BY-NC-SA. Propiedad: Gobierno de Aragón.';
const LICENCIA = 'IdEducando · Licencia CC BY-NC-SA 4.0 · ideducando.es';

/**
 * El pie de cada hoja apaisada. En la primera hoja de cada parte lleva, en el centro y en pequeño, el h1
 * de esa parte (como el horario semanal): así sale en los marcadores del PDF y lo leen los lectores de
 * pantalla. Chromium no marca los títulos ocultos a la vista. Ese pie va el primero en el HTML, para que
 * el h1 abra la hoja, y se ve abajo igual que los demás (order en .pie).
 */
function pie(centro, titulo = '') {
  const partes = [
    titulo ? `<h1 class="pie__centro">${e(titulo)}</h1>` : '',
    `<span class="pie__pictos">${PICTOS}</span>`,
    titulo ? '' : `<span class="pie__centro">${centro}</span>`,
    `<span class="pie__licencia">${LICENCIA}</span>`,
  ];
  return `<footer class="pie">${partes.join('')}</footer>`;
}

const leyenda = () => `<ul class="leyenda" aria-label="Leyenda">
      <li class="manana"><img src="${picto(25704)}" alt="" />Mañana</li>
      <li class="tarde"><img src="${picto(7268)}" alt="" />Tarde</li>
    </ul>`;

const antetitulo = (quien) =>
  `<p class="antetitulo"><span class="etiqueta">${quien}</span><span class="linea nombre" aria-hidden="true"></span><span class="etiqueta">Clase</span><span class="linea clase" aria-hidden="true"></span></p>`;

const hoja = (m) => `<div class="hoja" style="--acento: ${acentoMes(m + 1)}"><img src="${picto(PICTO_MES[m])}" alt="" /></div>`;

/** Datos de la cabecera de una semana: meses que toca, título grande y «Del 7 al 11 de septiembre de 2026». */
function semana(lunes, n) {
  const dias = Array.from({ length: n }, (_, i) => masDias(lunes, i));
  const ultimo = dias[n - 1];
  const meses = [];
  for (const d of dias) {
    const m = [d.getUTCFullYear(), d.getUTCMonth()];
    if (!meses.some(([a, b]) => a === m[0] && b === m[1])) meses.push(m);
  }
  const mismoAnio = lunes.getUTCFullYear() === ultimo.getUTCFullYear();
  const titulo = mismoAnio
    ? `${meses.map(([, m]) => `<span class="mes">${NOMBRES[m]}</span>`).join('<span class="punto"> · </span>')} <span class="anio">${lunes.getUTCFullYear()}</span>`
    : meses.map(([a, m]) => `<span class="mes">${NOMBRES[m]}</span> <span class="anio">${a}</span>`).join('<span class="punto"> · </span>');
  const mismoMes = meses.length === 1;
  const desde = `${lunes.getUTCDate()}${mismoMes ? '' : ` de ${NOMBRES[lunes.getUTCMonth()]}`}${mismoAnio ? '' : ` de ${lunes.getUTCFullYear()}`}`;
  const rangoTexto = `Del ${desde} al ${ultimo.getUTCDate()} de ${NOMBRES[ultimo.getUTCMonth()]} de ${ultimo.getUTCFullYear()}`;
  return { dias, meses, titulo, rangoTexto, id: `semana-${clave(lunes)}` };
}

/** Cabecera de una hoja semanal. El h2 de la semana es el rango de fechas, en negrita en la línea de debajo. */
function cabeceraSemana(s, quien) {
  return `<header class="cabecera">
    <div class="mes-picto${s.meses.length > 1 ? ' doble' : ''}">${s.meses.map(([, m]) => hoja(m)).join('')}</div>
    <div class="titulos">
      ${antetitulo(quien)}
      <p class="titulo">${s.titulo}</p>
      <div class="sub"><h2 id="${s.id}">${s.rangoTexto}</h2> · ${CURSO_SEMANAS}</div>
    </div>
    ${leyenda()}
    <img class="logo" src="${LOGO}" alt="IdEducando" />
  </header>`;
}

const cabeceraTabla = (n) => `<thead><tr>${DIAS.slice(0, n).map(([nombre, c]) => `<th scope="col" class="${c}">${nombre}</th>`).join('')}</tr></thead>`;

const lunesEntre = (primero, ultimo) => {
  const lista = [];
  for (let d = fecha(primero); clave(d) <= ultimo; d = masDias(d, 7)) lista.push(d);
  return lista;
};

const mesCorto = (d, i) => (i === 0 || d.getUTCDate() === 1 ? ABREV[d.getUTCMonth()] : '');
const info = (d, i, nota) => {
  const m = mesCorto(d, i);
  return `<span class="info">${m ? `<span class="mesc">${m}</span>` : ''}${nota ? `<span class="nota">${e(nota)}</span>` : ''}</span>`;
};

// Tarjeta para recortar (la misma pieza en la semana de apoyos y en la del aula; cambia su tamaño en el CSS).
const carta = (id, palabra, grupo, extra = '') =>
  id === null
    ? `<div class="carta carta--blanca ${grupo}${extra}"><span class="carta__picto"><i></i></span><span class="carta__texto"><i></i></span></div>`
    : `<div class="carta ${grupo}${extra}"><span class="carta__picto"><img src="${picto(id)}" alt="" /></span><span class="carta__texto">${e(palabra)}</span></div>`;

// Hueco de la semana de apoyos y de la del aula: vacío, con la marca de mañana o de tarde, o con una tarjeta.
const hueco = (momento, contenido = '') =>
  `<div class="hueco${contenido ? ' lleno' : ''}">${
    contenido ||
    `<img class="marca" src="${picto(momento === 'manana' ? 25704 : 7268)}" alt="" /><span class="oculto">${momento === 'manana' ? 'Hueco de mañana' : 'Hueco de tarde'}</span>`
  }</div>`;

// ---------------------------------------------------------------------------
// 1. Calendario por meses
// ---------------------------------------------------------------------------

// Medidas (mm). La rejilla reparte el alto que queda entre las semanas del mes.
const ALTO_REJILLA = 158.5;
const HUECO = 1.4;

function franjaMes(momento, motivo) {
  if (!motivo) {
    const [id, palabra] = momento === 'manana' ? [25704, 'Mañana libre'] : [7268, 'Tarde libre'];
    return `<div class="franja ${momento} vacia"><img src="${picto(id)}" alt="" /><span class="oculto">${palabra}</span></div>`;
  }
  const [id, palabra] = MOTIVOS[motivo];
  return `<div class="franja ${momento} llena"><img src="${picto(id)}" alt="" /><span class="txt">${e(palabra)}</span></div>`;
}

function diaMes(d, mes) {
  if (d.getUTCMonth() + 1 !== mes) return '<td class="fuera"><div class="celda"></div></td>';
  const f = clave(d);
  const finde = d.getUTCDay() === 0 || d.getUTCDay() === 6;
  const lectivo = !finde && esLectivo(f);
  let motivo = null;
  let nota = '';
  if (lectivo) {
    motivo = 'cole';
    nota = NOTAS_COLE[f] || '';
  } else if (!finde && SIN_COLE[f]) {
    [motivo, nota] = SIN_COLE[f];
    nota = NOTAS_MES[f] ?? nota;
  } else if (finde) {
    nota = NOTAS_FINDE[f] || '';
  }
  const clases = ['celda', finde ? 'finde' : '', !finde && !lectivo ? 'sincole' : ''].filter(Boolean).join(' ');
  return `<td><div class="${clases}">
    <div class="cabeza"><span class="num">${d.getUTCDate()}</span>${nota ? `<span class="nota">${e(nota)}</span>` : ''}</div>
    <div class="franjas">${franjaMes('manana', motivo)}${franjaMes('tarde', null)}</div>
  </div></td>`;
}

function paginaMes(anio, mes, titulo) {
  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  const desplazamiento = (primero.getUTCDay() + 6) % 7;
  const dias = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const filas = Math.ceil((desplazamiento + dias) / 7);
  const fila = (ALTO_REJILLA - (filas - 1) * HUECO) / filas;
  const d = new Date(primero);
  d.setUTCDate(1 - desplazamiento);
  let cuerpo = '';
  for (let s = 0; s < filas; s++) {
    cuerpo += '<tr>';
    for (let i = 0; i < 7; i++) {
      cuerpo += diaMes(d, mes);
      d.setUTCDate(d.getUTCDate() + 1);
    }
    cuerpo += '</tr>';
  }
  const piePagina = pie('Festivos: calendario escolar 2026-2027 y fiestas laborales 2026 y 2027 (BORM)', titulo);
  return `<section class="pagina"${titulo ? ' data-miniatura' : ''} style="--fila: ${fila.toFixed(2)}mm" aria-labelledby="mes-${mes}">
  ${titulo ? piePagina : ''}
  <header class="cabecera">
    <div class="mes-picto">${hoja(mes - 1)}</div>
    <div class="titulos">
      ${antetitulo('El calendario de')}
      <h2 class="titulo" id="mes-${mes}"><span class="mes">${NOMBRES[mes - 1]}</span> <span class="anio">${anio}</span></h2>
      <p class="sub">Horario del cole · Curso 2026-2027 · Festivos de Cartagena, de la Región de Murcia y nacionales</p>
    </div>
    ${leyenda()}
    <img class="logo" src="${LOGO}" alt="IdEducando" />
  </header>
  <table>
    ${cabeceraTabla(7)}
    <tbody>${cuerpo}</tbody>
  </table>
  ${titulo ? '' : piePagina}
</section>`;
}

function hojasMes(titulo) {
  const hojas = [];
  for (let i = 0; i < 10; i++) {
    const m = ((8 + i) % 12) + 1; // de septiembre (9) a junio (6)
    hojas.push(paginaMes(m >= 9 ? 2026 : 2027, m, i === 0 ? titulo : ''));
  }
  return hojas;
}

const CSS_MES = `
.celda { height: var(--fila); background: #fff; border: 0.35mm solid var(--borde); border-radius: 2.6mm; padding: 0.9mm; display: flex; flex-direction: column; gap: 0.6mm; }
.fuera .celda { background: transparent; border: 0.35mm dashed #e6d3b0; }
.cabeza { height: 4.6mm; display: flex; align-items: center; gap: 1.4mm; padding: 0 0.6mm; min-width: 0; }
.num { font: 800 12.5pt/1 'Outfit', sans-serif; flex: none; }
.finde .num, .sincole .num { color: var(--coral-texto); }
.nota { font: 700 7pt/1 'Atkinson Hyperlegible', sans-serif; color: var(--coral-texto); white-space: nowrap; overflow: hidden; min-width: 0; }
.franjas { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.8mm; }
.franja { border-radius: 2mm; min-width: 0; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.7mm; gap: 0.4mm; position: relative; }
.franja.manana { background: var(--manana); }
.franja.tarde { background: var(--tarde); }
.franja.llena { background: #fff; }
.franja.manana.llena { border: 0.45mm solid var(--amarillo); }
.franja.llena img { width: min(100%, calc(var(--fila) - 15.6mm)); height: auto; aspect-ratio: 1; object-fit: contain; display: block; flex: none; }
.franja.vacia img { width: min(60%, 8mm); aspect-ratio: 1; opacity: 0.32; filter: grayscale(0.2); }
.txt { width: 100%; height: 5mm; flex: none; display: flex; align-items: center; justify-content: center; text-align: center; font: 800 6.8pt/1.02 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; overflow: hidden; overflow-wrap: normal; word-break: keep-all; hyphens: none; }
.sincole .franja.manana.llena { border-color: var(--coral); }
`;

// ---------------------------------------------------------------------------
// 2. Calendario por semanas, de lunes a domingo
// ---------------------------------------------------------------------------

const tarjetaSemana = (motivo) => {
  const [id, palabra] = MOTIVOS[motivo];
  return `<div class="hueco lleno"><img src="${picto(id)}" alt="" /><span class="txt">${e(palabra)}</span></div>`;
};
const huecoSemana = (momento) =>
  `<div class="hueco vacio"><img class="marca" src="${picto(momento === 'manana' ? 25704 : 7268)}" alt="" /><span class="oculto">${momento === 'manana' ? 'Hueco de mañana' : 'Hueco de tarde'}</span></div>`;

function diaSemana(d, i) {
  const f = clave(d);
  const finde = i >= 5;
  const lectivo = !finde && esLectivo(f);
  let motivo = null;
  let nota = '';
  if (lectivo) {
    motivo = 'cole';
    nota = NOTAS_COLE[f] || '';
  } else if (!finde && SIN_COLE[f]) {
    [motivo, nota] = SIN_COLE[f];
  } else if (finde) {
    nota = NOTAS_FINDE[f] || '';
  }
  const clases = ['dia', finde ? 'finde' : '', !finde && !lectivo ? 'sincole' : ''].filter(Boolean).join(' ');
  return `<td><div class="${clases}">
    <div class="cabeza"><span class="num">${d.getUTCDate()}</span>${info(d, i, nota)}</div>
    <div class="seccion manana">${motivo ? tarjetaSemana(motivo) : huecoSemana('manana')}${huecoSemana('manana')}</div>
    <div class="seccion tarde">${huecoSemana('tarde')}${huecoSemana('tarde')}</div>
  </div></td>`;
}

function hojasSemana(titulo) {
  return lunesEntre('2026-08-31', '2027-06-28').map((lunes, n) => {
    const s = semana(lunes, 7);
    const piePagina = pie(FESTIVOS, n === 0 ? titulo : '');
    return `<section class="pagina"${n === 0 ? ' data-miniatura' : ''} aria-labelledby="${s.id}">
  ${n === 0 ? piePagina : ''}
  ${cabeceraSemana(s, 'La semana de')}
  <table>
    ${cabeceraTabla(7)}
    <tbody><tr>${s.dias.map(diaSemana).join('')}</tr></tbody>
  </table>
  ${n === 0 ? '' : piePagina}
</section>`;
  });
}

const CSS_SEMANA = `
.dia { height: 158.5mm; background: #fff; border: 0.35mm solid var(--borde); border-radius: 3mm; padding: 0.9mm; display: flex; flex-direction: column; gap: 1mm; }
.cabeza { height: 9mm; flex: none; display: flex; align-items: center; gap: 1.6mm; padding: 0 0.8mm; min-width: 0; }
.num { font: 900 21pt/1 'Outfit', sans-serif; flex: none; }
.finde .num, .sincole .num { color: var(--coral-texto); }
.info { display: flex; flex-direction: column; justify-content: center; gap: 0.5mm; min-width: 0; }
.mesc { font: 800 8pt/1 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; color: var(--suave); }
.nota { font: 700 7.4pt/1.05 'Atkinson Hyperlegible', sans-serif; color: var(--coral-texto); white-space: nowrap; overflow: hidden; }
.seccion { flex: 1; min-height: 0; border-radius: 2.4mm; padding: 1mm; display: flex; flex-direction: column; gap: 1.2mm; }
.seccion.manana { background: var(--manana); }
.seccion.tarde { background: var(--tarde); }
.hueco { flex: 1; min-height: 0; border-radius: 2mm; position: relative; }
.hueco.vacio { background: rgba(255, 255, 255, 0.6); border: 0.35mm dashed var(--raya-manana); }
.tarde .hueco.vacio { border-color: var(--raya-tarde); }
.hueco.vacio .marca { position: absolute; top: 1mm; left: 1mm; width: 5.5mm; height: 5.5mm; opacity: 0.35; }
.hueco.lleno { background: #fff; border: 0.45mm solid var(--amarillo); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6mm; padding: 0.8mm; }
.sincole .hueco.lleno { border-color: var(--coral); }
.hueco.lleno img { width: 23mm; height: 23mm; object-fit: contain; display: block; flex: none; }
.txt { width: 100%; height: 6mm; flex: none; display: flex; align-items: center; justify-content: center; text-align: center; font: 800 8.2pt/1.02 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; overflow: hidden; overflow-wrap: normal; word-break: keep-all; hyphens: none; }
.pie > * { white-space: nowrap; }
`;

// ---------------------------------------------------------------------------
// 3 y 4. Semana de apoyos y semana del aula: una hoja por semana de cole, de lunes a viernes
// ---------------------------------------------------------------------------

const PRIMER_LUNES_COLE = '2026-09-07';
const ULTIMO_LUNES_COLE = '2027-06-21';

// Semana de apoyos. Cada día: tres huecos de mañana (el primero ya trae «Cole» o el motivo de no haber
// cole) y dos de tarde. Los huecos miden 51 × 27,5 mm: caben las tarjetas de 44 × 21 mm de la última
// hoja y las pequeñas de la «Agenda visual con pictogramas», que tienen el mismo tamaño y estilo.
function diaApoyos(d, i, colocadas = []) {
  const f = clave(d);
  const lectivo = esLectivo(f);
  const [motivo, nota] = lectivo ? ['cole', NOTAS_COLE[f] || ''] : SIN_COLE[f] || ['nohaycole', ''];
  const [id, palabra] = MOTIVOS[motivo];
  const grupo = motivo === 'cole' ? 'g-azul' : 'g-coral';
  const libre = (momento, n) => hueco(momento, colocadas[n] ? carta(...colocadas[n], ' fija') : '');
  return `<td><div class="dia${lectivo ? '' : ' sincole'}">
    <div class="cabeza"><span class="num">${d.getUTCDate()}</span>${info(d, i, nota)}</div>
    <div class="seccion manana">${hueco('manana', carta(id, palabra, grupo, ' fija'))}${libre('manana', 0)}${libre('manana', 1)}</div>
    <div class="seccion tarde">${libre('tarde', 2)}${libre('tarde', 3)}</div>
  </div></td>`;
}

// Semana del aula. Cada día: dos huecos de mañana y uno de tarde, de 51 × 46 mm. Los días de cole llevan
// la etiqueta «Cole» junto al número y los tres huecos quedan libres; los días sin cole, el primer hueco
// trae el motivo. En cada hueco cabe una tarjeta grande (46 × 40 mm) o dos pequeñas de 44 × 21 mm.
function diaAula(d, i, colocadas = []) {
  const f = clave(d);
  const lectivo = esLectivo(f);
  const [motivo, nota] = lectivo ? [null, NOTAS_COLE[f] || ''] : SIN_COLE[f] || ['nohaycole', ''];
  const libre = (momento, n) => hueco(momento, colocadas[n] ? carta(...colocadas[n], ' fija') : '');
  const primero = motivo ? hueco('manana', carta(...MOTIVOS[motivo], 'g-coral', ' fija')) : libre('manana', 0);
  const etiqueta = lectivo ? `<span class="cole"><img src="${picto(32446)}" alt="" />Cole</span>` : '';
  return `<td><div class="dia${lectivo ? '' : ' sincole'}">
    <div class="cabeza"><span class="num">${d.getUTCDate()}</span>${info(d, i, nota)}${etiqueta}</div>
    <div class="seccion manana">${primero}${libre('manana', 1)}</div>
    <div class="seccion tarde">${libre('tarde', 2)}</div>
  </div></td>`;
}

// Tarjetas para recortar: [pictograma, palabra, grupo, copias]. null = tarjeta en blanco.
// Morado: apoyos en el cole. Naranja: apoyos fuera del cole. Amarillo: días distintos. Crema: en blanco.
const TARJETAS_APOYOS = [
  [36275, 'PT', 'g-morado', 6],
  [36267, 'AL', 'g-morado', 6],
  [32497, 'Fisioterapia', 'g-morado', 3],
  [12333, 'Asociación', 'g-naranja', 6],
  [2454, 'Logopedia', 'g-naranja', 3],
  [39200, 'Psicología', 'g-naranja', 2],
  [39260, 'Atención temprana', 'g-naranja', 2],
  [32970, 'Terapia ocupacional', 'g-naranja', 2],
  [2467, 'Médico', 'g-amarillo', 2],
  [4671, 'Excursión', 'g-amarillo', 2],
  [null, '', 'g-marino', 8],
];
const TARJETAS_AULA = [
  [36275, 'PT', 'g-morado', 4],
  [36267, 'AL', 'g-morado', 4],
  [32497, 'Fisioterapia', 'g-morado', 2],
  [12333, 'Asociación', 'g-naranja', 4],
  [2454, 'Logopedia', 'g-naranja', 2],
  [39200, 'Psicología', 'g-naranja', 1],
  [39260, 'Atención temprana', 'g-naranja', 1],
  [32970, 'Terapia ocupacional', 'g-naranja', 1],
  [2467, 'Médico', 'g-amarillo', 1],
  [4671, 'Excursión', 'g-amarillo', 1],
  [null, '', 'g-marino', 3],
];
const cuantas = (lista) => lista.reduce((suma, t) => suma + t[3], 0);
// Tarjetas puestas en la semana de ejemplo de la portada: en orden, los huecos libres de cada día.
const PT = [36275, 'PT', 'g-morado'];
const AL = [36267, 'AL', 'g-morado'];
const ASOCIACION = [12333, 'Asociación', 'g-naranja'];
const LOGOPEDIA = [2454, 'Logopedia', 'g-naranja'];

function hojasCole(t, titulo) {
  return lunesEntre(PRIMER_LUNES_COLE, ULTIMO_LUNES_COLE).map((lunes, n) => {
    const s = semana(lunes, 5);
    const piePagina = pie(FESTIVOS, n === 0 ? titulo : '');
    return `<section class="pagina" aria-labelledby="${s.id}">
  ${n === 0 ? piePagina : ''}
  ${cabeceraSemana(s, 'La semana de')}
  <table>
    ${cabeceraTabla(5)}
    <tbody><tr>${s.dias.map((d, i) => t.dia(d, i)).join('')}</tr></tbody>
  </table>
  ${n === 0 ? '' : piePagina}
</section>`;
  });
}

function hojaTarjetas(t) {
  const cartas = t.tarjetas.flatMap(([id, palabra, grupo, copias]) => Array.from({ length: copias }, () => carta(id, palabra, grupo))).join('');
  return `<section class="pagina tarjetas" aria-labelledby="tarjetas">
  <header class="cabecera-tarjetas">
    <h1 class="titulo-tarjetas" id="tarjetas">Tarjetas para la semana</h1>
    <p>${t.recorta}</p>
    <p class="siglas"><span><strong>PT:</strong> Pedagogía Terapéutica.</span><span><strong>AL:</strong> Audición y Lenguaje.</span>
      <span class="grupo g-morado"><i></i>Apoyos en el cole</span><span class="grupo g-naranja"><i></i>Apoyos fuera del cole</span><span class="grupo g-amarillo"><i></i>Días distintos</span><span class="grupo g-marino"><i></i>En blanco</span></p>
  </header>
  <div class="rejilla-cartas">${cartas}</div>
  ${pie(`Imprime al 100 % («Tamaño real»): así cada tarjeta mide ${t.medida} y cabe en su hueco`)}
</section>`;
}

/**
 * Portada de la semana de apoyos y de la del aula: título, curso, logo y un trocito de una semana de
 * ejemplo (del miércoles 23 al viernes 25 de septiembre de 2026, con un día de cole, un día no lectivo y
 * la fiesta local) con algunas tarjetas puestas. Así la página 2 puede ser «Cómo montarlo».
 */
function portada(t, titulo) {
  const miercoles = fecha('2026-09-23');
  const dias = [0, 1, 2].map((i) => masDias(miercoles, i));
  const datos = t.datos.map(([grupo, texto]) => `<li class="${grupo}">${texto}</li>`).join('');
  return `<section class="pagina portada-cal" data-miniatura aria-labelledby="titulo-documento">
  <div class="portada-cal__circulo" style="width: 150mm; height: 150mm; right: -34mm; top: -40mm; background: var(--amarillo-tinte)"></div>
  <div class="portada-cal__circulo" style="width: 100mm; height: 100mm; left: -34mm; bottom: -48mm; background: var(--morado-tinte)"></div>
  <div class="portada-cal__texto">
    <p class="portada-cal__antetitulo">${CURSO_SEMANAS}</p>
    <h1 class="portada-cal__titulo" id="titulo-documento">${titulo} <span class="anio">2026-2027</span></h1>
    <p class="portada-cal__sub">${t.subtitulo}</p>
    <ul class="portada-cal__datos">${datos}</ul>
    <img class="portada-cal__logo" src="${LOGO}" alt="IdEducando" />
  </div>
  <div class="portada-cal__muestra" aria-hidden="true">
    <div class="muestra">
      <table>
        <thead><tr><th scope="col" class="miercoles">Miércoles</th><th scope="col" class="jueves">Jueves</th><th scope="col" class="viernes">Viernes</th></tr></thead>
        <tbody><tr>${dias.map((d, i) => t.dia(d, i, t.ejemplo[i])).join('')}</tr></tbody>
      </table>
    </div>
  </div>
  ${pie(FESTIVOS)}
</section>`;
}

const SEMANAS_COLE = lunesEntre(PRIMER_LUNES_COLE, ULTIMO_LUNES_COLE).length;

const APOYOS = {
  dia: diaApoyos,
  tarjetas: TARJETAS_APOYOS,
  medida: '44 × 21 mm',
  recorta:
    'Recorta por la línea discontinua y pega cada tarjeta en su hueco, o ponle velcro para moverla. Escribe la hora o lo que quieras en las que están en blanco.',
  subtitulo:
    'Una hoja para cada semana de cole, de lunes a viernes, para organizar las sesiones de PT (Pedagogía Terapéutica), AL (Audición y Lenguaje), asociación y terapias de cada peque.',
  // Los huecos libres de cada día de la muestra, en orden: mañana 2, mañana 3, tarde 1 y tarde 2.
  ejemplo: [[PT, AL, ASOCIACION], [null, null, LOGOPEDIA], []],
};
APOYOS.datos = [
  ['g-azul', `${SEMANAS_COLE} semanas de cole, del 7 de septiembre de 2026 al 25 de junio de 2027`],
  ['g-coral', 'Los festivos y las vacaciones de Cartagena ya puestos, según el Boletín Oficial de la Región de Murcia (BORM)'],
  ['g-morado', `${cuantas(TARJETAS_APOYOS)} tarjetas con pictogramas para recortar, de 44&nbsp;×&nbsp;21&nbsp;mm`],
  ['g-naranja', 'Cómo montarla y guía para usarla en clase y en casa'],
];

const AULA = {
  dia: diaAula,
  tarjetas: TARJETAS_AULA,
  medida: '46 × 40 mm',
  recorta:
    'Recorta por la línea discontinua y pega cada tarjeta en su hueco, o ponle velcro. En cada hueco cabe una tarjeta grande o dos pequeñas de la «Agenda visual con pictogramas».',
  subtitulo:
    'Una hoja para cada semana de cole, de lunes a viernes, con huecos grandes para verla desde lejos: en la pared del aula o en la mesa.',
  // Los huecos libres de cada día de la muestra, en orden: mañana 1, mañana 2 y tarde.
  ejemplo: [[PT, AL, ASOCIACION], [null, null, LOGOPEDIA], []],
};
AULA.datos = [
  ['g-azul', `${SEMANAS_COLE} semanas de cole, del 7 de septiembre de 2026 al 25 de junio de 2027`],
  ['g-coral', 'Los festivos y las vacaciones de Cartagena ya puestos, según el Boletín Oficial de la Región de Murcia (BORM)'],
  ['g-morado', `${cuantas(TARJETAS_AULA)} tarjetas grandes con pictogramas para recortar, de 46&nbsp;×&nbsp;40&nbsp;mm`],
  ['g-naranja', 'Cómo montarla y guía para usarla en clase y en casa'],
];

const CSS_COLE = `
.g-azul { --c: var(--azul); --t: var(--azul-tinte); }
.g-morado { --c: var(--morado); --t: var(--morado-tinte); }
.g-amarillo { --c: var(--amarillo); --t: var(--amarillo-tinte); }
.g-coral { --c: var(--coral); --t: var(--coral-tinte); }
.g-naranja { --c: var(--naranja); --t: var(--naranja-tinte); }
.g-marino { --c: var(--marino); --t: var(--crema); }
.dia { height: 158.5mm; background: #fff; border: 0.35mm solid var(--borde); border-radius: 3mm; padding: 0.9mm; display: flex; flex-direction: column; gap: 1mm; }
.cabeza { height: 9mm; flex: none; display: flex; align-items: center; gap: 1.6mm; padding: 0 0.8mm; min-width: 0; }
.num { font: 900 21pt/1 'Outfit', sans-serif; flex: none; }
.sincole .num { color: var(--coral-texto); }
.info { display: flex; flex-direction: column; justify-content: center; gap: 0.5mm; min-width: 0; }
.mesc { font: 800 8pt/1 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; color: var(--suave); }
.nota { font: 700 8pt/1.05 'Atkinson Hyperlegible', sans-serif; color: var(--coral-texto); white-space: nowrap; overflow: hidden; }
.seccion { min-height: 0; border-radius: 2.4mm; padding: 1mm; display: flex; flex-direction: column; gap: 1.2mm; }
.hueco { flex: 1; min-height: 0; border-radius: 2mm; position: relative; background: rgba(255, 255, 255, 0.6); border: 0.35mm dashed var(--raya-manana); display: grid; place-items: center; }
.tarde .hueco { border-color: var(--raya-tarde); }
.hueco.lleno { background: transparent; border-color: transparent; }
.carta--blanca .carta__picto i { display: block; width: 100%; height: 100%; border: 0.35mm dashed var(--suave); border-radius: 1.5mm; }
.carta--blanca .carta__texto i { display: block; width: 100%; border-bottom: 0.35mm solid var(--marino); }
.tarjetas .siglas { display: flex; flex-wrap: wrap; align-items: center; gap: 1mm 4mm; }
.grupo { display: inline-flex; align-items: center; gap: 1.4mm; font-weight: 700; }
.grupo i { display: inline-block; width: 4.5mm; height: 4.5mm; border-radius: 1mm; background: var(--t); border: 0.7mm solid var(--c); }
.pie > * { white-space: nowrap; }
`;

const CSS_APOYOS = `${CSS_COLE}
.seccion.manana { flex: 3; background: var(--manana); }
.seccion.tarde { flex: 2; background: var(--tarde); }
.hueco .marca { position: absolute; top: 1mm; left: 1mm; width: 5.5mm; height: 5.5mm; opacity: 0.35; }
/* Tarjetas de 44 × 21 mm, como las pequeñas de la «Agenda visual con pictogramas». */
.carta { width: 44mm; height: 21mm; display: grid; grid-template-columns: 18.4mm minmax(0, 1fr); border: 0.35mm dashed var(--suave); border-radius: 2.4mm; overflow: hidden; background: var(--t, #fff); break-inside: avoid; }
.carta.fija { border: 0.45mm solid var(--c); }
.carta__picto { display: grid; place-items: center; background: #fff; border-right: 0.6mm solid var(--c); }
.carta__picto img { width: 17.6mm; height: 17.6mm; display: block; }
.carta__texto { display: flex; align-items: center; padding: 0 0.5mm 0 0.9mm; font-weight: 700; font-size: 11pt; line-height: 1.08; text-wrap: balance; overflow: hidden; overflow-wrap: normal; word-break: keep-all; hyphens: manual; }
.carta--blanca .carta__picto { padding: 1.6mm; }
.carta--blanca .carta__texto { align-items: flex-end; padding-bottom: 4.5mm; padding-right: 2mm; }
.tarjetas .cabecera-tarjetas { margin-bottom: 4mm; }
.tarjetas .titulo-tarjetas { margin: 0 0 1.5mm; font: 900 24pt/1 'Outfit', sans-serif; text-transform: uppercase; }
.tarjetas .cabecera-tarjetas p { margin: 0 0 1.2mm; font-size: 11pt; line-height: 1.3; }
.rejilla-cartas { display: grid; grid-template-columns: repeat(6, 44mm); grid-auto-rows: 21mm; justify-content: space-between; row-gap: 3.2mm; }
`;

const CSS_AULA = `${CSS_COLE}
.info { flex: 1; }
.cole { flex: none; display: inline-flex; align-items: center; gap: 1mm; height: 7mm; padding: 0 2.2mm 0 0.6mm; border-radius: 3.5mm; background: var(--azul-tinte); border: 0.4mm solid var(--azul); font: 800 9.5pt/1 'Outfit', sans-serif; }
.cole img { width: 5.6mm; height: 5.6mm; background: #fff; border-radius: 50%; }
.seccion.manana { flex: 2; background: var(--manana); }
.seccion.tarde { flex: 1; background: var(--tarde); }
.hueco .marca { position: absolute; top: 1.2mm; left: 1.2mm; width: 6.5mm; height: 6.5mm; opacity: 0.35; }
/* Tarjetas grandes de 46 × 40 mm: pictograma de 28 mm arriba y la palabra debajo. */
.carta { width: 46mm; height: 40mm; display: grid; grid-template-rows: minmax(0, 1fr) 10mm; border: 0.35mm dashed var(--suave); border-radius: 2.6mm; overflow: hidden; background: var(--t, #fff); break-inside: avoid; }
.carta.fija { border: 0.5mm solid var(--c); }
.carta__picto { display: grid; place-items: center; background: #fff; border-bottom: 0.7mm solid var(--c); }
.carta__picto img { width: 28mm; height: 28mm; display: block; }
.carta__texto { display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 1mm; font-weight: 700; font-size: 12.5pt; line-height: 1.02; text-wrap: balance; overflow: hidden; overflow-wrap: normal; word-break: keep-all; hyphens: manual; }
.carta--blanca .carta__picto { padding: 2mm 9mm; }
.carta--blanca .carta__texto { align-items: flex-end; padding: 0 4mm 2.6mm; }
.tarjetas .cabecera-tarjetas { margin-bottom: 2.4mm; }
.tarjetas .titulo-tarjetas { margin: 0 0 1.2mm; font: 900 20pt/1 'Outfit', sans-serif; text-transform: uppercase; }
.tarjetas .cabecera-tarjetas p { margin: 0 0 1mm; font-size: 10.5pt; line-height: 1.25; }
.rejilla-cartas { display: grid; grid-template-columns: repeat(6, 46mm); grid-auto-rows: 40mm; justify-content: space-between; row-gap: 2mm; }
`;

// La portada: el texto a la izquierda y, a la derecha, tres días de una semana de ejemplo, un poco girados.
// La muestra mide lo mismo que las hojas de dentro, reducida con zoom.
const CSS_PORTADA = `
.pagina.portada-cal { display: grid; grid-template-columns: 112mm minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; column-gap: 9mm; }
.portada-cal .pie { grid-column: 1 / -1; position: relative; }
.portada-cal__circulo { position: absolute; border-radius: 50%; }
.portada-cal__texto { position: relative; min-width: 0; display: flex; flex-direction: column; padding: 9mm 0 3mm 3mm; }
.portada-cal__antetitulo { margin: 0 0 5mm; font: 800 11pt/1 'Outfit', sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: var(--coral-texto); }
.portada-cal__titulo { margin: 0 0 6mm; font: 900 44pt/0.98 'Outfit', sans-serif; color: var(--marino); }
.portada-cal__titulo .anio { display: block; margin-top: 1.5mm; color: var(--enlace); font-weight: 800; }
.portada-cal__sub { margin: 0 0 6mm; font-size: 13pt; line-height: 1.35; }
.portada-cal__datos { list-style: none; margin: 0; padding: 0; display: grid; gap: 2.4mm; font-size: 11.5pt; line-height: 1.3; }
.portada-cal__datos li { margin: 0; display: flex; align-items: flex-start; gap: 2.6mm; }
.portada-cal__datos li::before { content: ''; flex: none; width: 3.4mm; height: 3.4mm; margin-top: 1.1mm; border-radius: 0.9mm; background: var(--t); border: 0.6mm solid var(--c); }
.portada-cal__logo { margin-top: auto; width: 60mm; height: auto; display: block; }
.portada-cal__muestra { position: relative; min-width: 0; display: grid; place-items: center; }
.muestra { zoom: 0.84; padding: 4.5mm; background: var(--crema); border: 0.35mm solid var(--borde); border-radius: 4mm; box-shadow: 1.6mm 1.6mm 0 rgba(30, 43, 85, 0.12); transform: rotate(-1.6deg); }
.pagina .muestra table { width: calc(3 * 55.48mm + 4 * 1.4mm); }
`;

// ---------------------------------------------------------------------------
// Estilos comunes de las hojas apaisadas
// ---------------------------------------------------------------------------

// comun.css pone su letra, su interlineado y su estilo de tablas para las hojas A4 de texto. Las hojas del
// calendario vuelven a los valores con los que se diseñaron (los del navegador). Los colores de texto son
// los de comun.css: --coral-texto para el coral y --enlace para el azul del año.
// Los días de la semana van en 14 puntos y en negrita: así el blanco sobre el verde (3,1:1) y sobre el
// coral (3,6:1) cumple el contraste AA del texto grande.
const CSS_BASE = `
@font-face { font-family: 'Outfit'; font-weight: 800; src: url('../../node_modules/@fontsource/outfit/files/outfit-latin-800-normal.woff2') format('woff2'); }
@font-face { font-family: 'Outfit'; font-weight: 900; src: url('../../node_modules/@fontsource/outfit/files/outfit-latin-900-normal.woff2') format('woff2'); }
@page calendario { size: 297mm 210mm; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
/* Chromium no siempre aplica a la primera hoja el margen cero cuando lleva imágenes (ver herramientas/LEEME.md). */
@page :first { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
:root { --manana: #fff1c4; --tarde: #efe4fa; --borde: #ead9bb; --raya-manana: #d9a92a; --raya-tarde: #a27bcb; }
.oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.pagina { page: calendario; width: 297mm; height: 210mm; padding: 6mm 7mm 5mm; background: var(--crema); overflow: hidden; break-after: page; display: flex; flex-direction: column; position: relative; font-size: 12pt; line-height: normal; }
.pagina li { margin: 0; }
.cabecera { height: 24mm; margin-bottom: 2.6mm; display: grid; grid-template-columns: 24mm minmax(0, 1fr) auto auto; gap: 5mm; align-items: center; }
.mes-picto { width: 24mm; height: 24mm; position: relative; }
.hoja { position: absolute; inset: 0; background: #fff; border: 1mm solid var(--acento); border-radius: 4mm; padding: 1.2mm; transform: rotate(-3deg); box-shadow: 0.8mm 0.8mm 0 rgba(30, 43, 85, 0.12); }
.hoja img { width: 100%; height: 100%; object-fit: contain; display: block; }
.mes-picto.doble .hoja:first-child { transform: translate(-1.6mm, -0.6mm) rotate(-9deg) scale(0.9); }
.mes-picto.doble .hoja:last-child { transform: translate(1.6mm, 0.8mm) rotate(4deg) scale(0.9); }
.titulos { min-width: 0; }
.cabecera .antetitulo { margin: 0; height: 7mm; display: flex; align-items: flex-end; gap: 2.2mm; font: 800 11pt/1 'Outfit', sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: var(--coral-texto); }
.antetitulo .etiqueta { white-space: nowrap; padding-bottom: 0.5mm; flex: none; }
.antetitulo .linea { height: 7mm; border-bottom: 0.4mm solid var(--suave); background: rgba(255, 255, 255, 0.55); border-radius: 1.2mm 1.2mm 0 0; }
.antetitulo .linea.nombre { flex: 1; min-width: 40mm; }
.antetitulo .linea.clase { flex: 0 0 30mm; }
.titulo { margin: 1.2mm 0 0.6mm; font: 900 30pt/0.95 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; white-space: nowrap; overflow: hidden; }
.titulo .anio { color: var(--enlace); font-weight: 800; }
.titulo .punto { color: var(--coral-texto); }
.sub { margin: 0; font-size: 9.5pt; color: var(--suave); white-space: nowrap; overflow: hidden; }
.sub h2 { display: inline; margin: 0; font: inherit; font-weight: 700; color: var(--marino); }
.leyenda { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1.6mm; }
.leyenda li { display: flex; align-items: center; gap: 1.6mm; height: 10.4mm; padding: 0 3mm 0 1.2mm; border-radius: 3mm; font: 800 10.5pt/1 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.04em; }
.leyenda li img { width: 8mm; height: 8mm; background: #fff; border-radius: 1.6mm; padding: 0.5mm; }
.leyenda .manana { background: var(--manana); border: 0.5mm solid var(--amarillo); }
.leyenda .tarde { background: var(--tarde); border: 0.5mm solid var(--morado); }
.logo { height: 12.5mm; width: auto; display: block; }
.pagina table { width: calc(100% + ${2 * HUECO}mm); margin: -${HUECO}mm; border-collapse: separate; border-spacing: ${HUECO}mm; table-layout: fixed; font-size: inherit; }
.pagina th { height: 7.6mm; border: 0; border-radius: 2.4mm; padding: 0; text-align: center; vertical-align: middle; font: 800 14pt/1 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; }
.pagina th.lunes { background: var(--azul); }
.pagina th.martes { background: var(--verde); }
.pagina th.miercoles { background: var(--coral); }
.pagina th.jueves { background: var(--morado); }
.pagina th.viernes { background: var(--naranja); color: var(--marino); }
.pagina th.finde { background: var(--amarillo); color: var(--marino); }
.pagina td { padding: 0; border: 0; vertical-align: top; }
.pie { order: 3; margin-top: auto; padding-top: 1.6mm; display: flex; justify-content: space-between; gap: 4mm; font-size: 6.6pt; color: var(--suave); }
.pie__pictos { order: 1; }
.pie__centro { order: 2; }
.pie h1 { margin: 0; font: inherit; color: inherit; }
.pie__licencia { order: 3; font-weight: 700; color: var(--marino); }
`;

// ---------------------------------------------------------------------------
// La guía del final: una hoja A4 vertical, como la del horario semanal con recreo
// ---------------------------------------------------------------------------

const CITA_ARASAAC =
  'Los símbolos pictográficos utilizados son propiedad del Gobierno de Aragón y han sido creados por Sergio Palao para ARASAAC (https://arasaac.org), que los distribuye bajo Licencia Creative Commons BY-NC-SA.';

const diaLargo = (f) => {
  const d = fecha(f);
  return `${SEMANA[d.getUTCDay()]} ${d.getUTCDate()} de ${NOMBRES[d.getUTCMonth()]}`;
};
const diaCorto = (f) => `${fecha(f).getUTCDate()} de ${NOMBRES[fecha(f).getUTCMonth()]}`;

function listaSinCole(desdeAnio) {
  return DIAS_SIN_COLE.filter(([desde]) => desde.startsWith(desdeAnio))
    .map(([desde, hasta, motivo]) => {
      const mismoMes = hasta && desde.slice(0, 7) === hasta.slice(0, 7);
      const cuando = hasta ? `Del ${mismoMes ? fecha(desde).getUTCDate() : diaCorto(desde)} al ${diaCorto(hasta)}` : diaCorto(desde);
      return `<li><strong>${cuando}:</strong> ${motivo}.</li>`;
    })
    .join('');
}

function guia(id, doc) {
  const lista = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  return `<section class="guia">
  <div class="rayos"></div>
  <p class="antetitulo">Guía para el docente y la familia</p>
  <h1>${doc.guia.titulo}</h1>
  <p class="entradilla">${doc.guia.entradilla}</p>
  <p class="imprimir">${doc.guia.imprimir}</p>
  <div class="dos-columnas">
    <div>
      <h2>En clase</h2>
      ${lista(doc.guia.clase)}
    </div>
    <div>
      <h2>En casa</h2>
      ${lista(doc.guia.casa)}
    </div>
  </div>

  <h2>Días sin cole en Cartagena</h2>
  <p>Las clases de Infantil y Primaria van del ${diaLargo(INICIO_CURSO)} de 2026 al ${diaLargo(FIN_CURSO)} de 2027. Además de los fines de semana, no hay cole estos días (Todos los Santos y el Día del Trabajo caen en sábado o domingo):</p>
  <div class="dos-columnas dias-sin-cole">
    <div><p class="anio-lista">2026</p><ul>${listaSinCole('2026')}</ul></div>
    <div><p class="anio-lista">2027</p><ul>${listaSinCole('2027')}</ul></div>
  </div>
  <div class="caja caja--coral otro-municipio">
    <p><strong>¿Tu cole no está en Cartagena?</strong> Cambian las dos fiestas locales (25 de septiembre y 7 de enero) y los tres días no lectivos de Cartagena (24 de septiembre, 8 de enero y 8 de febrero). Táchalos y escribe los de tu municipio: están en el anexo V del calendario escolar, en el Boletín Oficial de la Región de Murcia (BORM).</p>
  </div>

  <div class="dos-columnas fuentes">
    <div class="caja caja--azul">
      <h2>Pictogramas de ARASAAC</h2>
      <p>«${CITA_ARASAAC}» ARASAAC es el Centro Aragonés para la Comunicación Aumentativa y Alternativa.</p>
    </div>
    <div>
      <p>Fechas del BORM: calendario escolar 2026-2027 (Resolución de 8 de junio de 2026, BORM n.º 132, de 11 de junio de 2026, anexos I y V) y fiestas laborales de 2026 (BORM n.º 163, de 17 de julio de 2025) y de 2027 (BORM n.º 171, de 27 de julio de 2026).</p>
      <p>Apoyos visuales y anticipación: Hume, K. y otros (2021), <em>Journal of Autism and Developmental Disorders</em>, 51(11), 4013-4032.</p>
    </div>
  </div>
  <div class="creditos">
    <p><strong>${doc.titulo}.</strong> Equipo IdEducando, noviembre de 2026. Ficha y novedades: <span class="url">ideducando.es/material-gratuito/${id}</span></p>
    <p>Licencia Creative Commons Reconocimiento-NoComercial-CompartirIgual 4.0 (CC BY-NC-SA 4.0): puedes copiarlo y adaptarlo sin fines comerciales, citando a IdEducando y compartiendo lo que hagas con la misma licencia. Lleva pictogramas de ARASAAC: es gratis siempre y no se puede vender.</p>
  </div>
</section>`;
}

const CSS_GUIA = `
.guia { font-size: 10pt; line-height: 1.32; }
.guia .rayos { margin-bottom: 4mm; }
.guia h1 { font-size: 20pt; margin-bottom: 1.6mm; }
.guia h2 { font-size: 12pt; margin: 3.2mm 0 1mm; }
.guia p { margin-bottom: 1.4mm; }
.guia ul { margin: 0; }
.guia li { margin-bottom: 0.6mm; }
.guia .entradilla { font-size: 10.5pt; }
.guia .imprimir { margin: 0; padding: 1.4mm 3mm; border-radius: 2mm; background: var(--amarillo-tinte); font-size: 9.5pt; }
.guia .dos-columnas { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 7mm; }
.dias-sin-cole { font-size: 9.5pt; line-height: 1.22; }
.dias-sin-cole ul { list-style: none; padding: 0; }
.dias-sin-cole li { margin-bottom: 0.7mm; }
.anio-lista { margin: 0 0 0.8mm; font-family: var(--titulos); font-weight: 700; font-size: 10.5pt; color: var(--morado-texto); }
.guia .otro-municipio { margin: 2mm 0 0; padding: 2mm 4mm; font-size: 9.5pt; }
.guia .fuentes { margin-top: 3.2mm; font-size: 8.5pt; line-height: 1.3; color: var(--suave); }
.guia .fuentes .caja { margin: 0; padding: 2mm 3.5mm; color: var(--marino); }
.guia .fuentes h2 { margin: 0 0 0.8mm; font-size: 10pt; }
.guia .creditos { margin-top: 2mm; padding-top: 1.6mm; font-size: 8.5pt; }
.guia .creditos p { margin-bottom: 1mm; }
`;

// ---------------------------------------------------------------------------
// Los cuatro documentos
// ---------------------------------------------------------------------------

const TEA_TDAH =
  'Ver la semana entera da tranquilidad al alumnado con trastorno del espectro del autismo (TEA) y ayuda a organizarse al que tiene trastorno por déficit de atención e hiperactividad (TDAH).';
const IMPRIMIR = 'Imprime al 100 % («Tamaño real»), sin «Ajustar a la página». Las hojas son apaisadas: la impresora las gira sola.';

// [selector, letra mínima en px, si mira también el alto]: lo que el script ajusta antes de imprimir.
const AJUSTE_SEMANA = [
  ['.nota', 6, false],
  ['.titulo', 20, false],
  ['.sub', 8, false],
];

const DOCUMENTOS = {
  'calendario-cole-2026-2027': {
    titulo: 'Calendario del cole 2026-2027 por meses (Cartagena)',
    hojas: () => hojasMes('Calendario del cole 2026-2027 por meses (Cartagena)'),
    css: CSS_MES,
    ajustes: [
      ['.txt', 5, true],
      ['.nota', 5, false],
      ['.titulo', 20, false],
      ['.sub', 8, false],
    ],
    guia: {
      titulo: 'Cómo usar el calendario del cole',
      entradilla:
        'Un mes en cada hoja, de septiembre de 2026 a junio de 2027. Cada mañana de cole trae el pictograma del colegio y cada día sin cole, su motivo. La tarde queda libre para escribir o pegar lo de cada casa.',
      clase: [
        'Escribe el nombre y la clase en las líneas de arriba y cuelga el mes a la altura de sus ojos.',
        'En la asamblea, buscad el día de hoy y tachad el de ayer. Avisa con tiempo de lo que cambia, como una excursión.',
        'Ver lo que va a pasar da tranquilidad al alumnado con trastorno del espectro del autismo (TEA).',
      ],
      casa: [
        'Escribe o pega en la tarde lo que toca después del cole, como la piscina o la logopedia.',
        'Antes de dormir, mirad juntos qué toca mañana y contad los días que faltan para algo especial.',
        'Si todavía no lee, pega pictogramas de 1,5 cm o haz un dibujo.',
      ],
      imprimir: IMPRIMIR,
    },
  },
  'calendario-semanal-cole-2026-2027': {
    titulo: 'Calendario del cole 2026-2027 por semanas (Cartagena)',
    hojas: () => hojasSemana('Calendario del cole 2026-2027 por semanas (Cartagena)'),
    css: CSS_SEMANA,
    ajustes: [['.txt', 6, true], ...AJUSTE_SEMANA],
    guia: {
      titulo: 'Cómo usar el calendario de cada semana',
      entradilla:
        'Una semana en cada hoja, de lunes a domingo, del 31 de agosto de 2026 al 4 de julio de 2027. Cada día tiene dos huecos de mañana y dos de tarde. Los días de cole traen el pictograma del colegio en el primer hueco y los días sin cole, su motivo.',
      clase: [
        'Imprime la hoja el viernes y repasad la semana siguiente el lunes, en la asamblea.',
        'Pon en cada hueco lo que toca, por ejemplo una sesión de PT (Pedagogía Terapéutica) o de AL (Audición y Lenguaje). Al terminar cada día, tachadlo juntos.',
        TEA_TDAH,
      ],
      casa: [
        'Haz una copia para casa: así la familia sabe qué toca cada día.',
        'El sábado y el domingo también tienen huecos, para los planes de la familia.',
        'Si todavía no lee, pega pictogramas de hasta 3 cm o haz un dibujo en cada hueco.',
      ],
      imprimir: IMPRIMIR,
    },
  },
  'semana-de-apoyos-2026-2027': {
    titulo: 'Semana de apoyos 2026-2027: PT, AL y asociación (Cartagena)',
    hojas: () => [
      portada(APOYOS, 'Semana de apoyos'),
      '<section class="montaje" data-montaje></section>',
      ...hojasCole(APOYOS, `Las ${SEMANAS_COLE} semanas del curso 2026-2027`),
      hojaTarjetas(APOYOS),
    ],
    css: `${CSS_APOYOS}${CSS_PORTADA}`,
    ajustes: [['.carta__texto', 8, true], ...AJUSTE_SEMANA],
    guia: {
      titulo: 'Cómo usar la semana de apoyos',
      entradilla: `Una hoja para cada semana de cole, de lunes a viernes, del 7 de septiembre de 2026 al 25 de junio de 2027. Cada día tiene tres huecos de mañana y dos de tarde. El primero de la mañana ya trae «Cole» o el motivo de no haber cole.`,
      clase: [
        'Pon en cada hueco la tarjeta de la sesión, por ejemplo PT (Pedagogía Terapéutica) o AL (Audición y Lenguaje). En las tarjetas en blanco, escribe la hora o un apoyo que no tenga tarjeta.',
        'Repasad la hoja el lunes y, cada mañana, mirad juntos qué toca.',
        'Los colores agrupan las tarjetas: morado, los apoyos en el cole; naranja, los de fuera; amarillo, los días distintos; crema, las tarjetas en blanco.',
      ],
      casa: [
        'Pon también lo de fuera del cole, como la asociación o la logopedia: así en el cole también lo saben.',
        'Haz una copia para casa: así la familia y el cole ven la misma semana.',
        'Las tarjetas miden 44&nbsp;×&nbsp;21&nbsp;mm, como las pequeñas de la «Agenda visual con pictogramas»: se pueden usar juntas.',
      ],
      imprimir: `Cómo montarla, en la página 2. Las tarjetas están en la página ${3 + SEMANAS_COLE}. ${IMPRIMIR}`,
    },
  },
  'semana-del-aula-2026-2027': {
    titulo: 'Semana del aula 2026-2027 (Cartagena)',
    hojas: () => [
      portada(AULA, 'Semana del aula'),
      '<section class="montaje" data-montaje></section>',
      ...hojasCole(AULA, `Las ${SEMANAS_COLE} semanas del curso 2026-2027`),
      hojaTarjetas(AULA),
    ],
    css: `${CSS_AULA}${CSS_PORTADA}`,
    ajustes: [['.carta__texto', 9, true], ...AJUSTE_SEMANA],
    guia: {
      titulo: 'Cómo usar la semana del aula',
      entradilla: `Una hoja para cada semana de cole, de lunes a viernes, del 7 de septiembre de 2026 al 25 de junio de 2027, con huecos grandes para verla desde lejos. Cada día tiene dos huecos de mañana y uno de tarde. Los días de cole llevan «Cole» junto al número y los días sin cole, el motivo en el primer hueco.`,
      clase: [
        'Cuélgala en la pared o déjala en la mesa, a la altura de sus ojos.',
        'En cada hueco cabe una tarjeta grande o dos pequeñas de la «Agenda visual con pictogramas». Cada día, quitad la tarjeta de lo que ya ha pasado.',
        TEA_TDAH,
      ],
      casa: [
        'Una copia en casa ayuda a hablar de lo que ha pasado en el cole.',
        'Los días sin cole, el primer hueco ya trae el motivo: deja ese hueco sin tarjeta.',
        'En las tarjetas en blanco, escribe o dibuja lo que no tenga tarjeta, como la piscina.',
      ],
      imprimir: `Cómo montarla, en la página 2. Las tarjetas están en la página ${3 + SEMANAS_COLE}. ${IMPRIMIR}`,
    },
  },
};

// ---------------------------------------------------------------------------
// El HTML
// ---------------------------------------------------------------------------

/**
 * Ajuste de las letras antes de imprimir: si una palabra no cabe, baja su letra 0,2 px cada vez hasta que
 * quepa o llegue al mínimo. Es lo que hacían los programas con los que se diseñaron los calendarios.
 * generar.mjs no da pasos extra: el script espera a las imágenes (el ancho del logo cuenta) y a las letras.
 * No toca la semana de ejemplo de la portada: está reducida con zoom, el navegador mide mal lo que cabe y
 * sus palabras son las mismas que las de las hojas de dentro.
 */
function script(ajustes) {
  return `
  (() => {
    const AJUSTES = ${JSON.stringify(ajustes)};
    const CARAS = ['700 12px Outfit', '800 12px Outfit', '900 12px Outfit', '400 12px "Atkinson Hyperlegible"', '700 12px "Atkinson Hyperlegible"'];
    const encoger = (t, minimo, alto) => {
      let tam = parseFloat(getComputedStyle(t).fontSize);
      while ((t.scrollWidth > t.clientWidth + 0.5 || (alto && t.scrollHeight > t.clientHeight + 0.5)) && tam > minimo) {
        tam -= 0.2;
        t.style.fontSize = tam + 'px';
      }
    };
    new Promise((listo) => (document.readyState === 'complete' ? listo() : addEventListener('load', listo, { once: true })))
      .then(() => Promise.all(CARAS.map((cara) => document.fonts.load(cara))))
      .then(() => document.fonts.ready)
      .then(() => {
        for (const [selector, minimo, alto] of AJUSTES) {
          document.querySelectorAll(selector).forEach((t) => t.closest('.muestra') || encoger(t, minimo, alto));
        }
        document.documentElement.dataset.ajustado = 'si';
      });
  })();
`;
}

function documento(id, doc) {
  const hojas = doc.hojas();
  return `<!doctype html>
<html lang="es-ES">
<head>
<meta charset="utf-8" />
<title>${e(doc.titulo)} · IdEducando</title>
<link rel="stylesheet" href="comun.css" />
<style>
/* Generado por calendarios-cole.mjs: no lo edites a mano. Lleva pictogramas de ARASAAC: licencia CC BY-NC-SA 4.0. */
${CSS_BASE}${doc.css}${CSS_GUIA}
</style>
</head>
<body>
${hojas.join('\n')}
${guia(id, doc)}
<script>${script(doc.ajustes)}</script>
</body>
</html>
`;
}

/** Escribe pdf/<id>.generado.html. `raiz` no hace falta aquí: se recibe como en los demás generadores. */
export function generarCalendario(raiz, carpetaPdf, id) {
  const doc = DOCUMENTOS[id];
  if (!doc) throw new Error(`calendarios-cole.mjs: no conozco el documento ${id}`);
  comprobarFechas();
  usados.clear();
  const html = documento(id, doc);
  const faltan = [...usados].filter((n) => !existsSync(join(carpetaPdf, 'pictogramas', `${n}.png`)));
  if (faltan.length) throw new Error(`calendarios-cole.mjs: faltan pictogramas en pdf/pictogramas: ${faltan.join(', ')}`);
  writeFileSync(join(carpetaPdf, `${id}.generado.html`), html);
}
