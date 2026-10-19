// Categorías del catálogo de material gratuito.
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
} as const satisfies Record<string, Opcion>;

export type Seccion = keyof typeof SECCIONES;
export type Etapa = keyof typeof ETAPAS;
export type Necesidad = keyof typeof NECESIDADES;
export type Tipo = keyof typeof TIPOS;

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
