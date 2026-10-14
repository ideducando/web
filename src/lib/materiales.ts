import { getCollection, type CollectionEntry } from 'astro:content';
import { existeArchivo } from './formatos';
import type { Dimension } from '../data/taxonomias';

export type Material = CollectionEntry<'materiales'>;

/**
 * Todos los materiales en el orden del escaparate:
 * primero los destacados, luego los que ya se pueden descargar y después los más nuevos.
 */
export async function materialesOrdenados(): Promise<Material[]> {
  const todos = await getCollection('materiales');
  return todos.sort((a, b) => {
    if (a.data.destacado !== b.data.destacado) return a.data.destacado ? -1 : 1;
    const da = existeArchivo(a.data.archivo);
    const db = existeArchivo(b.data.archivo);
    if (da !== db) return da ? -1 : 1;
    return b.data.fecha.getTime() - a.data.fecha.getTime();
  });
}

/** Materiales parecidos: comparten necesidades, etapa, sección o tipo. */
export function relacionados(material: Material, todos: Material[], cuantos = 3): Material[] {
  const puntos = (otro: Material) => {
    let p = 0;
    p += otro.data.necesidades.filter((n) => material.data.necesidades.includes(n)).length * 3;
    p += otro.data.etapas.filter((e) => material.data.etapas.includes(e)).length * 2;
    if (otro.data.seccion === material.data.seccion) p += 2;
    if (otro.data.tipo === material.data.tipo) p += 1;
    if (existeArchivo(otro.data.archivo)) p += 1;
    return p;
  };
  return todos
    .filter((otro) => otro.id !== material.id)
    .map((otro) => ({ otro, p: puntos(otro) }))
    .filter(({ p }) => p > 1)
    .sort((a, b) => b.p - a.p)
    .slice(0, cuantos)
    .map(({ otro }) => otro);
}

/** Cuántos materiales hay de cada opción de una dimensión. */
export function recuento(todos: Material[], campo: 'seccion' | 'tipo' | 'etapas' | 'necesidades') {
  const cuenta = new Map<string, number>();
  for (const m of todos) {
    const valor = m.data[campo];
    const valores = Array.isArray(valor) ? valor : [valor];
    for (const v of valores) cuenta.set(v, (cuenta.get(v) ?? 0) + 1);
  }
  return cuenta;
}

const CAMPO = { etapa: 'etapas', necesidad: 'necesidades', tipo: 'tipo' } as const;

/** ¿Este material pertenece a la categoría indicada? (etapa infantil, necesidad tea…) */
export function encajaEn(material: Material, dimension: Dimension, valor: string): boolean {
  const v = material.data[CAMPO[dimension]];
  return Array.isArray(v) ? (v as string[]).includes(valor) : v === valor;
}
