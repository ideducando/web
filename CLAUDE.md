# IdEducando · instrucciones del proyecto

## Qué es
IdEducando es una web de material educativo de Pedagogía Terapéutica (PT) e Infantil para docentes y familias de toda España. Hoy el material es gratis y se publica en la web. Más adelante será lo que se venda: en descarga a precio bajo (después, con suscripción), con lo necesario para montarlo en casa (velcro, fundas, anillas, plastificadora) o ya montado y enviado desde Cartagena. A largo plazo, una tienda física en Cartagena. Lo decidió José el 20/10/2026. No habrá clases de oposición: el equipo docente no las dará (27/10/2026); quizá, más adelante, consejos y seguimiento a quien lo pida por los canales oficiales.
Públicos: docentes que buscan material para el aula; familias que trabajan en casa con sus hijos, sobre todo si tienen alguna necesidad específica de apoyo; y opositoras, con material gratuito para la oposición de maestros de la Región de Murcia (convocatoria prevista en 2028).
Nombre: siempre "IdEducando", con la I y la E en mayúscula. Junta "idea" y "educando".
Subtítulo: Aprendizaje inclusivo y creativo. Lema: «Cada peque, una idea» (José, 26/10/2026; src/data/sitio.json). El anterior, «Donde cada forma de aprender se celebra», ya no se usa.

## Marca
Colores: azul #2F6FD6, verde #1FA67A, coral #E8553E, morado #8C4FB8, amarillo #F6C12E, naranja #F5961F, marino #1E2B55 para el texto y crema #FFF6E6 para los fondos.
Letras (Google Fonts): Outfit para el nombre y los títulos, Young Serif para el lema y Atkinson Hyperlegible para los textos.
Logo: marca/simbolo.svg (una bombilla con un niño dentro) y los PNG de la carpeta marca/. No se redibujan; si hace falta otro tamaño, se genera una copia (ver marca/LEEME.md).

## Cómo es la web
- Estática, rápida y ligera, publicada con Netlify desde la rama main (decisión de José, 15/10/2026: todo en el mismo equipo de Netlify que Viable).
- Pensada primero para el móvil.
- Accesible: contraste AA, textos claros, todo usable con teclado e imágenes con texto alternativo.
- Sin cookies de seguimiento ni analítica de terceros.
- En castellano de España.

## Estado (octubre de 2026)
- Prioridad: la web y el material gratuito.
- Durante el próximo año se prepara la web para vender. Nada con pictogramas de ARASAAC se vende: su licencia (CC BY-NC-SA) no admite el uso comercial y ARASAAC confirmó por teléfono el 22/10/2026 que no da permiso para venderlo. Lo que se venda irá con pictogramas e ilustraciones propios.
- Libros: la versión con pictogramas es siempre gratis y el libro con texto e ilustraciones, de pago (José, 27/10/2026). Cuando RORESMO, los pictogramas propios, tenga su catálogo, la versión gratuita se podrá descargar con ARASAAC o con RORESMO, a elegir.
- Desde el 26/10/2026 la web y los PDF no llevan avisos de borrador ni noindex (José). La revisión del equipo sigue en la tabla «Revisión de materiales» de Notion y cada cambio entra en un PR. El campo borrador de las fichas existe, pero va desmarcado.
- Titular de la web: José, como responsable de la parte digital (26/10/2026). Su nombre, NIF y domicilio salen en el aviso legal desde las variables de Netlify TITULAR_NOMBRE, TITULAR_NIF y TITULAR_DOMICILIO (src/components/Titular.astro); nunca se escriben en el repositorio.
- Mi mochila: correo obligatorio para recibir el material y boletín solo con su casilla aparte, sin marcar (José, 26/10/2026). Sigue en modo demostración hasta conectar la herramienta de correo.
- En la web no salen nombres ni fotos del equipo hasta que cada persona lo autorice.

## Técnica
- Astro genera la web estática. Se publica en la raíz de www.ideducando.es, la dirección principal desde el 15/10/2026 (ideducando.es e ideducando.netlify.app llevan ahí); astro.config.mjs toma la dirección de las variables de Netlify y, fuera de Netlify, usa www.ideducando.es.
- Contenidos en Markdown: src/content/materiales, src/content/consejos y src/content/paginas. Datos en src/data (calendario, ajustes, lista de la programación). El esquema está en src/content.config.ts y las categorías en src/data/taxonomias.ts, que deben coincidir con .pages.yml.
- Editor visual: Pages CMS (.pages.yml). Buscador: Pagefind, se genera con npm run build.
- Enlaces internos con ruta() de src/lib/rutas.ts. En Markdown se escriben desde la raíz (/oposiciones/).
- Letras con Fontsource, servidas desde la propia web: nada de Google Fonts ni de otros servidores externos.
- Contraste: enlaces en #2B6CD5 (4,65:1 sobre crema); el verde y el coral no se usan para texto.
- PDF y portadas: herramientas/generar.mjs. Revisión de enlaces y accesibilidad (axe-core, WCAG 2.2 AA): herramientas/comprobar.mjs, que también se ejecuta en cada PR.
- Montaje: si un material hay que montarlo (recortar, plastificar, velcro, anillas…), su ficha lleva necesitas con cantidad y medida exactas, imprimir, pasos, resultado y cuidados. Salen en la web («Cómo montarlo») y en la página 2 del PDF (src/lib/montaje.mjs). Velcro: rugoso en la base y suave en las tarjetas.
- Maquetación: las columnas de las rejillas van con minmax(0, 1fr) para que nada ensanche la página en el móvil, y html y body recortan en horizontal (overflow-x: clip). Si un enlace o una negrita empiezan en otra línea, se pone {' '} al final de la anterior: Astro quita ese espacio. La revisión lo comprueba todo, también con WebKit (Safari).
- Publicación: Netlify, en cada merge a main, con vista previa de cada PR (netlify.toml). Cada publicación en main gasta 15 créditos del plan de José, compartidos con sus otros proyectos; las vistas previas no gastan. GitHub Actions solo revisa cada PR (comprobar.yml); ya no publica.

## Reglas
- El repositorio es público: nunca contraseñas, claves, datos personales ni fotos de alumnos.
- Coste cero: ningún servicio de pago.
- Cada cambio va en una rama con su PR. José revisa y hace el merge.
- José está aprendiendo: explica cada cambio en dos o tres frases sencillas y define cada sigla la primera vez que salga.
