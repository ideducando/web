// Ayudas de la tienda (src/content/tienda). Hoy no se vende nada: cada producto enseña su portada,
// algunas páginas y el resto bloqueado, y un botón para escribirnos (José, 04/11/2026).
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Foto } from '../components/Galeria.astro';
import sitio from '../data/sitio.json';
import { ruta } from './rutas';

export type Producto = CollectionEntry<'tienda'>;

/** Los productos en el orden de la tienda (campo «orden», de menor a mayor). Sin los borradores. */
export async function productosOrdenados(): Promise<Producto[]> {
  const todos = await getCollection('tienda', (p) => !p.data.borrador);
  return todos.sort((a, b) => a.data.orden - b.data.orden || a.data.titulo.localeCompare(b.data.titulo, 'es'));
}

const dosCifras = (n: number) => String(n).padStart(2, '0');

/**
 * Fotos de la galería de un producto. Si la muestra no empieza por la página 1, va primero la portada.
 * Las imágenes las hace herramientas/vistas.mjs: las bloqueadas ya vienen difuminadas en el archivo.
 */
export function fotosDe(producto: Producto): Foto[] {
  const d = producto.data;
  const [ancho, alto] = d.orientacion === 'horizontal' ? [840, 594] : [594, 840];
  const de = d.paginas ? ` de ${d.paginas}` : '';
  const fotos: Foto[] = [];
  if (!d.muestra.some((m) => m.pagina === 1)) {
    fotos.push({ src: ruta(d.portada), mini: ruta(d.portada), ancho: 1200, alto: 900, alt: d.portada_alt, pie: 'Portada' });
  }
  // En el orden del libro: las nítidas y las bloqueadas, mezcladas, como al hojearlo.
  for (const m of [...d.muestra].sort((a, b) => a.pagina - b.pagina)) {
    const base = `/tienda/${producto.id}/pagina-${dosCifras(m.pagina)}`;
    fotos.push({
      src: ruta(`${base}.webp`),
      mini: ruta(`${base}-mini.webp`),
      ancho,
      alto,
      alt: m.bloqueada ? '' : (m.alt ?? ''),
      pie:
        m.pagina === 1
          ? 'Portada'
          : `${d.solo_muestra ? `Hoja ${m.pagina} de la muestra` : `Página ${m.pagina}${de}`}${m.bloqueada ? ' · bloqueada' : ''}`,
      bloqueada: m.bloqueada,
    });
  }
  return fotos;
}

/**
 * Enlace del botón «Ponte en contacto con nosotros»: abre el correo con el asunto y un mensaje empezado.
 * No guarda nada en la web: el mensaje va de su correo al nuestro.
 */
export function enlaceContacto(titulo: string): string {
  const asunto = `Me interesa: ${titulo}`;
  const cuerpo = [
    'Hola, equipo de IdEducando:',
    '',
    `Me interesa «${titulo}».`,
    '',
    'Soy (docente, familia, opositora…): ',
    'Lo querría en (descarga, kit para montar, ya montado…): ',
    '¿Cuántos?: ',
    'Lo que me gustaría saber: ',
    '',
    'Gracias.',
  ].join('\r\n');
  return `mailto:${sitio.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}
