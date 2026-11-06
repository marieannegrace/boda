# The Letter — V1

Evolución de la Beta aprobada, no una reconstrucción. Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, CSS Modules/variables, GSAP 3.15.0, @gsap/react 2.1.2, ScrollTrigger, Flip y Lenis únicamente en desktop.

## GitHub Pages

URL de este repositorio: **https://marieannegrace.github.io/boda/**.
Las cartas se publican en `https://marieannegrace.github.io/boda/{slug}/`.

La aplicación utiliza `output: "export"`, `trailingSlash: true` e imágenes preoptimizadas sin servicio Next Image. Las seis cartas y sus variantes de lectura se generan desde JSON durante el build. CSS, JavaScript, fuentes, imágenes, videos y QR respetan `NEXT_PUBLIC_BASE_PATH=/boda`.

El workflow [pages.yml](../.github/workflows/pages.yml) despliega cada push a `main`: configura Pages, instala el lockfile con Node 22, ejecuta lint/pruebas QR, genera y decodifica los QR, exporta y comprueba tipos, sube `landing/out` y publica. Obtiene URL y base path de `actions/configure-pages`, por lo que también admite un dominio personalizado configurado en Pages. El artifact `invitation-print-qr` contiene los archivos imprimibles.

`npm run build` genera los QR automáticamente mediante `prebuild` y exige una URL pública configurada cuyo subdirectorio coincida con `NEXT_PUBLIC_BASE_PATH`. Esto evita publicar un build con QR ausentes o enlaces que omitan `/boda`.

Pages no ejecuta Node/SSR ni endpoints dinámicos. Las rutas desconocidas muestran la experiencia completa del registro `default` mediante `404.html`, sin datos de otra familia ni redirección: conservan el estado HTTP 404 propio de Pages. Sin JavaScript, el formulario abre `/{slug}/lectura/#saludo` (o `/lectura/` para la invitación general); conserva el gesto explícito y no depende de query params ni servidor. Con JavaScript se mantiene la apertura física original, sin navegar.

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

La escena `#video` ya no es un reproductor tradicional: `LoveIssue.tsx` presenta seis segmentos 9:16 como una edición coleccionable. Conserva el identificador del capítulo, su motor/gestos y las otras catorce escenas para no romper enlaces existentes. History tiene páginas internas, no una galería paralela.

| Story | Función | Medio actual |
| --- | --- | --- |
| Portada | THE LOVE ISSUE → Special Wedding Edition → volumen/lugar/año | Tipografía y papel CSS |
| Historia | La memoria compartida con el destinatario | Texto inicial → todas las fotos de la edición, de una o dos → pausa tipográfica |
| Family Edition | Dedicar la edición y mostrar cupos | Datos del invitado actual |
| Una nueva página | Preparar el encuentro | Primer retrato global de Luis & Marie, sin recortar |
| Mensaje personal | Luis y Marie hablan directamente | Invitación → presentación neutra → segundo video si existe; foto/firma solo si no hay videos |
| El encuentro | Gratitud, fe, esperanza y amor; datos del encuentro | Cierre tipográfico, invitación y compartir |

**Abrir mi edición** inicia la secuencia y solicita la música mediante ese gesto, nunca al cargar la landing. Cada página tiene la duración de su segmento en `slides` (5 s actualmente). Sin fotos ni video son 30 s nominales; cada página interna de History añade su tiempo, sin límite artificial de fotos. El segundo segmento refleja el avance acumulado por esas páginas; los seis segmentos principales no cambian. Anterior/siguiente, gestos y flechas recorren primero las páginas internas y después el segmento siguiente; volver desde Family Edition recupera la última página de History. El cierre queda disponible, sin navegar ni enviar mensajes automáticamente. Un video real usa su propia duración, sin cortar la voz a los 5 s.

History es obligatorio: introducción, todas las fotografías y pausas, sin botón para saltar. Solo al avanzar desde su última página se desbloquean las escenas posteriores de la carta, incluida agenda/confirmación. Los enlaces de capítulos y los hashes directos previos a ese momento remiten a la edición con una explicación. Es una condición de recorrido en memoria, no autenticación ni una prueba de cuánto tiempo se observó cada foto. No hay permanencia mínima obligatoria: Siguiente/Anterior siguen disponibles. Sin JavaScript se ofrece lectura lineal con todas las fotografías y los mensajes enlazados, sin controles bloqueados.

Con dos videos, el primero es la invitación. Al terminarlo aparece una presentación editorial neutra; **Reproducir segundo mensaje** inicia la revelación sin anunciar previamente el cargo. Siguiente desde esa presentación también reproduce el segundo mensaje, no lo omite. Ambos ocupan páginas internas del quinto segmento y su progreso es acumulado. Nunca se montan dos videos simultáneos. Anterior permite volver al mensaje anterior; Siguiente permite cerrar uno y continuar. En modo manual, el último video terminado deja los controles disponibles hasta que el invitado decida avanzar.

Toques a izquierda/derecha, swipe horizontal y botones **Anterior / Pausar / Siguiente** recorren las páginas. **Reanudar** se distingue de avanzar. Mantener presionado pausa texto, progreso y video; soltar reanuda. A los 3.5 s sin interacción aparece una única ayuda contextual con una mano SVG de dos movimientos discretos; no es un popup ni un loop permanente. Reduced motion mantiene el texto y elimina su movimiento. La ayuda no desplaza los botones dentro del marco. El scroll vertical sigue siendo nativo en móvil. Flechas del teclado navegan, espacio pausa/continúa, los controles tienen foco visible y no hay trampa de Tab. Avance automático es opcional; se pausa fuera de pantalla, con pestaña oculta, al mantener presionado o cuando el teclado está dentro de los controles. Reduced motion desactiva autoplay/animación y deja navegación y video bajo gesto explícito.

Pantalla completa usa la API nativa, incluye controles y acciones finales y permite salir con Escape/el mismo botón. Si el navegador no la admite, informa y conserva la experiencia inline. **Ver la invitación** devuelve foco y scroll al facsímil/agenda. Compartir usa Web Share con la URL del invitado, no una ruta genérica; sin esa API el botón es **Copiar enlace**. Si falla, quedan WhatsApp y un campo seleccionable. Cancelar el menú no es un error; copiar/compartir fallidos muestran instrucciones, no una confirmación ficticia.

### Configurar contenido y medios

- `src/data/stories.json`: textos compartidos, orden, tiempos, edición, foto general y `generalVideo/generalPoster/generalCaptions/generalTranscript`. Están en `null` hasta recibir medios reales.
- `guests.json`: sigue siendo la única fuente de nombres, cupos y video personalizado. Usa sus campos `video`, `videoMessages`, `poster`, `captions`, `transcript`. `videoMessages` permite fijar, en orden, el archivo y destinatario de hasta dos clips; para Floris y Absalon identifica el primero para los abuelos y el segundo para Charlotte. No crear un segundo listado de familias.
- Cada registro admite opcionalmente `stories: { "edition": "FAMILY EDITION", "photo": null, "photoAlt": "Descripción de la foto", "message": null }`. `message` reemplaza la despedida editorial. Estos overrides no obligan a modificar componentes.
- `stories.server.ts`/`story-media.mjs` comprueban en build: videos del invitado → general → fotografía disponible → firma editorial. La detección reutiliza la clasificación de nombres existente, respeta mayúsculas/espacios del archivo real y permite uno o dos MP4 por edición, en orden numérico. Para Floris/Absalon, la lista explícita de `videoMessages` fija tanto la fuente como el destinatario y excluye coincidencias no configuradas. Más de dos exige revisar el inventario y detiene el build, en lugar de omitir archivos. No mezclan poster/captions/transcript de otra familia. Los medios ausentes nunca generan mensajes de desarrollo ni elementos rotos. Errores de configuración/IO distintos de archivo ausente interrumpen el build.
- Si existen `captions`, el botón **CC** permite activarlos/desactivarlos. `transcript` habilita **Leer el mensaje**. Sin esos datos no aparecen los controles.
- El cliente recibe solo la edición actual. El video no se monta ni tiene `src` antes de la quinta página/inicio explícito; usa preload none, muted, playsInline, sonido y play/pausa discretos. Pausa/libera el recurso al salir y ofrece reintento/continuación ante fallos. Nunca solicita videos de otras familias.
- Marcos, textura y ornamentos de borde están hechos con CSS. Portada y Family Edition incluyen `VOL. 01` y `NO. 001`; los metadatos usan sans-serif y los titulares serif. El formato vertical permanece centrado en desktop. Las fotos reales reciben un tratamiento cálido leve, sin parallax móvil.

### Subir medios sin modificar componentes

Las carpetas ya existen dentro de `public/`. Los 45 archivos reales recibidos en `public/posters/`, los siete MP4 originales y el WEBA se conservan byte a byte. Inventario actual:

| Edición | Mensaje de invitación | Segundo mensaje |
| --- | --- | --- |
| `/giovanna/` | `GIOVANNA.mp4` | `GIOVANNA 2.mp4` |
| `/roberto/` | `ROBERTO.mp4` | `ROBERTO 2.mp4` |
| `/mariayroberto/` | `ROBERTO Y MARIA.mp4` | No existe |
| `/florisyabsalon/` | `florisyabsalon.mp4`, para Floris y Absalon | `florisyabsalon 2.mp4`, para Charlotte |
| Otras dos ediciones | Sin MP4 recibido; fotografía editorial | No existe |

La asignación y los destinatarios de los dos mensajes de Floris, Absalon y Charlotte fueron confirmados por el usuario. No se inventan los videos que faltan ni se reutiliza el de otra familia.

Para `/florisyabsalon/`, `videoMessages` en `guests.json` fija las rutas y destinatarios en orden. El player presenta el segundo mensaje a Charlotte con su nombre antes de que el invitado lo reproduzca; no usa una coincidencia automática de archivos para elegir mensajes adicionales de esta edición.

| Carpeta física | Nombre que se detecta automáticamente | Uso |
| --- | --- | --- |
| `public/videos/` | `{slug}.mp4` o nombre de la persona/familia; sufijo `2` para el segundo | Uno o dos mensajes consecutivos; mayúsculas y espacios admitidos |
| `public/posters/` | `{slug}.jpg` | Poster del video personal, salvo override explícito |
| `public/posters/` | Nombres de personas/familias, incluso espacios y extensión JPG/JPEG/PNG/WebP | Todas las fotos de History de su edición |
| `public/images/` | `{slug}.jpg` | Foto de la edición personal |
| `public/images/` | `luis-marie.jpg` | Foto compartida si no hay foto personal |
| `public/images/` | `history.jpg` | Foto secundaria de la segunda story |
| `public/images/` | `cover.jpg` | Última alternativa de foto compartida |
| `public/audio/` | `videoplayback.weba` | Música global actual, seleccionada en `stories.json` |
| `public/audio/` | `the-love-issue.mp3` | Alternativa opcional para navegadores sin WEBA/Opus |

Ejemplo: subir `public/videos/mariayroberto.mp4` y opcionalmente `public/posters/mariayroberto.jpg`; después del build aparecerán automáticamente en `/mariayroberto/`. No copiar los JSON de invitados. En Pages hace falta **commit/push a `main`** para ejecutar el build y publicar los archivos: no hay detección de archivos nuevos en el sitio ya exportado.

La detección por nombre está en el mismo módulo `story-media.mjs`. No contiene otro guest map: nombres/cupos siguen viniendo exclusivamente de `guests.json`. Ignora mayúsculas, acentos y prefijos decorativos aislados (`R`, `F`, `K`, `M`, `T`, `&`). Asocia `giovanna`, `amparo`+`eduardo`, `flor`/`floris`+`absalon`, `mercedes`, y separa `roberto` sin `maria` de `roberto`+`maria`. `luis`+`marie` es material global. Los nombres no reconocidos generan una advertencia en preparación, nunca se asignan por azar.

El orden es natural, numérico y determinista, normalizando espacios: 2 antes de 10; nombres sin número primero. **No se descarta ninguna foto ni se deduplican archivos**. La primera foto tiene página propia; el resto se agrupa de una o dos. Dos retratos verticales pueden convivir lado a lado; formatos mixtos/horizontales se apilan con espacio individual. Se intercala una pausa tipográfica en historias largas. Los collages recibidos también se muestran íntegros.

Material actual por edición: Roberto 8 fotos; María y Roberto 11; Giovanna 13; Amparo y Eduardo 1; Floris y Absalon 10; Mercedes 0. Las 43 fotos específicas más los dos retratos globales suman los 45 archivos recibidos. No se inventan fotos para Mercedes. `luis y marie.jpg` aparece en Moment; `luis y marie 2.JPG` en el mensaje sin video. No se repiten en portada/cierre ni reemplazan las fotos de History.

Sin retratos globales, se mantiene la prioridad anterior de foto: override personal → `/images/{slug}.jpg` → `stories.photo` → `/images/luis-marie.jpg` → `/images/cover.jpg`. El poster usa override explícito → `/posters/{slug}.jpg` → fotografía disponible → fondo editorial. Nunca se buscan archivos de otra familia.

### Encuadres, focal points y derivados web

`npm run photos:prepare` (también `predev`/`prebuild`) prepara un catálogo privado en `.cache/story-photos.json` y derivados WebP responsivos en `public/images/stories/`, **sin ampliar, sobrescribir, renombrar o recortar los originales**. Ambas salidas son regenerables y están ignoradas por Git. El inventario y los parámetros están en [MEDIA-OPTIMIZATION.md](MEDIA-OPTIMIZATION.md). En el navegador se usa `picture/srcset`, `sizes` según el marco real y dimensiones reservadas; solo se montan imágenes activas y se preparan las dos fotos de la página siguiente cuando corresponde. El cliente recibe exclusivamente fotos de su edición y las globales necesarias.

Los archivos recibidos miden entre 347 y 1625 px de ancho, no 4000×3000. No se consideran sustitutos de esos masters. Si se entregan masters mayores, las mismas reglas generan sus derivados sin alterar el original.

Tratamientos por foto en `stories.json`, sin panel administrativo:

```json
{
  "photography": {
    "historyReflection": "Algunos recuerdos se quedan con nosotros.",
    "overrides": {
      "giovanna 3.jpg": {
        "treatment": "memory",
        "focalPoint": { "x": 50, "y": 42 },
        "alt": "Descripción revisada de esta fotografía."
      }
    }
  }
}
```

Sin override, horizontales usan `memory` y verticales/cuadradas `editorial`, siempre con `object-fit: contain`, sin zoom y focal point 50/50. `memory` deja papel alrededor de la foto; `editorial` conserva la imagen completa con aire tipográfico. `hero` permite `cover` y un zoom mínimo **solo si se aprueba que el recorte es seguro**. Ninguna de las 45 fotos usa hero por defecto. Los focal points son porcentajes 0–100; modificar la configuración y reconstruir, no los originales.

### Tinta botánica ambiental

THE LOVE ISSUE añade dos dibujos SVG ligeros de olivo y flores silvestres,
sin imágenes externas ni cambios en los medios originales. La capa es
independiente del contenido, no interactiva y oculta al lector de pantalla.
El centro queda libre; las composiciones asimétricas cambian entre bienvenida,
portada, History, edición familiar y cierre. Las páginas fotográficas alternan
el margen y reducen la tinta al 3.5%; los videos no muestran ornamentación.
El papel y la tipografía siguen siendo protagonistas.

Opacidades: bienvenida 12%, portada 15%, History 7%, edición familiar 10%,
Moment 4.5%, mensaje sin video 3.5% y cierre 14%. La entrada usa un solo fade
de 1.6 s; únicamente en desktop con puntero fino hay un desplazamiento de
4–6 px. No hay loops, filtros, animación de trazados ni parallax móvil.
La línea de tiempo existente pausa también los motivos y los revierte al
activar `prefers-reduced-motion`; sin movimiento, quedan impresos estáticos.

### Bienvenida y preparación progresiva

La entrada conserva la identidad editorial y presenta **Entrar con sonido** y **Continuar sin música**. El progreso cuenta recursos realmente preparados, no segundos ni porcentajes de bytes inventados: fuentes/portada, primera foto decodificada, música disponible, poster y primeros 64 KiB del primer video mediante HTTP Range. No se monta un segundo reproductor para precargar.

Al elegir entrar se espera únicamente la portada y primera foto; no se bloquea por descargar videos completos o toda la canción. **Entrar mientras carga** permite continuar si falla o tarda ese núcleo. Las fotos activas indican carga y el reloj automático no avanza mientras aún esperan su imagen. El próximo par de fotos se prepara en segundo plano. La introducción del segundo mensaje prepara únicamente su poster y comienzo; no descarga dos videos completos a la vez. Si el servidor no acepta Range, se cancela la respuesta en vez de descargar todo el MP4.

El servidor selecciona los derivados de `public/media/catalog.json` **después** de resolver la edición con el clasificador existente. El catálogo no se envía entero al cliente. Sin derivado para un medio nuevo se conserva el original hasta generar su copia web. Los derivados audiovisuales y el catálogo deben conservarse en Git; el build de Pages no necesita FFmpeg.

Para regenerar audiovisuales localmente: `npm run media:prepare`, con FFmpeg/FFprobe instalados o rutas `FFMPEG_PATH` y `FFPROBE_PATH`. No es una dependencia del navegador ni de producción; no sube medios a servicios externos. La preparación de fotos sigue usando el Sharp ya instalado.

### Música ambiental

El original es `public/audio/videoplayback.weba` (WebM/Opus); se utiliza preferentemente su copia AAC/M4A compatible, sin alterar el original. Hay un solo elemento audio y un solo controlador Web Audio (`AudioContext` + `GainNode`), creado en la interacción de entrada. **Entrar con sonido** inicia en `currentTime = 10` y aplica fade-in de 1.6 s desde ganancia cero; no espera diez segundos. La música no se activa antes de que el invitado elija sonido. Si la política bloquea el intento, se ofrece **Activar música**, sin insistir ni mostrar errores técnicos.

El volumen inicial es 0.16; el invitado puede ajustarlo entre 0 y 100% y silenciarlo. Solo la elección de música y volumen se guardan en `sessionStorage` (sin nombres ni datos de invitados), para no repetir la bienvenida durante la sesión. Si el almacenamiento está bloqueado, el recorrido funciona y la preferencia se mantiene en memoria. Continuar sin música no silencia los mensajes personales. Una nueva navegación completa puede requerir un nuevo gesto por política del navegador; no se garantiza autorización global de audio.

Durante cualquier video que esté reproduciéndose, la ganancia efectiva es `volumenElegido × 0.02`. Ejemplo: 40% pasa a 0.8% del volumen de salida total, no a 2% fijo. La pista sigue reproduciéndose y su reloj avanza. Al pausar/terminar/cerrar el video se recupera el volumen elegido; las rampas duran 350 ms. El silencio elegido por el usuario no se revierte automáticamente. La música solo se pausa al silenciar, pausar el recorrido, mantener presionado, ocultar pestaña o salir de pantalla. No reinicia al cambiar de slide o video. La ruta se libera al desmontar.

AAC/M4A y WEBA/Opus se comprueban mediante `canPlayType`, con fallback al original si falla la copia; también se conserva el soporte del MP3 opcional existente. La reproducción real se verifica en Chromium/Edge, no en Safari/iOS ni dispositivos físicos. Web Audio no depende de que iOS permita escribir `HTMLMediaElement.volume`. Referencias: [formatos multimedia MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers), [limitaciones de volume](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume).

Los cinco mensajes utilizan derivados MP4 H.264/AAC con fast-start y poster propio. El video usa `object-fit: contain`: conserva rostros y textos incluso si la proporción no es 9:16. Al llegar a su escena se intenta reproducción **con voz**, inline, incluso cuando se simplifica la animación por movimiento reducido. No se usa autoplay silenciado como sustituto. Si se bloquea, aparece **Reproducir con sonido**, grande y explícito, que llama a `play()` dentro del gesto. El silencio elegido para un video sigue siendo reversible.

El segundo mensaje mantiene una presentación neutra de 2.2 s, pausable, sin revelar el cargo; después intenta reproducirse automáticamente. También puede iniciarse inmediatamente con su botón. Solo el video actual está montado, y se libera al salir. Para medios no convencionales se admiten rutas configuradas en `/images/` o `/posters/` (JPG/JPEG/PNG/WebP). Subtítulos WebVTT del mismo nombre base se detectan junto al video; siguen funcionando los campos `captions`/`generalCaptions` y `transcript`/`generalTranscript`. No se recibieron subtítulos ni transcripciones reales: no se inventan.

```powershell
npm.cmd run test:stories
npm.cmd run test:media
$env:BETA_URL = "http://127.0.0.1:3002/boda"
npm.cmd run test:browser -- stories.spec.ts stories-touch.spec.ts stories-photos.spec.ts --workers=1
```

Las pruebas cubren los seis destinatarios/segmentos, pausa/gestos/touch real por CDP, fullscreen, compartir/copia, no-JS y 320/360/390/430/768/1440 px. `stories-photos.spec.ts` recorre todas las fotos de cada edición en 320/390/768/1440 px y verifica proporciones completas, ausencia de transformaciones que recorten personas, orden/cobertura, aislamiento de peticiones y progreso/pausa de History. Las capturas complementan estas comprobaciones, no identifican personas automáticamente.

`stories-audiovisual.spec.ts` usa los medios reales: las seis rutas, uno/dos videos y orden, carga diferida, History obligatorio, WEBA, ganancia efectiva al 2%, volumen/mute, restricciones de autoplay, ayudas y auditoría axe sobre el DOM renderizado. Ver [auditoría de usabilidad](USABILITY-AUDIT.md).

`stories-media.spec.ts` se ejecuta aparte con `STORIES_MEDIA_FIXTURE=1` y un build local sobre la edición pública: MP4 sintético 9:16 de 7 s, poster, VTT y MP3 silencioso (`tests/create-story-fixture.mjs`). Verifica duración/ended, sonido, pausa, CC/transcripción, fallos de video/foto, música continua con atenuación, restauración y bloqueo de autoplay. Configurar temporalmente `generalVideo`, `generalPoster`, `generalCaptions`, `generalTranscript` y `music` con esos recursos. Nunca publicar ese build ni sus archivos: restaurar configuración, borrar los cuatro archivos de fixture y reconstruir antes del push. Los medios sintéticos no forman parte de la invitación entregada.

La evidencia E2E del 6 de noviembre de 2026 comprueba los dos videos de `/florisyabsalon/`, su orden y sus destinatarios en Edge/Chromium. La suite audiovisual cubre los siete MP4 optimizados, la copia AAC y el fallback del WEBA, pero no reemplaza QA ni escucha en iOS/Android físicos. Las seis rutas, invitados, cupos, 15 escenas y el formato de seis segmentos se mantienen. [PERFORMANCE-AUDIT.md](PERFORMANCE-AUDIT.md) documenta condiciones de red/CPU, tiempos, memoria y límites. `npm run media:measure` permite repetir la medición local; admite `BETA_URL`, `MEASUREMENT_SLUG`, `MEASUREMENT_PROFILES` y `MEASUREMENT_OUTPUT`.

## Recorrido y función narrativa

| Escena | Propósito / contenido | Acción y transición | Fallback |
| --- | --- | --- | --- |
| Carta cerrada | Identificar destinatario y cupos | Abrir, sin enlaces de bypass | Formulario nativo |
| Apertura | Umbral físico de objeto a lectura | Solapa → papel → pliegues → destinatario | Inmediata con reduced motion; control para omitir animación |
| Saludo | Dedicar la carta | Foco y lectura libre | Nombre y cupos en HTML |
| The Love Issue | Edición personal en seis stories | History obligatorio, controles visibles, mensajes consecutivos y regreso a invitación | Lectura estática y composiciones tipográficas sin medios |
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
