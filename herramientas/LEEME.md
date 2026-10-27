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
- Los PDF salen en `public/descargas/`, etiquetados para lectores de pantalla, con título, idioma, autoría y marcadores.
- Las portadas (1200 × 900) salen en `public/portadas/`. Si una ficha no tiene PDF todavía, su portada lleva el aviso «Próximamente».

## Revisar la web

Primero hay que construirla desde la raíz del proyecto con `npm run build`. Después:

```bash
npm run comprobar
```

Revisa que no haya enlaces internos rotos ni palabras pegadas a un enlace o a una negrita, y pasa axe-core (una herramienta de revisión automática de accesibilidad) por todas las páginas, en móvil y en escritorio, con las pautas WCAG 2.2 de nivel A y AA. También comprueba que nada se salga de la pantalla: imitando un iPhone a 390 px, en un móvil pequeño de 320 px y con WebKit, el motor de Safari. Lo mismo se ejecuta solo en cada PR.

Si en tu equipo no está instalado WebKit, esa pasada se omite con un aviso; en GitHub Actions siempre se hace.

La revisión automática no lo detecta todo: hay que probar también con teclado y con un lector de pantalla.
