// Revisa la web ya construida (carpeta dist/):
//   1. Que todos los enlaces y archivos internos existen.
//   2. Que cada página pasa la revisión automática de accesibilidad de axe-core
//      con las pautas WCAG 2.2 de nivel A y AA.
//
// Uso (desde la carpeta herramientas, después de «npm run build» en la raíz):
//   npm run comprobar
//
// Si algo falla, termina con error para que la comprobación del PR salga en rojo.

import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const dist = join(raiz, 'dist');
const BASE = '/web';
const PUERTO = 4329;

if (!existsSync(dist)) {
  console.error('No existe dist/. Ejecuta antes «npm run build» en la raíz del proyecto.');
  process.exit(1);
}

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

const navegador = await chromium.launch();
let problemas = 0;

for (const url of urls) {
  for (const ancho of [390, 1280]) {
    const contexto = await navegador.newContext({ viewport: { width: ancho, height: 900 } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: 'networkidle' });
    const resultado = await new AxeBuilder({ page: pagina })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    await contexto.close();

    for (const v of resultado.violations) {
      problemas++;
      console.error(`\n[${ancho}px] ${url.replace(origen, '')}\n  ${v.id}: ${v.help}`);
      for (const nodo of v.nodes.slice(0, 5)) console.error(`    · ${nodo.target.join(' ')}`);
    }
    if (desborde) {
      problemas++;
      console.error(`\n[${ancho}px] ${url.replace(origen, '')}\n  La página es más ancha que la pantalla (desplazamiento horizontal).`);
    }
  }
}

await navegador.close();
servidor.close();

console.log(`\nAccesibilidad revisada en ${urls.length} páginas, en móvil (390 px) y en escritorio (1280 px).`);
if (rotos.length || problemas) {
  console.error(`\nResultado: ${rotos.length} enlaces rotos y ${problemas} problemas de accesibilidad.`);
  process.exit(1);
}
console.log('Resultado: todo correcto.');
