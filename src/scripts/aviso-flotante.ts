// Enseña el aviso flotante (componente AvisoFlotante.astro) con un mensaje y se lo dice a los lectores
// de pantalla. Se cierra solo a los 8 segundos, salvo con el ratón o el foco encima, y antes con su botón
// o con la tecla Escape.

const ESPERA = 8000;

const caja = document.querySelector<HTMLElement>('[data-aviso-flotante]');
const texto = document.querySelector<HTMLElement>('[data-aviso-flotante-texto]');
const voz = document.querySelector<HTMLElement>('[data-aviso-voz]');

let temporizador: number | undefined;
let encima = false;
// Lo que tenía el foco al salir el aviso: si se cierra con el foco dentro, el foco vuelve ahí.
let origen: HTMLElement | null = null;

function cerrar() {
  window.clearTimeout(temporizador);
  encima = false;
  if (!caja || caja.hidden) return;
  const focoDentro = caja.contains(document.activeElement);
  caja.hidden = true;
  document.documentElement.style.removeProperty('scroll-padding-bottom');
  if (focoDentro) origen?.focus();
}

function programarCierre() {
  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => {
    if (!encima) cerrar();
  }, ESPERA);
}

if (caja) {
  caja.querySelector('[data-aviso-flotante-cerrar]')?.addEventListener('click', cerrar);
  caja.addEventListener('pointerenter', () => (encima = true));
  caja.addEventListener('pointerleave', () => {
    encima = false;
    programarCierre();
  });
  caja.addEventListener('focusin', () => (encima = true));
  caja.addEventListener('focusout', () => {
    encima = false;
    programarCierre();
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrar();
  });
}

export function avisar(mensaje: string) {
  if (voz) {
    // Se vacía antes para que el lector lo diga aunque el mensaje se repita igual.
    voz.textContent = '';
    window.setTimeout(() => (voz.textContent = mensaje), 60);
  }
  if (!caja || !texto) return;
  origen = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  texto.textContent = mensaje;
  caja.hidden = false;
  // Que el aviso no tape lo que tiene el foco: mientras se ve, se reserva su alto abajo de la pantalla.
  document.documentElement.style.scrollPaddingBottom = `${caja.offsetHeight + 16}px`;
  origen?.scrollIntoView({ block: 'nearest' });
  programarCierre();
}
