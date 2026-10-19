// La bolsa de descargas: los materiales que alguien va añadiendo para descargarlos todos juntos.
// Se guarda solo en su navegador (almacenamiento local, sin cookies) y no sale de su dispositivo.
// Cada cambio avisa a la página con el evento «bolsa:cambio» para que el contador y los botones
// se pongan al día, también si la bolsa se cambia desde otra pestaña.

const CLAVE = 'ideducando-bolsa';
export const EVENTO = 'bolsa:cambio';

export function leerBolsa(): string[] {
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
    // Sin almacenamiento local la bolsa no se recuerda, pero la página sigue funcionando.
  }
  document.dispatchEvent(new CustomEvent(EVENTO));
}

export function estaEnBolsa(id: string): boolean {
  return leerBolsa().includes(id);
}

export function anadirABolsa(id: string) {
  guardar([...leerBolsa(), id]);
}

export function quitarDeBolsa(id: string) {
  guardar(leerBolsa().filter((otro) => otro !== id));
}

export function vaciarBolsa() {
  guardar([]);
}

/** Avisa cuando la bolsa cambia en esta pestaña o en otra. */
export function alCambiarBolsa(funcion: () => void) {
  document.addEventListener(EVENTO, funcion);
  window.addEventListener('storage', (evento) => {
    if (evento.key === CLAVE) funcion();
  });
}
