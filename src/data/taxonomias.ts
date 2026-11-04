// Categorías del catálogo de material gratuito y de la tienda.
// Si añades una opción aquí, añádela también en .pages.yml para que salga en el editor.

export type Color = 'azul' | 'verde' | 'coral' | 'morado' | 'amarillo' | 'naranja';

interface Opcion {
  nombre: string;
  descripcion: string;
  color: Color;
}

/** Para quién es el material: el aula o la oposición. */
export const SECCIONES = {
  aula: {
    nombre: 'Para el aula',
    descripcion: 'Fichas, plantillas y apoyos listos para imprimir y usar en clase.',
    color: 'verde',
  },
  oposiciones: {
    nombre: 'Para opositar',
    descripcion: 'Guías y listas de comprobación para preparar las oposiciones de Maestros.',
    color: 'morado',
  },
} as const satisfies Record<string, Opcion>;

/** Etapa educativa a la que va dirigido. */
export const ETAPAS = {
  infantil: {
    nombre: 'Infantil',
    descripcion: 'Segundo ciclo de Educación Infantil, de 3 a 6 años.',
    color: 'amarillo',
  },
  primaria: {
    nombre: 'Primaria',
    descripcion: 'Educación Primaria, de 6 a 12 años.',
    color: 'azul',
  },
} as const satisfies Record<string, Opcion>;

/**
 * Necesidades del alumnado. Los nombres siguen la Ley Orgánica de Educación (LOE),
 * artículos 71 y 73, con la redacción de la LOMLOE (Ley Orgánica 3/2020).
 */
export const NECESIDADES = {
  'toda-la-clase': {
    nombre: 'Toda la clase (DUA)',
    descripcion:
      'Pensado con el Diseño Universal para el Aprendizaje (DUA): sirve a todo el grupo sin dejar a nadie fuera.',
    color: 'verde',
  },
  tea: {
    nombre: 'TEA',
    descripcion: 'Trastorno del espectro del autismo.',
    color: 'azul',
  },
  tdah: {
    nombre: 'TDAH',
    descripcion: 'Trastorno por déficit de atención e hiperactividad.',
    color: 'naranja',
  },
  tdl: {
    nombre: 'TDL',
    descripcion: 'Trastorno del desarrollo del lenguaje, antes llamado TEL.',
    color: 'coral',
  },
  'dificultades-aprendizaje': {
    nombre: 'Dificultades de aprendizaje',
    descripcion: 'Dislexia, discalculia y otras dificultades específicas de aprendizaje.',
    color: 'morado',
  },
  'discapacidad-intelectual': {
    nombre: 'Discapacidad intelectual',
    descripcion: 'Apoyos para el acceso al currículo y la autonomía personal.',
    color: 'amarillo',
  },
  'discapacidad-motora': {
    nombre: 'Discapacidad motora',
    descripcion: 'Materiales que se pueden manipular, señalar o usar con apoyos.',
    color: 'azul',
  },
  'discapacidad-auditiva': {
    nombre: 'Discapacidad auditiva',
    descripcion: 'Información visual que no depende del oído.',
    color: 'verde',
  },
  'discapacidad-visual': {
    nombre: 'Discapacidad visual',
    descripcion: 'Alto contraste, letra grande y apoyos táctiles.',
    color: 'naranja',
  },
  conducta: {
    nombre: 'Regulación y conducta',
    descripcion: 'Rutinas, anticipación y apoyo conductual positivo.',
    color: 'coral',
  },
  'altas-capacidades': {
    nombre: 'Altas capacidades',
    descripcion: 'Retos de ampliación y enriquecimiento.',
    color: 'morado',
  },
  'incorporacion-tardia': {
    nombre: 'Incorporación tardía',
    descripcion: 'Alumnado que llega al sistema educativo español con el curso empezado, a menudo desde otro país y con otra lengua.',
    color: 'amarillo',
  },
} as const satisfies Record<string, Opcion>;

/** Qué tipo de material es. */
export const TIPOS = {
  plantilla: {
    nombre: 'Plantilla',
    descripcion: 'Documentos para rellenar, recortar o adaptar a cada alumno o alumna.',
    color: 'azul',
  },
  'apoyo-visual': {
    nombre: 'Apoyo visual',
    descripcion: 'Agendas, tableros y secuencias con imágenes.',
    color: 'verde',
  },
  fichas: {
    nombre: 'Fichas de trabajo',
    descripcion: 'Actividades imprimibles con distintos niveles.',
    color: 'naranja',
  },
  juego: {
    nombre: 'Juego',
    descripcion: 'Juegos de mesa y dinámicas para aprender jugando.',
    color: 'coral',
  },
  cuento: {
    nombre: 'Cuento adaptado',
    descripcion: 'Lecturas en lectura fácil y con apoyos visuales.',
    color: 'amarillo',
  },
  guia: {
    nombre: 'Guía',
    descripcion: 'Documentos largos para entender un tema de principio a fin.',
    color: 'morado',
  },
  lista: {
    nombre: 'Lista de comprobación',
    descripcion: 'Listas para repasar punto por punto que no falta nada.',
    color: 'verde',
  },
  programacion: {
    nombre: 'Programación',
    descripcion: 'Programaciones didácticas y programas de intervención de ejemplo.',
    color: 'azul',
  },
  situacion: {
    nombre: 'Situación de aprendizaje',
    descripcion: 'Un reto con producto final, sesión a sesión, con el DUA y actividades en varios niveles.',
    color: 'coral',
  },
} as const satisfies Record<string, Opcion>;

// ---------------------------------------------------------------------------
// Tienda (src/content/tienda): lo que es o será de pago. Hoy no se vende nada: cada producto
// enseña una muestra bloqueada y un botón para escribirnos. Nada de la tienda lleva pictogramas
// de ARASAAC: su licencia no admite el uso comercial (José, 28/10/2026).
// ---------------------------------------------------------------------------

/** Qué tipo de producto es. */
export const TIPOS_TIENDA = {
  libro: {
    nombre: 'Libro ilustrado',
    descripcion: 'Cuentos con texto e ilustraciones propias. La versión con pictogramas será gratis siempre.',
    color: 'coral',
  },
  historias: {
    nombre: 'Historias sociales',
    descripcion: 'Packs de historias para anticipar situaciones del día a día, con dibujos propios.',
    color: 'azul',
  },
  cuaderno: {
    nombre: 'Cuaderno y planificador',
    descripcion: 'Para organizar el curso, las sesiones de apoyo o el estudio de la oposición.',
    color: 'morado',
  },
  manipulativo: {
    nombre: 'Material manipulativo',
    descripcion: 'Páginas para tocar, encajar y repetir, plastificadas y con velcro.',
    color: 'verde',
  },
  montaje: {
    nombre: 'Kits y montaje',
    descripcion: 'El material impreso con lo necesario para montarlo, o ya montado y enviado desde Cartagena.',
    color: 'amarillo',
  },
  asesoria: {
    nombre: 'Asesoría',
    descripcion: 'Una videollamada con el equipo docente para un caso concreto.',
    color: 'naranja',
  },
} as const satisfies Record<string, Opcion>;

/** Para quién es cada producto de la tienda. */
export const PUBLICOS = {
  docentes: {
    nombre: 'Docentes',
    descripcion: 'Maestras y maestros de Infantil, Primaria, PT y AL.',
    color: 'verde',
  },
  familias: {
    nombre: 'Familias',
    descripcion: 'Madres, padres y quien acompaña a un peque en casa.',
    color: 'coral',
  },
  opositoras: {
    nombre: 'Opositoras',
    descripcion: 'Quien prepara la oposición de Maestros en la Región de Murcia.',
    color: 'morado',
  },
} as const satisfies Record<string, Opcion>;

/** En qué punto está cada producto. Se dice tal cual: nada de urgencias falsas. */
export const ESTADOS_TIENDA = {
  aprobado: {
    nombre: 'Aprobado',
    descripcion: 'Está terminado y el equipo docente le ha dado el visto bueno. Falta preparar la venta.',
    color: 'verde',
  },
  'en-revision': {
    nombre: 'Hecho, en revisión',
    descripcion: 'Está terminado y lo revisa el equipo docente antes de ponerlo a la venta.',
    color: 'verde',
  },
  'en-preparacion': {
    nombre: 'En preparación',
    descripcion: 'Ya hay una muestra y estamos haciendo el resto.',
    color: 'amarillo',
  },
  'en-estudio': {
    nombre: 'En estudio',
    descripcion: 'Estamos calculando costes, proveedores y lo que pide la ley antes de ofrecerlo.',
    color: 'azul',
  },
} as const satisfies Record<string, Opcion>;

export type Seccion = keyof typeof SECCIONES;
export type Etapa = keyof typeof ETAPAS;
export type Necesidad = keyof typeof NECESIDADES;
export type Tipo = keyof typeof TIPOS;
export type TipoTienda = keyof typeof TIPOS_TIENDA;
export type Publico = keyof typeof PUBLICOS;
export type EstadoTienda = keyof typeof ESTADOS_TIENDA;

/** Las dimensiones que tienen página propia en el catálogo. */
export const DIMENSIONES = {
  etapa: { nombre: 'Etapa', plural: 'Etapas', opciones: ETAPAS },
  necesidad: { nombre: 'Necesidad', plural: 'Necesidades', opciones: NECESIDADES },
  tipo: { nombre: 'Tipo de material', plural: 'Tipos de material', opciones: TIPOS },
} as const;

export type Dimension = keyof typeof DIMENSIONES;

export function claves<T extends Record<string, unknown>>(objeto: T) {
  return Object.keys(objeto) as [keyof T & string, ...(keyof T & string)[]];
}
