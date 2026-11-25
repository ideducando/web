// Esquema de los contenidos editables.
// Si un archivo de materiales o consejos no cumple estas reglas, la web no se construye
// y el error dice qué campo falla. Así nunca se publica una ficha a medias.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ESTADOS_TIENDA, ETAPAS, NECESIDADES, PUBLICOS, SECCIONES, TIPOS, TIPOS_TIENDA, claves } from './data/taxonomias';

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
    // Páginas del PDF que salen en la galería de la ficha (herramientas/vistas.mjs). Vacío: la 1 y las
    // siguientes, hasta 5, sin la hoja «Cómo montarlo».
    vistas: opcional(z.array(z.number().int().positive()).default([])),
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
    // Lo que lleva pictogramas de ARASAAC, con su misma licencia; lo demás, con todos los derechos reservados (José, 28/10/2026).
    licencia: z.enum(['CC BY-NC-SA 4.0', 'Todos los derechos reservados']).default('CC BY-NC-SA 4.0'),
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

// Tienda: lo que es o será de pago. Hoy no se vende nada (José, 04/11/2026): cada ficha enseña la portada,
// alguna página de muestra y el resto bloqueado, y un botón para escribirnos. Nada lleva pictogramas de ARASAAC.
// Las imágenes de las muestras las hace herramientas/tienda.mjs desde la carpeta privada de las fuentes de pago.
const tienda = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tienda' }),
  schema: z.object({
    titulo: z.string().min(3).max(90),
    resumen: z.string().min(20).max(220),
    tipo: z.enum(claves(TIPOS_TIENDA)),
    para: z.array(z.enum(claves(PUBLICOS))).min(1),
    edades: opcional(z.string().optional()),
    // Cómo se podrá conseguir: descarga, kit para montar, ya montado, en papel…
    formatos: z.array(z.string()).min(1),
    estado: z.enum(claves(ESTADOS_TIENDA)),
    // Portada de 1200 × 900, nítida. Dentro de public/, por ejemplo /tienda/me-llamo-error/portada.webp.
    portada: z.string(),
    portada_alt: z.string().min(10),
    // Páginas de la muestra, en orden. Las bloqueadas se ven borrosas a propósito y no llevan alt:
    // las nombra su pie («Página 9 · Bloqueado»). Las nítidas necesitan su alt.
    orientacion: z.enum(['horizontal', 'vertical']).default('vertical'),
    muestra: opcional(
      z
        .array(
          z
            .object({
              pagina: z.number().int().positive(),
              bloqueada: z.boolean().default(true),
              alt: opcional(z.string().optional()),
            })
            .refine((m) => m.bloqueada || (m.alt && m.alt.length >= 10), {
              message: 'Cada página nítida de la muestra necesita su texto alternativo (alt).',
            }),
        )
        .default([]),
    ),
    // Archivo de pago dentro de la carpeta privada (FUENTES_PAGO). No se publica: solo lo lee herramientas/vistas.mjs.
    fuente: opcional(z.string().optional()),
    // Si la fuente es una muestra de pocas hojas y no el producto entero, la galería dice «Hoja 3 de la muestra»
    // y «paginas» son las previstas para el producto completo.
    solo_muestra: z.boolean().default(false),
    // Si el producto trae lo que hace falta para montarlo con cantidad y medida exactas (kits y suministros),
    // su tarjeta lleva el sello «Con medidas exactas para montarlo» (propuesta B-009, 24/11/2026).
    medidas_exactas: z.boolean().default(false),
    // Tabla fija de la ficha técnica (B-026, José, 24/11/2026): completa en lo que lleva piezas, corta en lo que
    // es de papel y ninguna en lo solo digital. La edad mínima, los avisos de seguridad y el fabricante dicen
    // «Por confirmar antes de vender» hasta hablarlo con Carlos: un kit puede contar como juguete
    // (Real Decreto 1205/2011). Lo que todavía no está decidido se escribe «Por confirmar».
    tabla: opcional(
      z
        .object({
          tipo: z.enum(['piezas', 'papel']),
          medidas: z.string().min(3),
          piezas: opcional(z.string().optional()),
          materiales: opcional(z.string().optional()),
          fabricante: opcional(z.string().optional()),
          montaje: opcional(z.string().optional()),
          // Id de un material gratuito con «Cómo montarlo» que sirve para este producto.
          montaje_material: opcional(z.string().optional()),
          formato: opcional(z.string().optional()),
          papel: opcional(z.string().optional()),
          encuadernacion: opcional(z.string().optional()),
        })
        .refine(
          (t) => (t.tipo === 'piezas' ? Boolean(t.piezas && t.materiales && t.montaje) : Boolean(t.formato && t.papel && t.encuadernacion)),
          { message: 'Con piezas: piezas, materiales y montaje. De papel: formato, papel y encuadernación.' },
        )
        .optional(),
    ),
    paginas: opcional(z.number().int().positive().optional()),
    incluye: z.array(z.string()).min(1),
    // Si hay o habrá una versión gratis (por ejemplo, la de pictogramas), se cuenta aquí.
    gratis: opcional(z.string().optional()),
    // Id de un material gratuito relacionado (src/content/materiales).
    relacionado: opcional(z.string().optional()),
    orden: z.number().int().default(100),
    fecha: z.coerce.date(),
    actualizado: opcional(z.coerce.date().optional()),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { materiales, consejos, paginas, tienda };
