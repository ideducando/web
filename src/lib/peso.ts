// Peso de un archivo en formato legible (850 KB, 1,2 MB). Vale igual al construir la web y en el navegador.

export function formatoPeso(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB`;
}
