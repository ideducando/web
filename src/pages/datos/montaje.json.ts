// Catálogo de «¿Lo necesitas montado?» para la función de Netlify netlify/functions/montaje.mjs: lo que se
// puede pedir montado. La función solo acepta lo que está aquí, y el título y el enlace del aviso que nos
// llega salen de aquí, nunca de lo que escriba quien rellena el formulario. Se genera al construir la web.
import type { APIRoute } from 'astro';
import { materialesOrdenados } from '../../lib/materiales';
import { materialSeMonta, productoSeMonta } from '../../lib/montado';
import { ruta } from '../../lib/rutas';
import { productosOrdenados } from '../../lib/tienda';

export const GET: APIRoute = async () => {
  const materiales = (await materialesOrdenados()).filter(materialSeMonta).map((m) => ({
    id: `material:${m.id}`,
    titulo: m.data.titulo,
    ficha: ruta(`/material-gratuito/${m.id}/`),
    origen: 'material',
    // Lo que lleva pictogramas de ARASAAC tiene licencia CC (José, 28/10/2026).
    arasaac: m.data.licencia.startsWith('CC '),
  }));
  const tienda = (await productosOrdenados()).filter(productoSeMonta).map((p) => ({
    id: `tienda:${p.id}`,
    titulo: p.data.titulo,
    ficha: ruta(`/tienda/${p.id}/`),
    origen: 'tienda',
    arasaac: false,
  }));
  return new Response(JSON.stringify([...materiales, ...tienda]), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
