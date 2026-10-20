// Genera los PDF del material gratuito y las portadas del catálogo.
//
// Uso (desde la carpeta herramientas):
//   npm install          (solo la primera vez)
//   npm run pdf          (todo)
//   npm run pdf -- agenda-visual-semanal   (solo un documento)
//   npm run pdf -- og-imagen               (solo la imagen para compartir)
//
// Qué hace:
//   1. Abre cada documento HTML de pdf/ en Chromium y lo imprime como PDF etiquetado
//      (accesible para lectores de pantalla) en public/descargas/.
//   2. Saca una miniatura de la primera página.
//   3. Crea la portada de cada ficha del catálogo (1200 × 900 px) en public/portadas/.
//   4. Crea la imagen para compartir en redes (public/og-imagen.png), con el lema de src/data/sitio.json.
//      Si cambia el lema, hay que rehacerla.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const carpetaPdf = join(aqui, 'pdf');
// Para probar un PDF sin tocar la web: IDE_SALIDA=/otra/carpeta npm run pdf -- id.
// Deja el PDF en esa carpeta y no rehace portadas ni la imagen para redes.
const salidaAparte = process.env.IDE_SALIDA;
const descargas = salidaAparte ?? join(raiz, 'public', 'descargas');
const portadas = join(raiz, 'public', 'portadas');
const temporal = salidaAparte ? join(salidaAparte, '.temporal') : join(aqui, '.temporal');
const sharp = createRequire(join(raiz, 'package.json'))('sharp');
const { parse: leerYaml } = createRequire(join(raiz, 'package.json'))('yaml');
const { hojaMontaje, tieneMontaje } = await import(pathToFileURL(join(raiz, 'src', 'lib', 'montaje.mjs')).href);

for (const carpeta of [descargas, portadas, temporal]) mkdirSync(carpeta, { recursive: true });

const fuentes = {
  outfit: pathToFileURL(join(raiz, 'node_modules/@fontsource/outfit/files/outfit-latin-700-normal.woff2')).href,
  outfit600: pathToFileURL(join(raiz, 'node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff2')).href,
  young: pathToFileURL(join(raiz, 'node_modules/@fontsource/young-serif/files/young-serif-latin-400-normal.woff2')).href,
  atkinson: pathToFileURL(
    join(raiz, 'node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2'),
  ).href,
};

/** Documentos que se imprimen. `antes` prepara el HTML si se genera a partir de datos. */
const DOCUMENTOS = [
  {
    id: 'guia-oposiciones-murcia-pt-infantil',
    asunto: 'Guía de las oposiciones de Maestros en la Región de Murcia para Pedagogía Terapéutica y Educación Infantil',
    palabras: 'oposiciones, Maestros, Región de Murcia, Pedagogía Terapéutica, Educación Infantil, programación',
  },
  {
    id: 'checklist-programacion-murcia',
    asunto: 'Lista de comprobación de la programación y del programa de intervención según la convocatoria de Murcia',
    palabras: 'oposiciones, programación didáctica, programa de intervención, anexo VI, Región de Murcia',
    antes: () => import('./pdf/checklist.mjs').then((m) => m.generarChecklist(raiz, carpetaPdf)),
  },
  {
    id: 'agenda-visual-semanal',
    asunto: 'Plantillas de agenda visual semanal, agenda del día y tablero de primero y después',
    palabras: 'agenda visual, pictogramas, TEA, anticipación, DUA, Infantil, Primaria',
  },
  {
    id: 'registro-observacion-abc',
    asunto: 'Hoja de registro de observación ABC: antecedente, conducta y consecuencia',
    palabras: 'registro ABC, observación, conducta, apoyo conductual positivo, Infantil, Primaria',
  },
  {
    id: 'tablero-comunicacion-basico',
    asunto:
      'Tablero de comunicación de vocabulario núcleo, primer tablero de 12 casillas y llavero de comunicación con pictogramas de ARASAAC, con guía de modelado y nota para las familias',
    palabras: 'comunicación aumentativa, SAAC, CAA, vocabulario núcleo, tablero de comunicación, pictogramas, ARASAAC, TEA, Infantil, Primaria',
  },
  {
    id: 'programa-intervencion-pt-ejemplo',
    asunto:
      'Programa de intervención de Pedagogía Terapéutica de ejemplo, modelo de la Región de Murcia, comentado con los indicadores del tribunal',
    palabras: 'oposiciones, Pedagogía Terapéutica, programa de intervención, unidades de actuación, PAP, Región de Murcia, anexo XXII',
  },
  {
    id: 'rincon-de-la-calma',
    asunto: 'Rincón de la calma: termómetro de emociones de cinco niveles, cartel, tarjetas de estrategias y plan de calma personal',
    palabras: 'rincón de la calma, regulación emocional, autorregulación, emociones, apoyo conductual positivo, Infantil, Primaria',
  },
  {
    id: 'cuento-lectura-facil-cole-nuevo',
    asunto: 'Cuento escrito con las pautas de lectura fácil para anticipar el primer día en un colegio nuevo, con versión para fotos del centro',
    palabras: 'lectura fácil, cuento adaptado, anticipación, acogida, cambio de colegio, TEA, pictogramas, Infantil, Primaria',
  },
  {
    id: 'kit-examen-oposiciones-murcia',
    asunto:
      'Kit de plantillas para preparar la oposición de Maestros en la Región de Murcia (Pedagogía Terapéutica e Infantil): guion de un folio, reloj del oral, caja de material auxiliar, hoja de simulacro, plan del escrito y lista para el día del examen',
    palabras: 'oposiciones, Maestros, Región de Murcia, Pedagogía Terapéutica, Educación Infantil, segunda prueba, primera prueba, guion, unidad didáctica, simulacro',
  },
  {
    id: 'dias-distintos-historias-sociales',
    asunto:
      'Seis historias sociales con pictogramas para anticipar un simulacro, una sustitución, una excursión, una fiesta, un recreo en clase y un cambio de horario, con plantilla, tarjetas para la agenda visual, guía y nota para las familias',
    palabras: 'historias sociales, narrativas sociales, anticipación, cambios de rutina, simulacro, agenda visual, lectura fácil, pictogramas, ARASAAC, TEA, Infantil, Primaria',
  },
  {
    id: 'pausas-activas-de-pie-y-sentados',
    asunto:
      'Pausas activas para todos: 24 cartas de movimiento con versión de pie y versión sentada para calmar, activar o concentrar, con cartel, dado, ruleta, guía para docentes y nota para las familias',
    palabras: 'pausas activas, movimiento en el aula, actividad física, inclusión, discapacidad motora, silla de ruedas, TDAH, TEA, DUA, Infantil, Primaria',
  },
  {
    id: 'tarjeta-cole-casa-tdah',
    asunto:
      'Tarjeta diaria cole-casa para el TDAH en versión visual para Infantil y para Primaria, con banco de 24 objetivos, menú de recompensas, registro y gráfica de progreso y apoyos de funciones ejecutivas',
    palabras: 'tarjeta diaria, daily report card, TDAH, cole-casa, familias, funciones ejecutivas, refuerzo positivo, apoyo conductual positivo, pictogramas, ARASAAC, Infantil, Primaria',
  },
  {
    id: 'tren-de-las-silabas',
    asunto:
      'Juegos de conciencia fonológica con pictogramas de ARASAAC: tren de las sílabas con 40 tarjetas, parejas que riman, trenes de sonido inicial, hoja de seguimiento, guía para docentes y nota para las familias',
    palabras: 'conciencia fonológica, sílabas, rima, sonido inicial, prelectura, Audición y Lenguaje, TDL, pictogramas, ARASAAC, Infantil, Primaria',
  },
  {
    id: 'kit-bienvenida-alumnado-recien-llegado',
    asunto:
      'Kit de bienvenida para el alumnado recién llegado que aún no habla castellano: tarjetas de comunicación en seis lenguas, frases para el docente, pasaporte del cole, palabra del día y carta para la familia, con guía para docentes',
    palabras: 'acogida, incorporación tardía, alumnado extranjero, recién llegados, interculturalidad, árabe, rumano, ucraniano, inglés, francés, pictogramas, ARASAAC, periodo de silencio, Infantil, Primaria',
  },
  {
    id: 'situacion-aprendizaje-3-anos-emociones',
    asunto:
      'Situación de aprendizaje para 3 años sobre las emociones, en 8 sesiones, con el Diseño Universal para el Aprendizaje y actividades en tres niveles: el grupo construye su rincón de la calma. Con conexión al currículo de Infantil de la Región de Murcia, evaluación, ajustes, imprimibles y nota para las familias',
    palabras: 'situación de aprendizaje, Educación Infantil, 3 años, emociones, rincón de la calma, DUA, multinivel, sesiones, Decreto 196/2022, Región de Murcia, oposiciones, pictogramas, ARASAAC',
  },
  {
    id: 'situacion-aprendizaje-4-anos-huerto',
    asunto:
      'Situación de aprendizaje para 4 años sobre las plantas y la alimentación saludable, en 8 sesiones, con el Diseño Universal para el Aprendizaje y actividades en tres niveles: el grupo cultiva su huerto y prepara un almuerzo sano. Con conexión al currículo de Infantil de la Región de Murcia, evaluación, ajustes, imprimibles y nota para las familias',
    palabras: 'situación de aprendizaje, Educación Infantil, 4 años, huerto escolar, plantas, semillas, alimentación saludable, método científico, DUA, multinivel, sesiones, Decreto 196/2022, Región de Murcia, oposiciones, pictogramas, ARASAAC',
  },
  {
    id: 'situacion-aprendizaje-5-anos-mapa-del-cole',
    asunto:
      'Situación de aprendizaje para 5 años sobre la orientación en el espacio, en 8 sesiones, con el Diseño Universal para el Aprendizaje y actividades en tres niveles: el grupo hace el mapa y las señales con pictogramas de su cole y guía a los recién llegados. Con conexión al currículo de Infantil de la Región de Murcia, evaluación, ajustes, imprimibles y nota para las familias',
    palabras: 'situación de aprendizaje, Educación Infantil, 5 años, orientación espacial, mapa, señalización con pictogramas, accesibilidad cognitiva, pensamiento computacional, DUA, multinivel, sesiones, Decreto 196/2022, Región de Murcia, oposiciones, pictogramas, ARASAAC',
  },
  {
    id: 'estaciones-matematicas-otono',
    asunto:
      'Seis estaciones de matemáticas manipulativas de otoño para Educación Infantil, en tres niveles y con una versión segura sin piezas pequeñas: cantidad, correspondencia, series, clasificación, orden por tamaño y medida. Con tarjetas de pasos con pictogramas, registro de observación, ajustes para la diversidad, nota para las familias y tarjetas opcionales de fiesta',
    palabras: 'matemáticas manipulativas, estaciones de aprendizaje, rincones, otoño, Educación Infantil, cantidad, correspondencia, series, clasificación, seriación, medida, DUA, multinivel, seguridad, Decreto 196/2022, Región de Murcia, pictogramas, ARASAAC',
  },
];

const elegidos = process.argv.slice(2);
const navegador = await chromium.launch();

// ---------------------------------------------------------------------------
// 1 y 2. PDF y miniaturas
// ---------------------------------------------------------------------------

for (const doc of DOCUMENTOS) {
  if (elegidos.length && !elegidos.includes(doc.id)) continue;
  if (doc.antes) await doc.antes();

  const html = [join(carpetaPdf, `${doc.id}.html`), join(carpetaPdf, `${doc.id}.generado.html`)].find(existsSync);
  if (!html) throw new Error(`No encuentro el HTML de ${doc.id}`);

  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 1700 }, deviceScaleFactor: 1.5 });
  await pagina.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  // Comprueba que las letras de la marca se han cargado (si no, Chromium usaría otra y el PDF saldría distinto).
  const letras = await pagina.evaluate(() =>
    ['400 12px "Atkinson Hyperlegible"', '700 12px "Outfit"'].map((f) => [f, document.fonts.check(f)]),
  );
  for (const [familia, cargada] of letras) if (!cargada) throw new Error(`${doc.id}: no se ha cargado ${familia}`);

  // Página «Cómo montarlo»: sale de los datos de la ficha, para que la web y el PDF digan lo mismo.
  const ficha = leerFicha(doc.id);
  const hueco = await pagina.locator('[data-montaje]').count();
  if (tieneMontaje(ficha)) {
    if (!hueco) throw new Error(`${doc.id}: la ficha tiene pasos de montaje y al HTML le falta <section class="montaje" data-montaje>`);
    await pagina.evaluate((html) => {
      document.querySelector('[data-montaje]').outerHTML = html;
    }, hojaMontaje(ficha));
    await pagina.evaluate(() => document.fonts.ready);
  } else if (hueco) {
    throw new Error(`${doc.id}: el HTML tiene el hueco de montaje y la ficha no tiene pasos`);
  }

  const destino = join(descargas, `${doc.id}.pdf`);
  await pagina.pdf({
    path: destino,
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  });

  completarMetadatos(destino, doc);

  // Miniatura de la primera página: con pdftoppm (Poppler) si está instalado, que la pinta igual que el PDF.
  const miniatura = join(temporal, doc.id);
  try {
    execFileSync('pdftoppm', ['-png', '-r', '110', '-f', '1', '-l', '1', '-singlefile', destino, miniatura]);
  } catch {
    await pagina.locator('[data-miniatura]').first().screenshot({ path: `${miniatura}.png` });
  }
  await pagina.close();
  console.log(`PDF listo: ${salidaAparte ? destino : `public/descargas/${doc.id}.pdf`}`);
}

// ---------------------------------------------------------------------------
// 3. Portadas del catálogo
// ---------------------------------------------------------------------------

const COLORES = {
  aula: { fondo: '#dcf3ea', circulo1: '#fdf0c7', circulo2: '#e4edfb', banda: '#1fa67a' },
  oposiciones: { fondo: '#efe5f7', circulo1: '#fdf0c7', circulo2: '#e4edfb', banda: '#8c4fb8' },
};

const carpetaMateriales = join(raiz, 'src', 'content', 'materiales');
for (const archivo of readdirSync(carpetaMateriales).filter((a) => a.endsWith('.md'))) {
  const id = archivo.replace(/\.md$/, '');
  if (salidaAparte || (elegidos.length && !elegidos.includes(id))) continue;
  const datos = leerFrontmatter(readFileSync(join(carpetaMateriales, archivo), 'utf8'));
  const color = COLORES[datos.seccion] ?? COLORES.aula;
  const miniatura = join(temporal, `${id}.png`);
  const html = existsSync(miniatura)
    ? portadaProducto(miniatura, color)
    : portadaProximamente(datos.titulo, datos.tipo, color);
  await capturar(html, 1200, 900, join(portadas, `${id}.webp`));
  console.log(`Portada lista: public/portadas/${id}.webp`);
}

// ---------------------------------------------------------------------------
// 4. Imagen para compartir en redes
// ---------------------------------------------------------------------------

if ((!elegidos.length || elegidos.includes('og-imagen')) && !salidaAparte) {
  await capturar(imagenRedes(), 1200, 630, join(raiz, 'public', 'og-imagen.png'));
  console.log('Imagen para redes lista: public/og-imagen.png');
}

await navegador.close();
rmSync(temporal, { recursive: true, force: true });

// ---------------------------------------------------------------------------
// Ayudas
// ---------------------------------------------------------------------------

/** Título, autoría y palabras clave en el PDF, y que el visor muestre el título. Usa Python con pypdf. */
function completarMetadatos(ruta, doc) {
  try {
    execFileSync('python3', ['-I', join(aqui, 'metadatos.py'), ruta, doc.asunto, doc.palabras], { stdio: 'inherit' });
  } catch {
    console.warn(`Aviso: no se han podido completar los metadatos de ${doc.id} (¿falta Python con pypdf?).`);
  }
}

async function capturar(html, ancho, alto, destino) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const temporalHtml = join(temporal, `captura-${Date.now()}.html`);
  writeFileSync(temporalHtml, html);
  await pagina.goto(pathToFileURL(temporalHtml).href, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  const png = await pagina.screenshot({ type: 'png' });
  await pagina.close();
  if (destino.endsWith('.webp')) await sharp(png).webp({ quality: 82 }).toFile(destino);
  else await sharp(png).png({ compressionLevel: 9 }).toFile(destino);
}

function estilosBase() {
  return `
    @font-face { font-family: 'Outfit'; font-weight: 700; src: url('${fuentes.outfit}') format('woff2'); }
    @font-face { font-family: 'Outfit'; font-weight: 600; src: url('${fuentes.outfit600}') format('woff2'); }
    @font-face { font-family: 'Young Serif'; src: url('${fuentes.young}') format('woff2'); }
    @font-face { font-family: 'Atkinson Hyperlegible'; font-weight: 700; src: url('${fuentes.atkinson}') format('woff2'); }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; height: 100%; }
    body { position: relative; overflow: hidden; color: #1e2b55; }
    .circulo { position: absolute; border-radius: 50%; }
    .rayos { position: absolute; left: 0; right: 0; bottom: 0; height: 14px;
      background: linear-gradient(90deg, #2f6fd6 0 20%, #1fa67a 20% 40%, #f6c12e 40% 60%, #e8553e 60% 80%, #8c4fb8 80% 100%); }
  `;
}

function portadaProducto(miniatura, color) {
  const src = pathToFileURL(miniatura).href;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    ${estilosBase()}
    body { background: ${color.fondo}; }
    .hoja { position: absolute; left: 50%; top: 50%; background: #fff; border-radius: 10px;
      box-shadow: 0 2px 0 rgb(30 43 85 / .08), 0 30px 60px -20px rgb(30 43 85 / .45); overflow: hidden; }
    .hoja img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .detras { width: var(--w); height: var(--h); transform: translate(-46%, -52%) rotate(5deg); background: #fffdf8; }
    .delante { width: var(--w); height: var(--h); transform: translate(-54%, -49%) rotate(-3deg); }
    .pegatina { position: absolute; right: 110px; top: 90px; width: 190px; height: 190px; border-radius: 50%;
      background: #f6c12e; display: grid; place-content: center; text-align: center; transform: rotate(8deg);
      box-shadow: 0 6px 0 rgb(30 43 85 / .18); font-family: 'Outfit'; }
    .pegatina b { display: block; font-size: 46px; line-height: 1; }
    .pegatina span { font-size: 24px; font-weight: 600; }
  </style></head><body>
    <div class="circulo" style="width:520px;height:520px;left:-160px;top:-180px;background:${color.circulo1}"></div>
    <div class="circulo" style="width:420px;height:420px;right:-120px;bottom:-160px;background:${color.circulo2}"></div>
    <div class="hoja detras" id="detras"></div>
    <div class="hoja delante" id="delante"><img src="${src}" alt=""></div>
    <div class="pegatina"><b>GRATIS</b><span>PDF</span></div>
    <div class="rayos"></div>
    <script>
      const img = document.querySelector('img');
      const ajustar = () => {
        const apaisada = img.naturalWidth > img.naturalHeight;
        const w = apaisada ? 820 : 520;
        const h = Math.round(w * img.naturalHeight / img.naturalWidth);
        for (const el of document.querySelectorAll('.hoja')) { el.style.setProperty('--w', w + 'px'); el.style.setProperty('--h', h + 'px'); }
      };
      img.complete ? ajustar() : img.addEventListener('load', ajustar);
    </script>
  </body></html>`;
}

function portadaProximamente(titulo, tipo, color) {
  const tipos = {
    plantilla: 'Plantilla', 'apoyo-visual': 'Apoyo visual', fichas: 'Fichas de trabajo', juego: 'Juego',
    cuento: 'Cuento adaptado', guia: 'Guía', lista: 'Lista de comprobación', programacion: 'Programación',
  };
  const simbolo = readFileSync(join(raiz, 'marca', 'simbolo.svg'), 'utf8');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    ${estilosBase()}
    body { background: ${color.fondo}; }
    .tarjeta { position: absolute; inset: 120px 130px 130px; background: #fffdf8; border-radius: 28px;
      border: 5px dashed ${color.banda}; padding: 64px 70px; display: flex; flex-direction: column; justify-content: center;
      transform: rotate(-1.5deg); box-shadow: 0 30px 60px -30px rgb(30 43 85 / .4); }
    .tipo { font-family: 'Outfit'; font-weight: 700; font-size: 26px; letter-spacing: .08em; text-transform: uppercase; color: #46578c; margin: 0 0 18px; }
    h1 { font-family: 'Outfit'; font-weight: 700; font-size: 58px; line-height: 1.08; margin: 0; }
    .cinta { position: absolute; right: 70px; top: 70px; padding: 14px 30px; border-radius: 999px; background: #fff;
      border: 4px solid #1e2b55; font-family: 'Outfit'; font-weight: 700; font-size: 30px; transform: rotate(6deg); }
    .simbolo { position: absolute; left: 60px; bottom: 50px; width: 150px; height: 150px; }
    .simbolo svg { width: 100%; height: 100%; }
  </style></head><body>
    <div class="circulo" style="width:520px;height:520px;left:-160px;top:-200px;background:${color.circulo1}"></div>
    <div class="circulo" style="width:420px;height:420px;right:-140px;bottom:-170px;background:${color.circulo2}"></div>
    <div class="tarjeta"><p class="tipo">${tipos[tipo] ?? ''}</p><h1>${escapar(titulo)}</h1></div>
    <div class="cinta">Próximamente</div>
    <div class="simbolo">${simbolo}</div>
    <div class="rayos"></div>
  </body></html>`;
}

function imagenRedes() {
  const { lema } = JSON.parse(readFileSync(join(raiz, 'src', 'data', 'sitio.json'), 'utf8'));
  const logo = pathToFileURL(join(raiz, 'marca', '08-logo-vertical-transparente.png')).href;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    ${estilosBase()}
    body { background: #fff6e6; display: flex; align-items: center; gap: 56px; padding: 0 90px 14px; }
    img { width: 380px; height: auto; flex: none; }
    p { font-family: 'Young Serif'; font-size: 64px; line-height: 1.12; margin: 0; }
    small { display: block; margin-top: 26px; font-family: 'Outfit'; font-weight: 600; font-size: 30px; color: #7a3fa5; }
  </style></head><body>
    <div class="circulo" style="width:360px;height:360px;right:-90px;top:-120px;background:#fdf0c7"></div>
    <img src="${logo}" alt="">
    <p style="position:relative">${escapar(lema)}<small>Material gratuito de PT e Infantil</small></p>
    <div class="rayos"></div>
  </body></html>`;
}

/** Todos los datos de la ficha de un material (el frontmatter de su .md). */
function leerFicha(id) {
  const archivo = join(raiz, 'src', 'content', 'materiales', `${id}.md`);
  if (!existsSync(archivo)) return {};
  const bloque = readFileSync(archivo, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return leerYaml(bloque) ?? {};
}

/** Lee los campos sencillos del frontmatter de una ficha (titulo, seccion, tipo). */
function leerFrontmatter(texto) {
  const bloque = texto.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const valor = (clave) => {
    const linea = bloque.match(new RegExp(`^${clave}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? '';
    return linea.replace(/^["']|["']$/g, '');
  };
  return { titulo: valor('titulo'), seccion: valor('seccion'), tipo: valor('tipo') };
}

function escapar(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
