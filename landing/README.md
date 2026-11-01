# The Letter — V1

Evolución de la Beta aprobada, no una reconstrucción. Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, CSS Modules/variables, GSAP 3.15.0, @gsap/react 2.1.2, ScrollTrigger, Flip y Lenis únicamente en desktop.

## GitHub Pages

URL de este repositorio: **https://marieannegrace.github.io/boda/**.
Las cartas se publican en `https://marieannegrace.github.io/boda/{slug}/`.

La aplicación utiliza `output: "export"`, `trailingSlash: true` e imágenes preoptimizadas sin servicio Next Image. Las seis cartas y sus variantes de lectura se generan desde JSON durante el build. CSS, JavaScript, fuentes, imágenes, videos y QR respetan `NEXT_PUBLIC_BASE_PATH=/boda`.

El workflow [pages.yml](../.github/workflows/pages.yml) despliega cada push a `main`: configura Pages, instala el lockfile con Node 22, ejecuta lint/pruebas QR, genera y decodifica los QR, exporta y comprueba tipos, sube `landing/out` y publica. Obtiene URL y base path de `actions/configure-pages`, por lo que también admite un dominio personalizado configurado en Pages. El artifact `invitation-print-qr` contiene los archivos imprimibles.

`npm run build` genera los QR automáticamente mediante `prebuild` y exige una URL pública configurada cuyo subdirectorio coincida con `NEXT_PUBLIC_BASE_PATH`. Esto evita publicar un build con QR ausentes o enlaces que omitan `/boda`.

Pages no ejecuta Node/SSR ni endpoints dinámicos. Las rutas desconocidas devuelven un 404 con enlace a la invitación general, en lugar del antiguo fallback dinámico. Sin JavaScript, el formulario abre `/{slug}/lectura/#saludo` (o `/lectura/` para la invitación general); conserva el gesto explícito y no depende de query params ni servidor. Con JavaScript se mantiene la apertura física original, sin navegar.

El repositorio y Pages son públicos: HTML, datos visibles, medios y QR son accesibles públicamente. Un slug y la lógica de postboda siguen sin ser autenticación. No subir videos privados a esta modalidad.

## Ejecutar en Windows

Desde esta carpeta, con las dependencias ya instaladas. Copiar `.env.example` a `.env.local` para usar la misma URL/base path que Pages:

```powershell
npm.cmd run dev
```

Abrir `http://localhost:3000/boda/roberto/`. Si el puerto está ocupado: `npm.cmd run dev -- --port 3002`. No detener procesos ajenos.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run qr:generate
npm.cmd run build
npm.cmd start -- --port 3002
```

`start` sirve el export estático localmente, no ejecuta `next start`. Abrir `http://127.0.0.1:3002/boda/roberto/`. No ejecutar dev/start en el mismo puerto. `npm.cmd` evita el bloqueo de scripts de PowerShell sin modificar la política del sistema. No se reinstalaron Node, npm ni Git. Sin `.env.local`, definir ambas variables de entorno antes de generar/build/start; un build sin base path sirve en la raíz.

## Rutas y destinatarios reales

| Ruta | Nombre visible | Cupos |
| --- | --- | --- |
| `/roberto` | Roberto y familia | Pendiente de confirmar |
| `/mariayroberto` | María y Roberto | 2 |
| `/giovanna` | Giovanna y Noah | 2 |
| `/amparoyeduardo` | Amparo y Eduardo | 2 |
| `/mercedes` | Mercedes y familia | Pendiente de definir |
| `/florisyabsalon` | Floris, Absalon y Charlotte | 3 |

`/` usa `default`: sin video, cupos ni acceso asignados de otra familia. Slugs desconocidos y rutas anidadas no soportadas devuelven 404 con enlace general. No se crean otras familias. Todas las rutas de esta tabla llevan el prefijo `/boda` en Pages.

`src/data/guests.json` es la fuente: slug, name, displayName, greeting, seats, seatsPendingLabel, video, poster, captions, transcript, dimensiones y postWeddingAccess. Cupos pendientes son `null`, nunca cero ni una cifra supuesta. Agregar registros no requiere modificar componentes. La URL/QR se derivan del slug y de la configuración pública.

## Umbral de entrada

`InvitationGate.tsx` mantiene el contenido posterior con `hidden` e `inert` desde el HTML inicial, incluidos navegación y enlaces de salto. El scroll del documento está bloqueado por CSS y por estilos de body restaurables; no hay Lenis ni ScrollTriggers hasta abrir.

`LetterOpening.tsx` conserva la identidad de papel: respuesta de CTA (0,22 s), anticipación del soporte, liberación de sello de papel CSS, apertura de solapa con dos caras, extracción del interior, retirada del bolsillo, handoff de layout Flip, dos pliegues del papel y revelación del destinatario. Duración total aproximada: 3,6 s. El arte plano original no se corta ni se usa como capas falsas.

El único control inicial es **Abrir la carta**, con contraste de tinta, área táctil de 56 px y “para comenzar”. No hay loops, partículas, bounce ni glow. Durante la apertura, el mismo control permite **Continuar sin animación**; Escape completa la secuencia. El scroll se restaura únicamente tras completarla y el foco pasa al saludo personalizado.

Reduced motion: el gesto abre inmediatamente, sin pliegues/Flip. El cambio de preferencia en vivo completa una apertura en curso y elimina Lenis/revelaciones. Un viewport excepcionalmente bajo permite desplazar **solo la escena inicial** para alcanzar el control, nunca acceder al contenido bloqueado. En móvil, después de abrir, el scroll es nativo y no hay parallax.

Sin JavaScript, el mismo botón funciona como formulario GET explícito a `/{slug}/lectura/#saludo`: el HTML estático contiene la carta abierta. No existe un preloader que requiera JavaScript para revelar HTML. Esa variante es un fallback de lectura, no autenticación. Una visita normal/refresco a `/slug/` vuelve a la carta cerrada.

## The Love Issue — stories personalizadas

La escena `#video` ya no es un reproductor tradicional: `LoveIssue.tsx` presenta seis páginas 9:16 como una edición coleccionable. Conserva el identificador del capítulo y las otras catorce escenas para no romper enlaces existentes.

| Story | Función | Medio actual |
| --- | --- | --- |
| Portada | THE LOVE ISSUE → Special Wedding Edition → volumen/lugar/año | Tipografía y papel CSS |
| Historia | La memoria compartida con el destinatario | Frases animadas |
| Family Edition | Dedicar la edición y mostrar cupos | Datos del invitado actual |
| Una nueva página | Mostrar a Luis y Marie y preparar el encuentro | Fotografía pendiente, sin stock |
| Mensaje personal | Luis y Marie hablan directamente | Video pendiente; arquitectura personalizada/general |
| El encuentro | Fecha, lugar, hashtag, invitación y compartir | Portada final y acciones |

**Abrir mi edición** inicia la secuencia, nunca la carga de la landing. Cada página tipográfica tiene 5 s: 30 s nominales, sin bucle. El cierre queda disponible, sin navegar ni enviar mensajes automáticamente. Un video real usa su propia duración y avanza en `ended`, sin cortar la voz a los 5 s; si dura más, el recap también dura más.

Toques a izquierda/derecha, swipe horizontal y botones anterior/siguiente recorren las páginas. Mantener presionado pausa texto, progreso y video; soltar reanuda. El scroll vertical sigue siendo nativo en móvil. Flechas del teclado navegan, espacio pausa/continúa, los controles tienen foco visible y no hay trampa de Tab. Avance automático es opcional; se pausa fuera de pantalla, con pestaña oculta, al mantener presionado o cuando el teclado está dentro de los controles. Reduced motion desactiva autoplay/animación y deja navegación y video bajo gesto explícito. Sin JS se muestra una edición completa de lectura, no controles inertes.

Pantalla completa usa la API nativa, incluye controles y acciones finales y permite salir con Escape/el mismo botón. Si el navegador no la admite, informa y conserva la experiencia inline. **Ver la invitación** devuelve foco y scroll al facsímil/agenda. Compartir usa Web Share con la URL del invitado, no una ruta genérica; alternativas: WhatsApp, copiar enlace y campo seleccionable. Cancelar el menú no es un error; copiar/compartir fallidos muestran instrucciones, no una confirmación ficticia.

### Configurar contenido y medios

- `src/data/stories.json`: textos compartidos, orden, tiempos, edición, foto general y `generalVideo/generalPoster/generalCaptions/generalTranscript`. Están en `null` hasta recibir medios reales.
- `guests.json`: sigue siendo la única fuente de nombres, cupos y video personalizado. Usa sus campos `video`, `poster`, `captions`, `transcript`. No crear un segundo listado de familias.
- Cada registro admite opcionalmente `stories: { "edition": "FAMILY EDITION", "photo": null, "photoAlt": "Descripción de la foto", "message": null }`. `message` reemplaza el texto del espacio de video pendiente. Estos overrides no obligan a modificar componentes.
- Archivos locales: `/videos/nombre.mp4`, `/videos/nombre.vtt`, `/images/nombre.webp` (también PNG/JPG). Publicar MP4 vertical 9:16, comprimido, fast-start, poster y subtítulos/transcripción revisados.
- `stories.server.ts`/`story-media.mjs` comprueban en build: video del invitado → general → placeholder. No mezclan poster/captions/transcript de otra familia. Foto personalizada → configuración general; si el archivo no existe, queda el espacio editorial. Errores de configuración/IO distintos de archivo ausente interrumpen el build.
- El cliente recibe solo la edición actual. El video no se monta ni tiene `src` antes de la quinta página/inicio explícito; usa preload none, muted, playsInline, sonido y play/pausa discretos. Pausa/libera el recurso al salir y ofrece reintento/continuación ante fallos. Nunca solicita videos de otras familias.
- No se generan ilustraciones para fingir botánica disponible. Los marcos y ornamentación actuales son tipográficos/CSS; fotografía y voz auténticas siguen pendientes. La foto real recibe un tratamiento cálido leve y escala 1.03 → 1.00, sin parallax móvil.

```powershell
npm.cmd run test:stories
$env:BETA_URL = "http://127.0.0.1:3002/boda"
npm.cmd run test:browser -- stories.spec.ts stories-touch.spec.ts --workers=1
```

Las pruebas cubren los seis destinatarios, seis páginas, 30 s nominales, pausa/gestos/touch real por CDP, fullscreen, compartir/copia, no-JS y 320/360/390/430/768/1440 px. `stories-media.spec.ts` se ejecuta aparte con `STORIES_MEDIA_FIXTURE=1` y un build de fixture local: un MP4 sintético 9:16 de 7 s y poster (`tests/create-story-fixture.mjs`). Esa corrida verifica reproducción real del navegador, duración/ended, sonido, pausa, ausencia de controles grandes y fallos de video/foto. Nunca publicar ese build ni sus archivos: restaurar configuración, borrar ambos archivos de fixture y reconstruir antes del push. Los medios sintéticos no forman parte de la invitación entregada.

Validación de esta entrega: typecheck, lint y export estático aprobados; 13 smoke, 7 QR, 3 selección/configuración de stories y 47 escenarios de navegador (32 existentes + 15 nuevos) verificados. Los 4 escenarios adicionales de medios se ejecutaron con el MP4 sintético y se retiraron esos archivos del build final. Se corrigieron el swipe nativo dentro de la página con scroll, el foco al volver a la invitación, una carrera entre error de video y rechazo de autoplay, y un selector de prueba que confundía la dedicatoria del sobre con la de la portada. La evidencia no reemplaza QA en iOS/Android reales ni valida videos personales que aún no se han recibido.

## Recorrido y función narrativa

| Escena | Propósito / contenido | Acción y transición | Fallback |
| --- | --- | --- | --- |
| Carta cerrada | Identificar destinatario y cupos | Abrir, sin enlaces de bypass | Formulario nativo |
| Apertura | Umbral físico de objeto a lectura | Solapa → papel → pliegues → destinatario | Inmediata con reduced motion; control para omitir animación |
| Saludo | Dedicar la carta | Foco y lectura libre | Nombre y cupos en HTML |
| The Love Issue | Edición personal en seis stories | Recap opcional, gestos y regreso a invitación | Lectura estática y placeholders de medios |
| Historia | Pasar a memoria compartida | Pausa tipográfica y tinta | Contenido estático |
| 2008 | Comienzo real de la relación | Primera página de memoria | Capítulo tipográfico |
| 2022 | Boda civil | Relevo espacial | Capítulo tipográfico |
| 2026 | Boda religiosa | Culminación de memoria | Capítulo tipográfico |
| Invitación | Revelar la pieza original | Facsímil completo ampliable | HTML equivalente y diálogo accesible |
| Ceremonia | Agenda utilizable | Lista sin stagger de horas | Agenda completa |
| Dress code | Blanco playero y lino | Pausa blanca | Texto y trama CSS sobria |
| Puerto Velero | Situar el encuentro | Maps general, no pin supuesto | Texto y enlace |
| 8 de diciembre | Diferenciar la postboda | Agenda solo para acceso explícito | Mensaje de acceso pendiente/no incluido |
| Confirmación | Responder | WhatsApp, teléfono y correo | Enlaces nativos; no falso RSVP guardado |
| Cierre | Volver al lenguaje de carta | Tinta final y retorno | Enlaces y QR si hay URL pública |

Se conservan las 15 escenas; la agenda privada no se envía a invitados sin acceso explícito. Todos los seis registros iniciales tienen `postWeddingAccess: null`: pendiente, no autorizado. La preview general de Beta se desactivó. La fecha y el capítulo existen, pero no conceden acceso. Esto no constituye seguridad real.

## QR para diseño e impresión

**Base de Pages: `https://marieannegrace.github.io/boda`.** Los seis QR se generan con la URL real de este repositorio; no se codifica localhost. Verificar el despliegue público y una impresión física antes de distribuirlos.

1. Copiar `.env.example` a `.env.local`.
2. Usar `NEXT_PUBLIC_SITE_URL=https://marieannegrace.github.io/boda` y `NEXT_PUBLIC_BASE_PATH=/boda`. Se admite un subdirectorio público, no query ni fragmentos.
3. Reconstruir/reiniciar la aplicación con esa misma configuración y ejecutar:

```powershell
npm.cmd run qr:generate
```

El generador comparte `src/lib/site-url.mjs` y `src/lib/qr.mjs` con la aplicación. Lee todos los registros reales, excluye default y genera:

Las variables `NEXT_PUBLIC_` pueden quedar fijadas durante `next build`: cambiar el dominio requiere **regenerar el build y los QR**, no solo editar `.env.local` después de desplegar. Usar siempre la misma URL en ambos procesos.

```text
print/qr/qr-roberto.svg          print/qr/qr-roberto.png
print/qr/qr-mariayroberto.svg    print/qr/qr-mariayroberto.png
print/qr/qr-giovanna.svg         print/qr/qr-giovanna.png
print/qr/qr-amparoyeduardo.svg   print/qr/qr-amparoyeduardo.png
print/qr/qr-mercedes.svg        print/qr/qr-mercedes.png
print/qr/qr-florisyabsalon.svg   print/qr/qr-florisyabsalon.png
print/qr/manifest.json
```

SVG negro sobre blanco, sin texto interno, quiet zone de **4 módulos**, corrección M. PNG a **32 px por módulo** (más de 1000 px, tamaño dependiente de URL). Cada PNG y cada SVG rasterizado se **decodifican** y comparan con la URL exacta antes de escribir los entregables.

Sin dominio, el comando produce un manifest `pending`, explica el bloqueo y sale con código 1. Ese manifest es preparación de producción, no un QR ni aprobación de impresión. Solo un manifest `decoded-and-verified` corresponde a archivos emitidos; si cambia el dominio o invitados, regenerar y no reutilizar archivos de una corrida anterior. No publicar el manifest de todos los invitados en `public`.

La aplicación presenta el QR y descargas en “El enlace de tu carta” al cierre, solo si está configurada la URL. Archivos estáticos individuales (con el prefijo de despliegue):

- `/qr/qr-{slug}.svg`
- `/qr/qr-{slug}.png`

El generador copia únicamente SVG/PNG a `public/qr` antes del build, no el manifest de todos los invitados. Los archivos inexistentes devuelven 404. Ya no existen endpoints de servidor ni respuestas 503 en Pages. No hay índice/listado de invitados en la interfaz y cada carta solicita solo su QR.

La decodificación local verifica `QR → URL → slug → registro`, incluido `/boda`. El hosting público se verifica después del workflow; siguen pendientes el escaneo en móvil real y la prueba física al tamaño final antes de imprimir/distribuir.

## Datos y assets pendientes

- Sin videos reales: las rutas de media configuradas son asociaciones preparadas, no archivos inventados. El servidor comprueba existencia antes de presentar el player. Solo adjunta la fuente al pulsar reproducir; no solicita otros videos.
- Completar poster, dimensiones, VTT y transcripción revisados en cada registro cuando se reciban.
- Fotografías propias: `event.story[].photo` y `event.location.photo`.
- Fuentes locales provisionales: Cormorant Garamond y Source Serif 4, OFL vía Fontsource, sin llamadas a Google Fonts en runtime.
- Agenda y textos comunes siguen preliminares. Final del día 7: **Por confirmar / Cierre de la celebración**, sin hora inventada.
- Invitación master PNG **6250 × 3963** intacta. Derivado web completo, lossless, orientado para lectura; `npm.cmd run assets` lo regenera. El facsímil conserva 15:45 y la agenda distingue llegada 3:45 PM / ceremonia 4:00 PM.
- Pin exacto y fotografía del lugar pendientes. Maps solo busca la zona.
- WhatsApp prepara un mensaje personalizado: no guarda ni confirma asistencia automáticamente.

## Validación

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:qr
npm.cmd run build
```

Con el export sirviendo en 3002 y las variables del build:

```powershell
$env:BETA_URL = "http://127.0.0.1:3002/boda"
$env:NEXT_PUBLIC_BASE_PATH = "/boda"
$env:NEXT_PUBLIC_SITE_URL = "https://marieannegrace.github.io/boda"
npm.cmd run test:smoke
npm.cmd run test:browser
```

Se mantienen las pruebas smoke de Beta, adaptadas al export para seis destinatarios/cupos, 15 escenas, bloqueo en HTML inicial, postboda no concedida, WhatsApp, fallback 404 sin datos de otros invitados, no-JS, facsímil y QR estáticos. Smoke decodifica ambos formatos servidos; las pruebas unitarias QR usan un origen reservado **solo en memoria**, con subdirectorio.

Playwright usa el Microsoft Edge ya instalado, sin reinstalar navegadores. La matriz incluye seis rutas × 320/390/768/1440 px, bloqueo/CTA/nombre/cupos, duración de apertura, desbloqueo/foco, recarga, scroll nativo móvil, ausencia de MP4/errores, reduced motion inicial/en vivo, Escape/omisión, fallback sin JS, 360/430 px y paisaje bajo. No sustituye QA en teléfonos reales.

Antes de V1.1: verificar QR en impresión física, confirmar cupos/accesos y datos comunes; incorporar medios y revisar iOS/Android/WhatsApp, lectores de pantalla y rendimiento real. No hay autenticación, analítica ni privacidad inventadas. Un slug, `inert` y `noindex` no protegen archivos en `public`.

## Resultado histórico de V1 antes de Pages

- Typecheck strict, lint y build de producción aprobados.
- **13 smoke + 7 pruebas QR + 32 pruebas de navegador = 52 pruebas aprobadas**. Smoke y navegador ejecutados también contra el build de producción en 3001.
- Seis rutas y cupos correctos; apertura física medida entre 2,5 y 6,5 s en las pruebas, bloqueo/desbloqueo, foco, refresh, responsive, touch, reduced motion, fallback, video ausente y WhatsApp verificados. Sin errores JS/console en el recorrido normal ni peticiones MP4.
- Revisión visual de la entrada, despliegue del papel y saludo en 390 px. Sin parallax móvil.
- Corregidos durante la validación: import CommonJS de `@next/env` en el generador, separadores de texto SSR en assertions smoke y un favicon 404. El favicon tipográfico LM es interfaz, no extracción/redibujo del monograma del raster.
- **QR finales pendientes, no emitidos**: el usuario confirmó que la URL pública todavía no existe. El manifest queda en `pending` con seis archivos planificados. La decodificación se verificó con un origen de pruebas solo en memoria; no es una validación de escaneo físico ni del hosting público.

## Validación de la adaptación Pages

- Export estático, typecheck y lint aprobados con `/boda` y la URL real de Pages.
- 13 smoke y 7 pruebas QR aprobadas; los smoke decodifican los seis SVG y seis PNG servidos y comprueban sus URLs.
- Los 32 escenarios de navegador están verificados contra el export local, incluidos seis destinatarios en 320/390/768/1440 px, apertura, refresh, scroll, reduced motion, touch y lectura sin JavaScript. Dos casos de timing excedieron el límite en la ejecución paralela; ambos pasaron al repetirlos con un solo worker, sin relajar los límites.
- Seis SVG y seis PNG emitidos en `print/qr` con manifest `decoded-and-verified`. El generador vuelve a verificarlos automáticamente antes de cada build.
- Pendiente independiente de las pruebas técnicas: escaneo con teléfonos reales y prueba física de impresión.
