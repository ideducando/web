// Crea en el navegador un ZIP con varios archivos, sin pasar por ningún servidor. Los archivos van sin
// comprimir (método «almacenado»): los PDF ya vienen comprimidos por dentro, así que comprimirlos otra vez
// apenas ahorra peso y tarda más. Los nombres van en UTF-8. Lo abren Windows, Mac, Android e iPhone.

export interface ArchivoZip {
  nombre: string;
  datos: ArrayBuffer;
}

// Tabla del CRC-32, el número de control con el que el ZIP comprueba que cada archivo llega entero.
const TABLA_CRC = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  TABLA_CRC[n] = c >>> 0;
}

function crc32(datos: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < datos.length; i++) crc = TABLA_CRC[(crc ^ datos[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Fecha y hora en el formato de MS-DOS que guarda el ZIP. */
function fechaDos(fecha: Date) {
  return {
    hora: (fecha.getHours() << 11) | (fecha.getMinutes() << 5) | Math.floor(fecha.getSeconds() / 2),
    dia: ((fecha.getFullYear() - 1980) << 9) | ((fecha.getMonth() + 1) << 5) | fecha.getDate(),
  };
}

const UTF8 = 0x0800;

export function crearZip(archivos: ArchivoZip[], fecha = new Date()): Blob {
  const { hora, dia } = fechaDos(fecha);
  const codificador = new TextEncoder();
  const datos: BlobPart[] = [];
  const indice: BlobPart[] = [];
  let posicion = 0;
  let tamIndice = 0;

  for (const archivo of archivos) {
    const nombre = codificador.encode(archivo.nombre);
    const crc = crc32(new Uint8Array(archivo.datos));
    const tam = archivo.datos.byteLength;

    // Cabecera de cada archivo, justo antes de sus datos.
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, UTF8, true);
    local.setUint16(10, hora, true);
    local.setUint16(12, dia, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, tam, true);
    local.setUint32(22, tam, true);
    local.setUint16(26, nombre.length, true);
    datos.push(local.buffer, nombre, archivo.datos);

    // Su entrada en el índice del final, que dice dónde empieza cada archivo.
    const entrada = new DataView(new ArrayBuffer(46));
    entrada.setUint32(0, 0x02014b50, true);
    entrada.setUint16(4, 20, true);
    entrada.setUint16(6, 20, true);
    entrada.setUint16(8, UTF8, true);
    entrada.setUint16(12, hora, true);
    entrada.setUint16(14, dia, true);
    entrada.setUint32(16, crc, true);
    entrada.setUint32(20, tam, true);
    entrada.setUint32(24, tam, true);
    entrada.setUint16(28, nombre.length, true);
    entrada.setUint32(42, posicion, true);
    indice.push(entrada.buffer, nombre);

    posicion += 30 + nombre.length + tam;
    tamIndice += 46 + nombre.length;
  }

  // Cierre: cuántos archivos hay y dónde empieza el índice.
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamIndice, true);
  fin.setUint32(16, posicion, true);

  return new Blob([...datos, ...indice, fin.buffer], { type: 'application/zip' });
}
