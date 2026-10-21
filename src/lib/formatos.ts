import { statSync } from 'node:fs';
import { join } from 'node:path';
import { formatoPeso } from './peso';

const fechaLarga = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
});

/** 14 de octubre de 2026 */
export function fecha(valor: Date): string {
  return fechaLarga.format(valor);
}

/** 2026-10-14, para el atributo datetime. */
export function fechaISO(valor: Date): string {
  return valor.toISOString().slice(0, 10);
}

/** Bytes de un archivo de public/, o 0 si no existe. */
export function bytesArchivo(rutaPublica?: string): number {
  if (!rutaPublica) return 0;
  try {
    return statSync(join(process.cwd(), 'public', rutaPublica)).size;
  } catch {
    return 0;
  }
}

/**
 * Peso de un archivo de public/ en formato legible (1,2 MB).
 * Se calcula al construir la web, así nunca queda desfasado.
 */
export function pesoArchivo(rutaPublica?: string): string | undefined {
  const bytes = bytesArchivo(rutaPublica);
  return bytes ? formatoPeso(bytes) : undefined;
}

/** Comprueba que el archivo de una ficha existe de verdad en public/. */
export function existeArchivo(rutaPublica?: string): boolean {
  if (!rutaPublica) return false;
  try {
    return statSync(join(process.cwd(), 'public', rutaPublica)).isFile();
  } catch {
    return false;
  }
}

/** Extensión en mayúsculas: PDF, ZIP… */
export function extension(rutaPublica?: string): string {
  return (rutaPublica?.split('.').pop() ?? '').toUpperCase();
}
