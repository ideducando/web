// La mochila de descargas: los materiales que alguien va añadiendo para descargarlos todos juntos.
// Se guarda solo en su navegador (almacenamiento local, sin cookies) y no sale de su dispositivo.
// Cada cambio avisa a la página con el evento «mochila:cambio» para que el contador y los botones
// se pongan al día, también si la mochila se cambia desde otra pestaña.

const CLAVE = 'ideducando-mochila';
export const EVENTO = 'mochila:cambio';

// Hasta el 20/10/2026 se llamaba «Mi bolsa». Lo que alguien guardó con el nombre antiguo
// pasa una sola vez a la mochila, para que no lo pierda.
const CLAVE_ANTIGUA = 'ideducando-bolsa';
try {
  const antiguo = localStorage.getItem(CLAVE_ANTIGUA);
  if (antiguo !== null) {
    if (localStorage.getItem(CLAVE) === null) localStorage.setItem(CLAVE, antiguo);
    localStorage.removeItem(CLAVE_ANTIGUA);
  }
} catch {
  // Sin almacenamiento local no hay nada que pasar.
}

export function leerMochila(): string[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(guardado) ? guardado.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function guardar(ids: string[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...new Set(ids)]));
  } catch {
    // Sin almacenamiento local la mochila no se recuerda, pero la página sigue funcionando.
  }
  document.dispatchEvent(new CustomEvent(EVENTO));
}

export function estaEnMochila(id: string): boolean {
  return leerMochila().includes(id);
}

export function anadirAMochila(id: string) {
  guardar([...leerMochila(), id]);
}

export function quitarDeMochila(id: string) {
  guardar(leerMochila().filter((otro) => otro !== id));
}

export function vaciarMochila() {
  guardar([]);
}

/** Avisa cuando la mochila cambia en esta pestaña o en otra. */
export function alCambiarMochila(funcion: () => void) {
  document.addEventListener(EVENTO, funcion);
  window.addEventListener('storage', (evento) => {
    if (evento.key === CLAVE) funcion();
  });
}
