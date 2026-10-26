// Esquema de los contenidos editables.
// Si un archivo de materiales o consejos no cumple estas reglas, la web no se construye
// y el error dice qué campo falla. Así nunca se publica una ficha a medias.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ETAPAS, NECESIDADES, SECCIONES, TIPOS, claves } from './data/taxonomias';

// El editor visual puede guardar un campo vacío como "" o null. Aquí cuenta como «sin rellenar».
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), esquema);

const materiales = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/materiales' }),
  schema: z.object({
    titulo: z.string().min(3).max(90),
    resumen: z.string().min(20).max(220),
    seccion: z.enum(claves(SECCIONES)),
    tipo: z.enum(claves(TIPOS)),
    etapas: opcional(z.array(z.enum(claves(ETAPAS))).default([])),
    necesidades: opcional(z.array(z.enum(claves(NECESIDADES))).default([])),
    edades: opcional(z.string().optional()),
    formato: z.string().default('PDF imprimible (A4)'),
    paginas: opcional(z.number().int().positive().optional()),
    // Ruta del archivo dentro de public/, por ejemplo /descargas/agenda-visual.pdf.
    // Si está vacía, la ficha sale como «Próximamente».
    archivo: opcional(z.string().optional()),
    portada: opcional(z.string().optional()),
    portada_alt: opcional(z.string().optional()),
    tiempo: opcional(z.string().optional()),
    necesitas: opcional(z.array(z.string()).default([])),
    // Instrucciones de montaje (src/lib/montaje.mjs). Si hay pasos, salen en la ficha
    // y en la página 2 del PDF.
    imprimir: opcional(z.array(z.string()).default([])),
    pasos: opcional(z.array(z.string()).default([])),
    resultado: opcional(z.string().optional()),
    cuidados: opcional(z.array(z.string()).default([])),
    // Normativa, estudios o materiales en los que se apoya la ficha.
    fuentes: opcional(z.array(z.string()).default([])),
    autoria: z.string().default('Equipo IdEducando'),
    licencia: z.string().default('CC BY-NC-SA 4.0'),
    fecha: z.coerce.date(),
    actualizado: opcional(z.coerce.date().optional()),
    destacado: z.boolean().default(false),
    borrador: z.boolean().default(false),
  }),
});

const consejos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/consejos' }),
  schema: z.object({
    titulo: z.string().min(3).max(110),
    resumen: z.string().min(20).max(240),
    seccion: z.enum(claves(SECCIONES)),
    fecha: z.coerce.date(),
    actualizado: opcional(z.coerce.date().optional()),
    autoria: z.string().default('Equipo IdEducando'),
    lectura: opcional(z.string().optional()),
    borrador: z.boolean().default(false),
  }),
});

// Páginas de texto: quiénes somos, legales, accesibilidad… Cada archivo es una página en la raíz.
const paginas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string().min(3).max(90),
    entradilla: opcional(z.string().max(260).optional()),
    descripcion: opcional(z.string().max(200).optional()),
    actualizado: z.coerce.date(),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { materiales, consejos, paginas };
