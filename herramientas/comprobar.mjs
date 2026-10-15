// Revisa la web ya construida (carpeta dist/):
//   1. Que todos los enlaces y archivos internos existen y que ningún texto queda pegado a un enlace.
//   2. Que cada página pasa la revisión automática de accesibilidad de axe-core
//      con las pautas WCAG 2.2 de nivel A y AA.
//   3. Que nada se sale de la pantalla en el móvil, ni en Chromium (Chrome) ni en WebKit (Safari).
//
// Uso (desde la carpeta herramientas, después de «npm run build» en la raíz):
//   npm run comprobar
//
// Si algo falla, termina con error para que la comprobación del PR salga en rojo.

import { chromium, devices, webkit } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const dist = join(raiz, 'dist');
const PUERTO = 4329;

if (!existsSync(dist)) {
  console.error('No existe dist/. Ejecuta antes «npm run build» en la raíz del proyecto.');
  process.exit(1);
}

// La base de las direcciones (/web en GitHub Pages, ninguna en Netlify) se lee de la propia web construida.
const canonica = readFileSync(join(dist, 'index.html'), 'utf8').match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const BASE = canonica ? new URL(canonica).pathname.replace(/\/+$/, '') : '/web';

// ---------------------------------------------------------------------------
// 1. Enlaces internos
// ---------------------------------------------------------------------------

function paginasHtml(carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) return nombre === 'pagefind' ? [] : paginasHtml(ruta);
    return nombre.endsWith('.html') ? [ruta] : [];
  });
}

function existeEnDist(url) {
  const limpio = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!limpio.startsWith(`${BASE}/`) && limpio !== BASE) return true; // fuera de la web: no se revisa aquí
  const relativo = limpio.slice(BASE.length) || '/';
  const ruta = join(dist, relativo);
  if (relativo.endsWith('/')) return existsSync(join(ruta, 'index.html'));
  return existsSync(ruta) || existsSync(join(ruta, 'index.html'));
}

const paginas = paginasHtml(dist);
const rotos = [];
for (const archivo of paginas) {
  const html = readFileSync(archivo, 'utf8');
  for (const [, atributo, valor] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (!valor.startsWith('/') || valor.startsWith('//')) continue;
    if (!existeEnDist(valor)) rotos.push(`${archivo.replace(dist, '')} → ${atributo}="${valor}"`);
  }
}

console.log(`Enlaces revisados en ${paginas.length} páginas.`);
if (rotos.length) {
  console.error(`\n${rotos.length} enlaces internos rotos:`);
  for (const r of rotos) console.error(`  ${r}`);
}

// Palabras pegadas a un enlace o a una negrita, como «con la<a>lista</a>». Astro quita el salto de
// línea que hay entre un texto y la etiqueta que empieza en la línea siguiente: hay que escribir {' '}.
const pegadas = [];
for (const archivo of paginas) {
  const html = readFileSync(archivo, 'utf8');
  const patron = /(.{0,25})([\p{L}\p{N},;:]<(?:a|strong|em)\b[^>]*>|<\/(?:a|strong|em)>[\p{L}\p{N}])(.{0,20})/gu;
  for (const [, antes, pegado, despues] of html.matchAll(patron)) {
    pegadas.push(`${archivo.replace(dist, '')} → …${(antes + pegado + despues).replace(/\s+/g, ' ')}…`);
  }
}
if (pegadas.length) {
  console.error(`\n${pegadas.length} palabras pegadas a un enlace o a una negrita (falta un espacio):`);
  for (const p of pegadas) console.error(`  ${p}`);
}

// ---------------------------------------------------------------------------
// 2. Accesibilidad con axe-core
// ---------------------------------------------------------------------------

// Servidor mínimo que sirve dist/ bajo /web/, como GitHub Pages.
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
};

const servidor = createServer((peticion, respuesta) => {
  const camino = decodeURIComponent(new URL(peticion.url ?? '/', 'http://localhost').pathname);
  const enviar = (estado, ruta) => {
    respuesta.writeHead(estado, { 'content-type': TIPOS[extname(ruta)] ?? 'application/octet-stream' });
    respuesta.end(readFileSync(ruta));
  };
  if (!camino.startsWith(`${BASE}/`)) return enviar(404, join(dist, '404.html'));
  let ruta = join(dist, camino.slice(BASE.length));
  if (camino.endsWith('/')) ruta = join(ruta, 'index.html');
  else if (existsSync(join(ruta, 'index.html'))) {
    respuesta.writeHead(301, { location: `${camino}/` });
    return respuesta.end();
  }
  if (!ruta.startsWith(dist) || !existsSync(ruta) || statSync(ruta).isDirectory()) {
    return enviar(404, join(dist, '404.html'));
  }
  enviar(200, ruta);
});
await new Promise((listo) => servidor.listen(PUERTO, '127.0.0.1', listo));
const origen = `http://127.0.0.1:${PUERTO}`;

const urls = paginas
  .map((a) => a.replace(dist, '').replace(/index\.html$/, ''))
  .filter((u) => !u.endsWith('404.html'))
  .map((u) => `${origen}${BASE}${u}`);
urls.push(`${origen}${BASE}/404.html`);

// Cada pasada abre todas las páginas con un navegador y un tamaño de pantalla.
// En móvil se imita un iPhone (escala, pantalla táctil y etiqueta viewport).
// WebKit es el motor de Safari: la web tiene que verse bien en iPhone, no solo en Chrome.
const PASADAS = [
  { nombre: 'escritorio, 1280 px', motor: chromium, contexto: { viewport: { width: 1280, height: 900 } }, axe: true },
  { nombre: 'móvil, 390 px', motor: chromium, contexto: devices['iPhone 13'], axe: true },
  { nombre: 'móvil pequeño, 320 px', motor: chromium, contexto: devices['iPhone SE'], axe: false },
  { nombre: 'iPhone con WebKit, 390 px', motor: webkit, contexto: devices['iPhone 13'], axe: false },
];

const navegadores = new Map();
async function abrirNavegador(motor) {
  if (!navegadores.has(motor)) {
    try {
      navegadores.set(motor, await motor.launch());
    } catch (error) {
      if (process.env.CI) throw error;
      console.warn(`\nAviso: ${motor.name()} no está instalado en este equipo y se omite esa pasada. En GitHub Actions sí se revisa.`);
      navegadores.set(motor, null);
    }
  }
  return navegadores.get(motor);
}

// Busca lo que se sale por la derecha de la pantalla. Antes quita la red de seguridad
// (overflow-x: clip en html y body), que taparía el desborde en lugar de mostrarlo.
// Devuelve dónde empieza: los elementos que se salen aunque su contenedor no se salga.
async function desbordes(pagina) {
  await pagina.addStyleTag({ content: 'html, body { overflow-x: visible !important; }' });
  return pagina.evaluate(() => {
    const ancho = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= ancho + 1) return [];
    const fuera = [...document.querySelectorAll('body *')].filter((el) => {
      const caja = el.getBoundingClientRect();
      return caja.width > 0 && caja.right > ancho + 1;
    });
    return fuera
      .filter((el) => !fuera.includes(el.parentElement))
      .slice(0, 4)
      .map((el) => {
        const clases = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean) : [];
        const nombre = [el.tagName.toLowerCase(), ...clases].join('.');
        return `${nombre} (${Math.round(el.getBoundingClientRect().width)} px de ancho)`;
      });
  });
}

let problemas = 0;

for (const pasada of PASADAS) {
  const navegador = await abrirNavegador(pasada.motor);
  if (!navegador) continue;
  for (const url of urls) {
    const camino = url.replace(origen, '');
    const contexto = await navegador.newContext(pasada.contexto);
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: 'networkidle' });

    if (pasada.axe) {
      const resultado = await new AxeBuilder({ page: pagina })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      for (const v of resultado.violations) {
        problemas++;
        console.error(`\n[${pasada.nombre}] ${camino}\n  ${v.id}: ${v.help}`);
        for (const nodo of v.nodes.slice(0, 5)) console.error(`    · ${nodo.target.join(' ')}`);
      }
    }

    const fuera = await desbordes(pagina);
    if (fuera.length) {
      problemas++;
      console.error(`\n[${pasada.nombre}] ${camino}\n  La página es más ancha que la pantalla. Empieza a salirse en: ${fuera.join('; ')}`);
    }
    await contexto.close();
  }
}

for (const navegador of navegadores.values()) await navegador?.close();
servidor.close();

console.log(
  `\nRevisadas ${urls.length} páginas: accesibilidad en móvil (390 px) y en escritorio (1280 px), ` +
    'y que nada se salga de la pantalla también a 320 px y con WebKit, el motor de Safari.',
);
if (rotos.length || pegadas.length || problemas) {
  console.error(
    `\nResultado: ${rotos.length} enlaces rotos, ${pegadas.length} palabras pegadas y ${problemas} problemas de accesibilidad o de ancho.`,
  );
  process.exit(1);
}
console.log('Resultado: todo correcto.');
