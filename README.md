# Web de IdEducando

*Aprendizaje inclusivo y creativo. Donde cada forma de aprender se celebra.*

Material gratuito de Pedagogía Terapéutica (PT) e Infantil para docentes de toda España, y guías para opositar a Maestros en la Región de Murcia. Todo a 0 €, sin registro y sin seguimiento.

- **Dirección:** [ideducando.github.io/web](https://ideducando.github.io/web/) (cuando se publique por primera vez).
- **Estado:** borrador. Los textos marcados con `[BORRADOR]` son de prueba y los tiene que revisar el equipo.
- **Instrucciones del proyecto:** [CLAUDE.md](CLAUDE.md).

---

## Lo que tiene que hacer José una sola vez

### 1. Activar GitHub Pages (1 minuto)

GitHub Pages es el «alojamiento» gratuito de GitHub: el sitio donde vive la web para que cualquiera la vea.

1. Entra en [github.com/ideducando/web](https://github.com/ideducando/web).
2. Pulsa la pestaña **Settings** (la última de la barra del repositorio).
3. En el menú de la izquierda, pulsa **Pages**.
4. En **Build and deployment**, abre el desplegable **Source** y elige **GitHub Actions**.

No hay que guardar nada más: el cambio se aplica solo.

### 2. Revisar y aceptar el primer PR

Un PR (*pull request*, «solicitud de cambios») es como una orden de trabajo en planta: alguien propone un cambio, otra persona lo revisa y, si está bien, lo firma. Hasta que no se firma, no se ejecuta.

1. Entra en la pestaña **Pull requests** del repositorio y abre el PR de la web.
2. Mira la pestaña **Files changed** si quieres ver los cambios, o el resumen del principio.
3. Abajo verás la comprobación automática **Comprobar la web**. Si sale en verde, la web se construye bien, no tiene enlaces rotos y pasa la revisión de accesibilidad.
4. Pulsa **Merge pull request** y después **Confirm merge**.

A los dos o tres minutos la web estará publicada. Lo puedes seguir en la pestaña **Actions**.

---

## Cómo cambiar la web sin tocar código

Usamos **Pages CMS**, un editor visual gratuito. CMS significa *content management system* (sistema de gestión de contenidos): es el cuadro de mando de la web. Cambias textos y archivos con botones y formularios, igual que en la sala de control se maneja la planta sin tocar el cableado.

### Entrar por primera vez

1. Ve a [app.pagescms.org](https://app.pagescms.org).
2. Pulsa **Sign in with GitHub** y entra con tu cuenta de GitHub.
3. Si te lo pide, autoriza a Pages CMS a ver el repositorio **ideducando/web**.
4. Elige el repositorio **ideducando/web**.

En el menú de la izquierda verás:

| Apartado | Qué cambias ahí |
|---|---|
| Material gratuito | Las fichas del catálogo: textos, categorías, PDF y portada |
| Consejos | Los artículos de la sección Consejos |
| Páginas de texto | Quiénes somos, aviso legal, privacidad, accesibilidad, licencias |
| Calendario de oposiciones | Las fechas de la página Calendario |
| Ajustes de la web | Correo, lema, enlaces a redes y el aviso de borrador |

### Respetar la regla de la rama

El proyecto tiene una regla: **cada cambio va en una rama con su PR**. Una rama es una copia de trabajo, como un circuito de pruebas en paralelo al principal: puedes tocar todo lo que quieras sin que afecte a la web publicada.

1. Arriba a la izquierda de Pages CMS está el selector de rama (pone **main**).
2. Ábrelo y crea una rama nueva con un nombre que diga qué cambias, por ejemplo `textos-quienes-somos`.
3. Haz tus cambios y pulsa **Save** en cada uno.
4. En GitHub aparecerá un aviso amarillo: **Compare & pull request**. Púlsalo, escribe en dos líneas qué has cambiado y pulsa **Create pull request**.
5. Cuando la comprobación salga en verde, haz el merge como en el paso 2 de arriba.

### Añadir un material nuevo

1. Prepara el PDF y una imagen de portada de 1200 × 900 píxeles.
2. En Pages CMS, entra en **Material gratuito** y pulsa **Add an entry**.
3. Rellena los campos. Los obligatorios son título, resumen, «Para», tipo y fecha.
4. En **Archivo para descargar**, sube el PDF. Si lo dejas vacío, la ficha sale como «Próximamente».
5. En **Portada**, sube la imagen y escribe debajo una descripción para quien no la ve.
6. Deja marcado **Borrador** hasta que el equipo lo revise.
7. Guarda y abre el PR como se explica arriba.

Antes de publicar un material, repasa el [manual de estilo de materiales](docs/manual-de-estilo-materiales.md).

---

## Dónde está cada cosa

| Carpeta o archivo | Qué hay dentro |
|---|---|
| `marca/` | Los logos originales. No se redibujan. |
| `src/content/materiales/` | Una ficha por material, en texto con formato (Markdown) |
| `src/content/consejos/` | Los artículos de Consejos |
| `src/content/paginas/` | Las páginas de texto: quiénes somos y legales |
| `src/data/` | El calendario, los ajustes de la web, las categorías del catálogo y la lista de la programación |
| `src/pages/` | El diseño de cada página |
| `public/descargas/` | Los PDF que se descargan |
| `public/portadas/` | Las portadas del catálogo |
| `herramientas/` | Programas para generar los PDF y revisar la accesibilidad. No se publican |
| `docs/` | Documentación del equipo, como el manual de estilo |
| `.github/workflows/` | Los robots que publican y comprueban la web |
| `.pages.yml` | La configuración del editor visual |

---

## Cómo funciona por dentro

- **Astro** es el programa que construye la web. Funciona como una línea de envasado: le entran los textos y las plantillas, y sale la web terminada en páginas HTML listas para servir. Por eso la web es rápida y no necesita servidor ni base de datos.
- **GitHub Actions** son los robots de GitHub. Cada vez que se hace merge en `main`, uno construye la web y la publica en GitHub Pages. Con cada PR, otro la construye y la revisa.
- **Pagefind** es el buscador. Crea un índice al construir la web y la búsqueda ocurre en el navegador de quien busca: no se envía nada a ningún servidor.
- **Las letras** (Outfit, Young Serif y Atkinson Hyperlegible) se sirven desde la propia web. Así no se manda la dirección IP de nadie a Google. En 2022, un tribunal alemán condenó a una web a indemnizar a un visitante por cargar las letras desde Google (LG München I, sentencia de 20/01/2022, 3 O 17493/20).

### Para quien programe

Hace falta Node.js 22.12 o más reciente.

```bash
npm install          # instala las dependencias
npm run dev          # web de prueba en http://localhost:4321/web/ que se recarga sola
npm run build        # construye la web en dist/ y su índice de búsqueda
```

PDF, portadas y revisión de accesibilidad (ver [herramientas/LEEME.md](herramientas/LEEME.md)):

```bash
cd herramientas
npm install
npm run pdf          # genera los PDF de public/descargas y las portadas
npm run comprobar    # enlaces rotos y accesibilidad WCAG 2.2 AA (necesita npm run build antes)
```

### Cambiar a ideducando.es

Cuando el dominio apunte a GitHub Pages, hay que cambiar dos líneas de `astro.config.mjs`: `SITE = 'https://ideducando.es'` y `BASE = '/'`. El resto de enlaces se ajusta solo.

---

## Siglas que salen en este proyecto

| Sigla | Qué significa |
|---|---|
| PT | Pedagogía Terapéutica, la especialidad de maestras y maestros que atienden al alumnado con necesidades educativas |
| NEE | Necesidades educativas especiales |
| NEAE | Necesidades específicas de apoyo educativo, que incluyen las NEE y otras |
| DUA | Diseño Universal para el Aprendizaje: diseñar pensando desde el principio en la diversidad |
| TEA | Trastorno del espectro del autismo |
| TDL | Trastorno del desarrollo del lenguaje |
| BORM | Boletín Oficial de la Región de Murcia |
| WCAG | Pautas de accesibilidad para el contenido web del W3C, el organismo que fija los estándares de la web |
| PDF | Formato de documento que se ve igual en cualquier aparato |
| PR | *Pull request*, solicitud de cambios |
| CMS | *Content management system*, editor de contenidos |
