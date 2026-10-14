// Construye el HTML de la lista de comprobación a partir de src/data/programacion.json,
// el mismo archivo que usa la versión interactiva de la web. Así las dos no se separan nunca.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const coma = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
const esc = (t = '') => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function generarChecklist(raiz, carpetaPdf) {
  const datos = JSON.parse(readFileSync(join(raiz, 'src', 'data', 'programacion.json'), 'utf8'));
  const grupo = (id) => datos.grupos.find((g) => g.id === id);

  const lista = (g, color) => {
    const suma = g.items.reduce((s, i) => s + (i.puntos ?? 0), 0);
    return `
    <section class="grupo grupo--${color}">
      <h3>${esc(g.titulo)}</h3>
      ${g.nota ? `<p class="nota">${esc(g.nota)}</p>` : ''}
      <ul class="puntos">
        ${g.items
          .map(
            (i) => `<li>
          <span class="casilla" aria-hidden="true"></span>
          <div>
            <p class="texto">${esc(i.texto)}</p>
            ${i.detalle ? `<p class="detalle">${esc(i.detalle)}</p>` : ''}
            <p class="meta">${i.cero ? '<span class="cero">Cero si falla</span>' : ''}${
              i.puntos !== undefined ? `<span class="pts">${coma(i.puntos)} ${i.puntos === 1 ? 'punto' : 'puntos'}</span>` : ''
            }${i.ref ? `<span class="ref">${esc(i.ref)}</span>` : ''}</p>
          </div>
        </li>`,
          )
          .join('')}
      </ul>
      ${g.ref ? `<p class="fuente">${esc(g.ref)} de la convocatoria. Suma: ${coma(suma)} puntos.</p>` : ''}
    </section>`;
  };

  const html = `<!doctype html>
<html lang="es-ES">
<head>
  <meta charset="utf-8" />
  <title>Revisa tu programación: lista de comprobación del modelo de Murcia · IdEducando</title>
  <link rel="stylesheet" href="comun.css" />
  <style>
    .cabecera { display: flex; justify-content: space-between; align-items: flex-start; gap: 8mm; margin: 0 0 5mm; }
    .cabecera img { width: 46mm; height: auto; }
    .cabecera h1 { font-size: 24pt; margin-bottom: 2mm; }
    .cabecera .lema { font-family: var(--lema); font-size: 12pt; margin: 0; }
    .uso { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    .bloque { break-before: page; }
    .bloque--comun { break-before: auto; margin-top: 2mm; }
    .bloque > h2 { margin-top: 0; padding: 3mm 4mm; border-radius: 2.5mm; color: #fff; font-size: 16pt; }
    .bloque--comun > h2 { background: var(--marino); }
    .bloque--infantil > h2 { background: #9a6a00; }
    .bloque--pt > h2 { background: var(--morado-texto); }
    .grupo { margin: 0 0 5mm; }
    .grupo h3 { font-size: 13pt; margin: 0 0 2mm; }
    .nota { padding: 2.5mm 3.5mm; border-radius: 2mm; background: var(--coral-tinte); font-size: 10pt; }
    .puntos { list-style: none; padding: 0; margin: 0; }
    .puntos li { display: flex; gap: 3.5mm; padding: 1.6mm 0; border-bottom: 0.3mm solid var(--linea); break-inside: avoid; }
    .casilla { flex: none; width: 5.5mm; height: 5.5mm; margin-top: 0.6mm; border: 0.6mm solid var(--marino); border-radius: 1.2mm; background: #fff; }
    .texto { margin: 0; font-size: 10.5pt; }
    .detalle { margin: 0.5mm 0 0; font-size: 9pt; color: var(--suave); }
    .meta { margin: 0.8mm 0 0; font-size: 8.5pt; display: flex; flex-wrap: wrap; gap: 1mm 3mm; }
    .cero { padding: 0 2mm; border-radius: 99px; background: var(--coral-texto); color: #fff; font-weight: 700; }
    .pts { padding: 0 2mm; border-radius: 99px; background: var(--verde-tinte); font-weight: 700; }
    .ref { color: var(--suave); }
    .notas { border: 0.4mm solid var(--linea); border-radius: 3mm; padding: 4mm 5mm; break-inside: avoid; }
    .renglon { height: 9mm; border-bottom: 0.3mm solid var(--linea); }
  </style>
</head>
<body>
  <div data-miniatura>
    <div class="rayos" style="margin-bottom:6mm"></div>
    <div class="cabecera">
      <div>
        <p class="antetitulo">Oposiciones de Maestros · Región de Murcia</p>
        <h1>Revisa tu programación</h1>
        <p class="lema">Lista de comprobación del modelo de la convocatoria de 2026</p>
      </div>
      <img src="../../marca/09-logo-horizontal-transparente.png" alt="IdEducando" />
    </div>
    <div class="uso">
      <div class="caja caja--amarilla">
        <h3>Cómo usarla</h3>
        <p>Marca un punto solo si puedes decir en qué página de tu programación está. Si no lo encuentras, todavía no está.</p>
        <p>Empieza por las páginas comunes y sigue con las de tu especialidad: Infantil o PT.</p>
      </div>
      <div class="caja caja--azul">
        <h3>De dónde sale</h3>
        <p>Anexo VI y anexos XVII (Infantil) y XXII (PT) de la ${esc(datos.fuente.nombre)}.</p>
        <p>Revisada el 14/10/2026. <span class="borrador">[BORRADOR]</span></p>
      </div>
    </div>
    <div class="caja caja--coral">
      <p><strong>Lo primero:</strong> los cuatro requisitos marcados con «Cero si falla» dejan la programación con un 0 en todos sus indicadores. Revísalos antes que nada.</p>
    </div>
  </div>

  <div class="bloque bloque--comun">
    <h2>Para todas las especialidades</h2>
    ${lista(grupo('formales'), 'comun')}
    ${lista(grupo('entrega'), 'comun')}
  </div>

  <div class="bloque bloque--infantil">
    <h2>Si te presentas por Educación Infantil</h2>
    ${lista(grupo('especificos-infantil'), 'infantil')}
    ${lista(grupo('defensa-infantil'), 'infantil')}
    ${lista(grupo('unidad-infantil'), 'infantil')}
  </div>

  <div class="bloque bloque--pt">
    <h2>Si te presentas por Pedagogía Terapéutica</h2>
    ${lista(grupo('especificos-pt'), 'pt')}
    ${lista(grupo('defensa-pt'), 'pt')}
    ${lista(grupo('unidad-pt'), 'pt')}
  </div>

  <section class="notas" style="margin-top:6mm">
    <h3 style="margin-top:0">Mis notas: qué me falta y cuándo lo reviso</h3>
    ${'<div class="renglon"></div>'.repeat(8)}
  </section>

  <div class="creditos">
    <p><strong>Revisa tu programación.</strong> IdEducando, octubre de 2026. Versión interactiva: ideducando.github.io/web/oposiciones/programacion</p>
    <p>Licencia CC BY-NC-SA 4.0. Los criterios reproducidos son textos oficiales de la convocatoria (artículo 13 de la Ley de Propiedad Intelectual). Lo que vale es lo publicado en el BORM. Errores: hola@ideducando.es</p>
  </div>
</body>
</html>`;

  writeFileSync(join(carpetaPdf, 'checklist-programacion-murcia.generado.html'), html);
}
