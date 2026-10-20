# Web de IdEducando

*Aprendizaje inclusivo y creativo.*

Material gratuito de Pedagogía Terapéutica (PT) e Infantil para docentes de toda España, y guías para opositar a Maestros en la Región de Murcia. Todo a 0 €, sin registro y sin seguimiento.

- **Dirección:** [www.ideducando.es](https://www.ideducando.es/). Quien entra por ideducando.es o por ideducando.netlify.app llega ahí solo.
- **Estado:** borrador. Los textos marcados con `[BORRADOR]` son de prueba y los tiene que revisar el equipo.
- **Instrucciones del proyecto:** [CLAUDE.md](CLAUDE.md).

---

## Lo que tiene que hacer José una sola vez

### 1. Crear el proyecto en Netlify (hecho el 15/10/2026; sirve si hubiera que repetirlo)

Netlify es el alojamiento: el sitio donde vive la web para que cualquiera la vea. IdEducando va en el mismo equipo de Netlify que Viable («IA Control»), para tenerlo todo en un solo sitio.

1. Entra en [app.netlify.com](https://app.netlify.com) con tu cuenta de siempre y comprueba que arriba a la izquierda pone el equipo **IA Control**.
2. Pulsa **Add new project** > **Import an existing project** > **GitHub**.
3. Si te pide permiso, autoriza a Netlify. En la lista de repositorios busca **ideducando/web**.
4. Si no aparece, pulsa **Configure the Netlify app on GitHub**, elige la organización **ideducando**, marca **Only select repositories**, elige **web** y guarda. Vuelve a Netlify y ya saldrá.
5. Elige **ideducando/web**. En el nombre del proyecto escribe `ideducando`, para que la dirección sea ideducando.netlify.app. La rama es **main**. El resto de ajustes los lee solo del archivo `netlify.toml` del repositorio.
6. Pulsa el botón final (**Deploy ideducando** o **Publish**, según la versión). Si Netlify avisa de que el proyecto es privado, sigue su aviso para hacerlo público.

En un par de minutos la web estará en [ideducando.netlify.app](https://ideducando.netlify.app/). Si hubiera que repetirlo, después hay que volver a conectar el dominio, como se explica en «El dominio ideducando.es».

Cada publicación en `main` gasta 15 de los créditos mensuales del plan de Netlify, los mismos que usa Viable. Las vistas previas de los PR no gastan.

### 2. Revisar y aceptar un PR

Un PR (*pull request*, «solicitud de cambios») es como una orden de trabajo en planta: alguien propone un cambio, otra persona lo revisa y, si está bien, lo firma. Hasta que no se firma, no se ejecuta.

1. Entra en la pestaña **Pull requests** del repositorio y abre el PR.
2. Lee el resumen del principio. Si quieres ver el código, está en la pestaña **Files changed**.
3. Abajo verás las comprobaciones. **Comprobar la web** en verde significa que la web se construye bien, no tiene enlaces rotos, pasa la revisión de accesibilidad y nada se sale de la pantalla en el móvil, ni en Chrome ni en Safari. La de Netlify (**Deploy Preview**) trae un enlace a una copia de prueba de la web con el cambio: ábrela en el móvil antes de aceptar.
4. Pulsa **Merge pull request** y después **Confirm merge**.

A los dos o tres minutos el cambio estará publicado. Lo puedes seguir en Netlify, en el proyecto **ideducando** > **Deploys**.

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
| `.github/workflows/` | El robot que revisa cada PR |
| `.pages.yml` | La configuración del editor visual |

---

## Cómo funciona por dentro

- **Astro** es el programa que construye la web. Funciona como una línea de envasado: le entran los textos y las plantillas, y sale la web terminada en páginas HTML listas para servir. Por eso la web es rápida y no necesita servidor ni base de datos.
- **Netlify** construye la web y la publica cada vez que se hace merge en `main`. Con cada PR prepara además una vista previa, una copia de prueba con el cambio. Su configuración está en `netlify.toml`.
- **GitHub Actions** son los robots de GitHub. Con cada PR, uno construye la web y la revisa: enlaces, accesibilidad y que nada se salga de la pantalla.
- **Pagefind** es el buscador. Crea un índice al construir la web y la búsqueda ocurre en el navegador de quien busca: no se envía nada a ningún servidor.
- **Las letras** (Outfit, Young Serif y Atkinson Hyperlegible) se sirven desde la propia web. Así no se manda la dirección IP de nadie a Google. En 2022, un tribunal alemán condenó a una web a indemnizar a un visitante por cargar las letras desde Google (LG München I, sentencia de 20/01/2022, 3 O 17493/20).

### Para quien programe

Hace falta Node.js 22.12 o más reciente.

```bash
npm install          # instala las dependencias
npm run dev          # web de prueba en http://localhost:4321/ que se recarga sola
npm run build        # construye la web en dist/ y su índice de búsqueda
```

PDF, portadas y revisión de accesibilidad (ver [herramientas/LEEME.md](herramientas/LEEME.md)):

```bash
cd herramientas
npm install
npm run pdf          # genera los PDF de public/descargas y las portadas
npm run comprobar    # enlaces rotos y accesibilidad WCAG 2.2 AA (necesita npm run build antes)
```

### El dominio ideducando.es

Conectado el 15/10/2026. La dirección principal es **www.ideducando.es**. Netlify lleva ahí a quien entra por ideducando.es, y una regla de `netlify.toml` hace lo mismo con ideducando.netlify.app. El certificado de HTTPS (el candado del navegador) lo crea y lo renueva Netlify, gratis, con Let's Encrypt.

En DonDominio, en la zona DNS de ideducando.es, la web usa solo dos registros:

| Registro | Tipo | Apunta a |
|---|---|---|
| ideducando.es | ANAME | apex-loadbalancer.netlify.com |
| www.ideducando.es | CNAME | ideducando.netlify.app |

Los registros MX, SPF y DKIM son del correo de Zoho y no se tocan. La dirección de cada página la da Netlify al construir la web; los PDF la llevan escrita, así que si algún día cambia hay que volver a generarlos.

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
| DNS | Sistema de nombres de dominio: la guía que traduce ideducando.es a la dirección del servidor donde está la web |
| HTTPS | Conexión cifrada entre el navegador y la web: el candado de la barra de direcciones |
