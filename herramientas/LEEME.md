# Herramientas

Programas de apoyo que **no se publican** en la web. Sirven para generar los PDF del material gratuito y para revisar la web antes de publicarla.

## Instalar (una vez)

```bash
cd herramientas
npm install
npx playwright install chromium webkit   # los navegadores que imprimen los PDF y revisan la web
```

También hace falta Python 3 con `pypdf` (`pip install pypdf`) para completar los metadatos de los PDF, y Poppler (`pdftoppm`) para las miniaturas. Si faltan, los PDF se generan igual y el programa avisa.

## Generar los PDF y las portadas

```bash
npm run pdf                          # todos
npm run pdf -- agenda-visual-semanal # solo uno
```

- Cada documento es un HTML de la carpeta `pdf/` con los estilos comunes de `pdf/comun.css`.
- Los pictogramas de ARASAAC que usan los materiales están en `pdf/pictogramas/`, con su licencia y cómo añadir más en el `LEEME.md` de esa carpeta. Algunos materiales generan sus casillas a partir de una lista de palabras escrita al final del HTML: para cambiar una palabra, se cambia en esa lista.
- Si un documento empieza con portada, su HTML lleva la regla `@page :first` con margen cero. Sin ella, Chromium descoloca la portada cuando lleva imágenes.
- La lista de comprobación de la programación se construye a partir de `src/data/programacion.json`, el mismo archivo que usa la versión interactiva de la web.
- Los PDF salen en `public/descargas/`, etiquetados para lectores de pantalla, con título, idioma, autoría y marcadores. Chromium junta dos palabras en el marcador cuando un título salta de línea; `metadatos.py` devuelve ese espacio con el texto de los títulos del HTML, sin tocar las páginas.
- Las portadas (1200 × 900) salen en `public/portadas/`. Si una ficha no tiene PDF todavía, su portada lleva el aviso «Próximamente».

## Las fotos de la galería

Cada ficha tiene una galería, como las fotos de un producto en cualquier tienda: la portada y algunas páginas de dentro, que se pasan con las flechas, con las miniaturas o con el dedo.

```bash
npm run vistas                          # todo el material gratuito
npm run vistas -- agenda-visual-semanal # solo uno
```

- Lee cada PDF de `public/descargas/` y guarda en `public/vistas/<id>/` la página 1 y las siguientes, hasta 5, sin la hoja «Cómo montarlo». Si la ficha tiene el campo `vistas`, saca esas páginas.
- Apunta en `src/data/vistas.json` cuántas páginas tiene cada PDF y el título de cada página, que la ficha usa en el texto alternativo.
- `npm run pdf` lo ejecuta solo al terminar, con los PDF que acaba de hacer. Ejecútalo a mano si cambias el campo `vistas` de una ficha.

### La tienda

La tienda enseña lo que será de pago. Sus fuentes no están en este repositorio, que es público: están en la carpeta privada del material de pago. Para rehacer sus fotos:

```bash
FUENTES_PAGO=/ruta/a/material-de-pago npm run vistas -- tienda
FUENTES_PAGO=/ruta/a/material-de-pago npm run vistas -- tienda/me-llamo-error   # solo uno
```

- Cada producto dice en su ficha (`src/content/tienda/`) qué archivo usar (`fuente`) y qué páginas enseñar (`muestra`).
- Las páginas nítidas salen a 840 px por el lado largo: se ven bien en pantalla y no sirven para imprimir.
- Las bloqueadas se reducen a 110 px, se difuminan y se vuelven a agrandar. Así el archivo publicado no guarda nada legible, aunque alguien lo descargue. Nunca se difumina solo con CSS.
- Los productos sin páginas (kits, asesorías) usan una ilustración propia en SVG, en `public/tienda/<id>/portada.svg`.
- Nada de la tienda lleva pictogramas de ARASAAC.

## Revisar la web

Primero hay que construirla desde la raíz del proyecto con `npm run build`. Después:

```bash
npm run comprobar
```

Revisa que no haya enlaces internos rotos ni palabras pegadas a un enlace o a una negrita, y pasa axe-core (una herramienta de revisión automática de accesibilidad) por todas las páginas, en móvil y en escritorio, con las pautas WCAG 2.2 de nivel A y AA. También comprueba que nada se salga de la pantalla: imitando un iPhone a 390 px, en un móvil pequeño de 320 px y con WebKit, el motor de Safari. Lo mismo se ejecuta solo en cada PR.

Si en tu equipo no está instalado WebKit, esa pasada se omite con un aviso; en GitHub Actions siempre se hace.

La revisión automática no lo detecta todo: hay que probar también con teclado y con un lector de pantalla.
