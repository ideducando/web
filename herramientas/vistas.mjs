// Fotos de cada producto para la galería de su ficha, como en cualquier tienda: la portada y algunas
// páginas de dentro, que se pasan con las flechas, con las miniaturas o con el dedo.
//
// Uso (desde la carpeta herramientas, después de generar los PDF):
//   npm run vistas                                   todo el material gratuito
//   npm run vistas -- agenda-visual-semanal          solo uno
//   FUENTES_PAGO=/ruta/material-de-pago npm run vistas -- tienda    la tienda (o un producto: tienda/me-llamo-error)
//
// 1. Material gratuito. Lee cada PDF de public/descargas y guarda en public/vistas/<id>/ la página 1 y las
//    siguientes, hasta 5 (sin la hoja «Cómo montarlo», que ya sale en la ficha). Si la ficha tiene el campo
//    «vistas», usa esas páginas. Cada página va en webp de 1000 px por el lado largo y en miniatura de 160 px.
//    Apunta en src/data/vistas.json cuántas páginas tiene el PDF, el tamaño de cada foto y el título de
//    cada página, si se lee bien, que la ficha usa en el texto alternativo.
//
// 2. Tienda. Lee cada producto de src/content/tienda y su PDF de la carpeta privada FUENTES_PAGO, que no
//    está en este repositorio porque el repositorio es público. Hace la portada (1200 × 900) y las páginas
//    de la muestra: las nítidas, a 840 px por el lado largo, que se ven bien en pantalla y no sirven para
//    imprimir; y las bloqueadas, que se reducen a 110 px, se difuminan y se vuelven a agrandar, de modo que
//    el archivo publicado no guarda nada legible. Los PDF de pago nunca se copian a public/.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const requerir = createRequire(join(raiz, 'package.json'));
const sharp = requerir('sharp');
const { parse: leerYaml } = requerir('yaml');

const descargas = join(raiz, 'public', 'descargas');
const salidaGratis = join(raiz, 'public', 'vistas');
const salidaTienda = join(raiz, 'public', 'tienda');
const manifiesto = join(raiz, 'src', 'data', 'vistas.json');
const temporal = mkdtempSync(join(tmpdir(), 'ideducando-vistas-'));

const LADO = 1000; // lado largo de cada página del material gratuito
const LADO_TIENDA = 840; // lado largo de las páginas nítidas de la tienda
const LADO_BLOQUEADA = 110; // lo único que guarda una página bloqueada antes de agrandarla
const MINI = 160; // lado largo de las miniaturas
const MAXIMO = 5; // fotos por material gratuito si la ficha no dice otra cosa

const elegidos = process.argv.slice(2);
const soloTienda = elegidos.length > 0 && elegidos.every((e) => e === 'tienda' || e.startsWith('tienda/'));
const productosElegidos = elegidos.filter((e) => e.startsWith('tienda/')).map((e) => e.slice('tienda/'.length));

/** Frontmatter de un archivo Markdown, como objeto. */
function frontmatter(archivo) {
  const bloque = readFileSync(archivo, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return leerYaml(bloque) ?? {};
}

function paginasPdf(pdf) {
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  return Number(info.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0);
}

/** Pasa una página del PDF a PNG con Poppler, con su lado largo a `lado` píxeles. */
function pintar(pdf, pagina, lado) {
  const base = join(temporal, `p-${Date.now()}-${pagina}`);
  execFileSync('pdftoppm', ['-png', '-f', String(pagina), '-l', String(pagina), '-scale-to', String(lado), '-singlefile', pdf, base]);
  return `${base}.png`;
}

/**
 * Título de una página, para el texto alternativo de su foto: la primera línea del texto, si se lee bien.
 * Si no hay una línea clara (dibujos, letras sueltas), devuelve '' y la ficha dice solo «Página 3 de 12».
 */
function tituloDe(pdf, pagina) {
  let texto = '';
  try {
    texto = execFileSync('pdftotext', ['-f', String(pagina), '-l', String(pagina), '-layout', pdf, '-'], {
      encoding: 'utf8',
    });
  } catch {
    return '';
  }
  const primera = texto
    .split('\n')
    .map((l) => l.trim().split(/\s{2,}/)[0].trim())
    .find((l) => l && !/ideducando\.es|^\d+( de \d+)?$/i.test(l));
  if (!primera) return '';
  const titulo = suavizar(primera).replace(/[.:·\s]+$/, '');
  const letras = titulo.replace(/[^\p{L}]/gu, '').length;
  if (/^IdEducando$/i.test(titulo)) return '';
  if (titulo.length < 5 || titulo.length > 70 || letras < titulo.length * 0.6 || !/^[\p{L}¿¡«\d]/u.test(titulo)) return '';
  return titulo;
}

// Los antetítulos van en mayúsculas en el PDF; en el texto alternativo se leen mejor en minúsculas,
// salvo las siglas.
const SIGLAS = ['PT', 'AL', 'TEA', 'TDAH', 'TDL', 'DUA', 'BORM', 'BOE', 'ABC', 'CAA', 'LOMLOE', 'PTI', 'ARASAAC'];
const NOMBRES = ['Región de Murcia', 'Maestros', 'Educación Infantil', 'Infantil', 'Primaria', 'Pedagogía Terapéutica', 'Audición y Lenguaje'];
function suavizar(linea) {
  const letras = linea.replace(/[^\p{L}]/gu, '');
  if (letras.length < 6 || letras !== letras.toUpperCase()) return linea;
  let s = linea.toLowerCase();
  s = s.charAt(0).toUpperCase() + s.slice(1);
  for (const sigla of [...SIGLAS, ...NOMBRES]) {
    s = s.replace(new RegExp(`(?<!\\p{L})${sigla.toLowerCase()}(?!\\p{L})`, 'giu'), sigla);
  }
  return s;
}

async function guardarWebp(png, destino, { lado, calidad = 72, difuminar = 0 } = {}) {
  let imagen = sharp(png);
  if (lado) imagen = imagen.resize({ width: lado, height: lado, fit: 'inside' });
  if (difuminar) imagen = imagen.blur(difuminar);
  const info = await imagen.webp({ quality: calidad }).toFile(destino);
  return { ancho: info.width, alto: info.height };
}

// ---------------------------------------------------------------------------
// 1. Material gratuito
// ---------------------------------------------------------------------------

async function vistasGratis() {
  const carpeta = join(raiz, 'src', 'content', 'materiales');
  const datos = existsSync(manifiesto) ? JSON.parse(readFileSync(manifiesto, 'utf8')) : {};
  for (const archivo of readdirSync(carpeta).filter((a) => a.endsWith('.md')).sort()) {
    const id = archivo.replace(/\.md$/, '');
    if (elegidos.length && !elegidos.includes(id)) continue;
    const ficha = frontmatter(join(carpeta, archivo));
    const pdf = ficha.archivo ? join(raiz, 'public', ficha.archivo) : join(descargas, `${id}.pdf`);
    if (!ficha.archivo || !existsSync(pdf) || !pdf.endsWith('.pdf')) {
      delete datos[id];
      continue;
    }
    const total = paginasPdf(pdf);
    const seMonta = Array.isArray(ficha.pasos) && ficha.pasos.length > 0;
    const pedidas = Array.isArray(ficha.vistas) && ficha.vistas.length ? ficha.vistas : null;
    const paginas = (pedidas ?? [...Array(total).keys()].map((i) => i + 1).filter((p) => !(seMonta && p === 2)))
      .filter((p) => p >= 1 && p <= total)
      .slice(0, pedidas ? 12 : MAXIMO);

    const destino = join(salidaGratis, id);
    rmSync(destino, { recursive: true, force: true });
    mkdirSync(destino, { recursive: true });
    const fotos = [];
    for (const p of paginas) {
      const nn = String(p).padStart(2, '0');
      const png = pintar(pdf, p, LADO);
      const grande = await guardarWebp(png, join(destino, `pagina-${nn}.webp`), { calidad: 74 });
      const mini = await guardarWebp(png, join(destino, `pagina-${nn}-mini.webp`), { lado: MINI, calidad: 70 });
      fotos.push({ pagina: p, ...grande, mini_ancho: mini.ancho, mini_alto: mini.alto, titulo: tituloDe(pdf, p) });
    }
    datos[id] = { total, fotos };
    console.log(`Vistas listas: public/vistas/${id}/ (${fotos.length} de ${total} páginas)`);
  }
  const ordenado = Object.fromEntries(Object.entries(datos).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(manifiesto, `${JSON.stringify(ordenado, null, 2)}\n`);
}

// ---------------------------------------------------------------------------
// 2. Tienda
// ---------------------------------------------------------------------------

async function vistasTienda() {
  const fuentes = process.env.FUENTES_PAGO;
  if (!fuentes) {
    console.log(
      'Tienda: no se rehace. Para hacerla, di dónde está la carpeta privada del material de pago:\n' +
        '  FUENTES_PAGO=/ruta/material-de-pago npm run vistas -- tienda',
    );
    return;
  }
  const carpeta = join(raiz, 'src', 'content', 'tienda');
  const navegador = await chromium.launch();
  for (const archivo of readdirSync(carpeta).filter((a) => a.endsWith('.md')).sort()) {
    const id = archivo.replace(/\.md$/, '');
    if (productosElegidos.length && !productosElegidos.includes(id)) continue;
    const ficha = frontmatter(join(carpeta, archivo));
    if (!ficha.fuente) continue; // productos con ilustración propia: su portada ya está en public/tienda/<id>/
    const pdf = resolve(fuentes, ficha.fuente);
    if (!existsSync(pdf)) {
      console.warn(`Aviso: no encuentro ${ficha.fuente} en FUENTES_PAGO. Me salto ${id}.`);
      continue;
    }
    const destino = join(salidaTienda, id);
    mkdirSync(destino, { recursive: true });
    for (const viejo of readdirSync(destino).filter((a) => a.startsWith('pagina-'))) rmSync(join(destino, viejo));

    // Portada de la tarjeta: la página 1 sobre el fondo de la marca, nítida, como en el catálogo gratuito.
    // Si la ficha usa una ilustración propia (portada.svg), se deja tal cual.
    if (String(ficha.portada ?? '').endsWith('/portada.webp')) {
      const png = pintar(pdf, 1, 1100);
      await capturar(navegador, portada(png), join(destino, 'portada.webp'));
    }

    for (const m of ficha.muestra ?? []) {
      const nn = String(m.pagina).padStart(2, '0');
      if (m.bloqueada === false) {
        const nitida = pintar(pdf, m.pagina, LADO_TIENDA);
        await guardarWebp(nitida, join(destino, `pagina-${nn}.webp`), { calidad: 70 });
        await guardarWebp(nitida, join(destino, `pagina-${nn}-mini.webp`), { lado: MINI, calidad: 68 });
      } else {
        // Primero se reduce, así el archivo final no tiene más detalle que una miniatura borrosa.
        const pequena = pintar(pdf, m.pagina, LADO_BLOQUEADA);
        const borrosa = await sharp(pequena).blur(1.6).png().toBuffer();
        await sharp(borrosa)
          .resize({ width: 560, height: 560, fit: 'inside', kernel: 'cubic' })
          .blur(6)
          .webp({ quality: 60 })
          .toFile(join(destino, `pagina-${nn}.webp`));
        await sharp(borrosa)
          .resize({ width: MINI, height: MINI, fit: 'inside' })
          .blur(2)
          .webp({ quality: 60 })
          .toFile(join(destino, `pagina-${nn}-mini.webp`));
      }
    }
    console.log(`Tienda lista: public/tienda/${id}/ (portada y ${(ficha.muestra ?? []).length} páginas)`);
  }
  await navegador.close();
}

async function capturar(navegador, html, destino) {
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const archivoHtml = join(temporal, `portada-${Date.now()}.html`);
  writeFileSync(archivoHtml, html);
  await pagina.goto(pathToFileURL(archivoHtml).href, { waitUntil: 'networkidle' });
  const png = await pagina.screenshot({ type: 'png' });
  await pagina.close();
  await sharp(png).webp({ quality: 82 }).toFile(destino);
}

/** Portada de un producto de la tienda: la primera página, un poco girada, sobre los colores de la marca. */
function portada(png) {
  const src = pathToFileURL(png).href;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; height: 100%; }
    body { position: relative; overflow: hidden; background: #fde5e0; }
    .circulo { position: absolute; border-radius: 50%; }
    .rayos { position: absolute; left: 0; right: 0; bottom: 0; height: 14px;
      background: linear-gradient(90deg, #2f6fd6 0 20%, #1fa67a 20% 40%, #f6c12e 40% 60%, #e8553e 60% 80%, #8c4fb8 80% 100%); }
    .hoja { position: absolute; left: 50%; top: 50%; background: #fff; border-radius: 10px;
      box-shadow: 0 2px 0 rgb(30 43 85 / .08), 0 30px 60px -20px rgb(30 43 85 / .45); overflow: hidden; }
    .hoja img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .detras { width: var(--w); height: var(--h); transform: translate(-46%, -52%) rotate(5deg); background: #fffdf8; }
    .delante { width: var(--w); height: var(--h); transform: translate(-54%, -49%) rotate(-3deg); }
  </style></head><body>
    <div class="circulo" style="width:520px;height:520px;left:-160px;top:-180px;background:#fdf0c7"></div>
    <div class="circulo" style="width:420px;height:420px;right:-120px;bottom:-160px;background:#efe5f7"></div>
    <div class="hoja detras"></div>
    <div class="hoja delante"><img src="${src}" alt=""></div>
    <div class="rayos"></div>
    <script>
      const img = document.querySelector('img');
      const ajustar = () => {
        const apaisada = img.naturalWidth > img.naturalHeight;
        const w = apaisada ? 860 : 540;
        const h = Math.round(w * img.naturalHeight / img.naturalWidth);
        for (const el of document.querySelectorAll('.hoja')) { el.style.setProperty('--w', w + 'px'); el.style.setProperty('--h', h + 'px'); }
      };
      img.complete ? ajustar() : img.addEventListener('load', ajustar);
    </script>
  </body></html>`;
}

try {
  if (!soloTienda) await vistasGratis();
  if (soloTienda || !elegidos.length) await vistasTienda();
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
