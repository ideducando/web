// Catálogo de Mi mochila para la función de Netlify que manda el material por correo
// (netlify/functions/mochila.mjs). La función solo envía enlaces que estén aquí, nunca lo que escriba
// quien rellena el formulario. Se genera al construir la web, así que siempre coincide con las fichas.
import type { APIRoute } from 'astro';
import { TIPOS } from '../../data/taxonomias';
import { existeArchivo, extension, pesoArchivo } from '../../lib/formatos';
import { materialesOrdenados } from '../../lib/materiales';
import { ruta } from '../../lib/rutas';

export const GET: APIRoute = async () => {
  const catalogo = (await materialesOrdenados())
    .filter((m) => existeArchivo(m.data.archivo))
    .map((m) => ({
      id: m.id,
      titulo: m.data.titulo,
      tipo: TIPOS[m.data.tipo].nombre,
      ficha: ruta(`/material-gratuito/${m.id}/`),
      archivo: ruta(m.data.archivo!),
      detalle: [extension(m.data.archivo), pesoArchivo(m.data.archivo), m.data.paginas && `${m.data.paginas} páginas`]
        .filter(Boolean)
        .join(', '),
      montaje: m.data.pasos.length > 0,
    }));
  return new Response(JSON.stringify(catalogo), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
