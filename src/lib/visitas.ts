// Estadísticas de la web con Umami Cloud (José, 26/11/2026). Sin cookies, sin guardar nada en el navegador y
// sin datos personales. La cuenta es de hola@ (plan Hobby, gratis; región de la Unión Europea) y la lleva José.
// El script va en src/components/Visitas.astro y lo explica la política de privacidad (src/content/paginas/privacidad.md).
export const UMAMI = {
  /** El «Website ID» de Umami. No es secreto: sale en el código de cada página. Vacío = sin estadísticas. */
  id: '1f2f08b3-8a70-4b6c-bb99-ada282c328cd',
  script: 'https://cloud.umami.is/script.js',
  /** Solo cuenta aquí: las vistas previas, la revisión de cada PR y los ordenadores del equipo no envían nada. */
  dominio: 'www.ideducando.es',
};

/**
 * Los contadores de lo que pasa en la web. Nunca llevan datos personales: solo el nombre del evento y, como
 * mucho, qué material es. Cada evento y cada dato cuentan para el límite del plan (100.000 al mes).
 */
export type Evento =
  | 'Mochila: añadir'
  | 'Mochila: correo enviado'
  | 'Mochila: descarga en pantalla'
  | 'Mochila: descarga desde el correo'
  | 'Boletín: alta confirmada'
  | 'Montaje: petición enviada';

declare global {
  interface Window {
    umami?: { track: (evento: string, datos?: Record<string, string>) => unknown };
  }
}

/** Suma uno al contador. Si Umami no carga (un bloqueador, sin red o «No rastrear»), la web sigue igual. */
export function contar(evento: Evento, datos?: { material: string }) {
  try {
    window.umami?.track(evento, datos);
  } catch {
    // Las estadísticas nunca deben romper la página.
  }
}
