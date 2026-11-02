# THE LOVE ISSUE: medios y entrada audiovisual

## Alcance

Optimizacion de la V1 existente, sin cambiar invitados, cupos, rutas, seis
segmentos ni quince escenas. History sigue siendo obligatorio y utiliza
todas las fotografias asignadas. No se agregan servicios externos, APIs
ni dependencias de produccion.

El inventario **por cada una de las 45 fotografias y los cinco videos**,
resoluciones, bytes, parametros de codificacion, comparaciones visuales y
SHA256 estan en [MEDIA-OPTIMIZATION.md](MEDIA-OPTIMIZATION.md).

## Medios

- Fotos: WebP q80, candidatos de 360/720/1280 px sin ampliar ni recortar.
  Los derivados de todas las variantes pasan de 8.79 a 6.08 MB; no es el
  peso que descarga una sola edicion. `sizes` corresponde al espacio dentro
  del marco, no a toda la pantalla. Los focal points siguen en el catalogo.
- Videos: los cinco originales suman 67.49 MB; sus copias web, 13.28 MB.
  H.264/AAC, fast-start (`moov` antes de `mdat`), poster WebP propio y
  encuadre completo. Se comparo cada archivo a 540x960 con un candidato
  720x1280: este ultimo costaba 60.8% mas en conjunto sin mejora material
  observada en los marcos evaluados. No se impone esa resolucion a futuros
  medios como sustituto de una nueva revision.
- Musica: original WEBA de 5.38 MB; copia AAC/M4A de 3.85 MB, 96 kbit/s,
  stereo, 48 kHz y 320.73725 s. El original permanece disponible como
  fallback. No se cambia la duracion ni se corta el principio.
- Los 51 originales se conservan; las copias son regenerables con Sharp
  y una herramienta FFmpeg local. FFmpeg no se instala como dependencia
  de la aplicacion ni se requiere en Pages. No se envian medios a terceros.
- El servidor compara el SHA256 del original con el catalogo antes de
  seleccionar una copia: un archivo sustituido no recibe un derivado viejo.

Las comparaciones de fotogramas/SSIM no prueban comprension del mensaje
ni sustituyen revision humana de rostros, cabello, escenas oscuras y
escucha en telefonos reales. Los originales siguen disponibles para esa
revision. No se genero WebM adicional porque MP4 proporciona compatibilidad
y una reduccion ya significativa sin duplicar la carga.

## Entrada y precarga

La bienvenida es parte de la misma story engine: THE LOVE ISSUE,
destinatario, preparacion y dos decisiones explicitas:
**Entrar con sonido** / **Continuar sin musica**.

El progreso es un conteo real de recursos completados, no un porcentaje
de bytes estimado ni un temporizador:

1. Portada y las fuentes que usa la bienvenida listas, sin esperar fuentes
   de otras escenas.
2. Primera fotografia elegida mediante `srcset`, descargada y decodificada.
3. Musica con datos suficientes para `canplay`.
4. Poster del primer mensaje decodificado.
5. Primeros 64 KiB del primer MP4, recibidos mediante HTTP 206.

Las ediciones sin video no incluyen sus pasos. El MP4 completo no es un
requisito de entrada. Tras la eleccion se espera solo el nucleo visual
(portada y primera foto); **Entrar mientras carga** permite continuar sin
bloqueo si tarda o falla. Las imagenes activas tienen indicacion de carga y
el reloj automatico no las abandona mientras estan pendientes.

La siguiente pagina prepara todas sus fotos (hasta dos). En el momento
adecuado se prepara el inicio/poster del siguiente mensaje, nunca otro
reproductor. Una respuesta 200 que ignora Range se cancela; no se convierte
la precarga en la descarga completa de un video.
Recibir esos 64 KiB **no significa que el video completo este listo ni
garantiza un hit de cache**: la medicion de inicio usa `canplay` del video
real. El navegador puede solicitar rangos adicionales o revalidarlos.

La primera version experimental utilizaba 256 KiB; la prueba lenta mostro
competencia con la musica. Se redujo a 64 KiB antes de la validacion final.
El rango de video y los posters tienen prioridad baja; las fotos preparadas
tienen prioridad alta. Estas prioridades son pistas, no una garantia del
planificador de red de cada navegador.

## Audio y autoplay

- La bienvenida solicita una unica interaccion, sin pedir permisos de
  microfono, camara, ubicacion ni notificaciones.
- **Entrar con sonido** crea el controlador Web Audio existente, posiciona
  la musica en el segundo 10 y aplica un fade-in de 1.6 s desde cero.
  No es una espera de diez segundos.
- No se inicia musica antes de la eleccion explicita. Esta decision aplica
  la pantalla de bienvenida solicitada en el punto 9 en lugar de emitir
  sonido inesperado durante la carta cerrada.
- Musica continua y en loop durante las stories; un video en reproduccion
  reduce la ganancia a `volumenElegido * 0.02`. Al parar o salir se restaura
  en 350 ms sin reiniciar. Se comprueba sobre el GainNode real.
- Al sacar la revista de pantalla se pausa la pista, pero se conserva
  su `src` y posicion. Al regresar continua; no se vuelve al segundo cero.
- Volumen y eleccion de musica se conservan en `sessionStorage` durante
  la sesion, sin guardar identidad del invitado. Si ese almacenamiento
  falla, se registra y se conserva la preferencia en memoria.
- Continuar sin musica no silencia la voz de los videos.
- Al entrar en un mensaje se intenta `play()` inline con voz. Un rechazo
  de politica produce **Reproducir con sonido**, grande y accesible;
  no se intenta una reproduccion muda que parezca un mensaje sin voz.
- No se insiste en bucle tras `NotAllowedError`. El boton llama a `play()`
  dentro del gesto y reanuda el controlador de musica si fue elegido.
- La presentacion neutra del segundo mensaje dura 2.2 s, se puede pausar
  o iniciar inmediatamente; despues intenta reproducirse con voz.
- Nunca hay dos videos montados; al salir se pausa el anterior, se elimina
  su `src` y se libera con `load()`. Existe un unico elemento audio.

## Metodo de medicion

Laboratorio local sobre exportaciones de produccion con base `/boda`.
Baseline: commit publicado `ddc1665`, reconstruido en una carpeta aislada
con las mismas dependencias. Se amplio solo la raiz de resolucion de
Turbopack para reutilizar `node_modules`; no cambia la experiencia.
Despues: esta implementacion, mismo navegador y guion.

Playwright + Edge/Chromium de escritorio, 390x844 CSS px, DPR 1,
cache HTTP desactivada,
movimiento reducido, tres repeticiones por perfil. La bienvenida/portada
se considera visible cuando su DOM lo esta; antes de pulsar se espera
hidratacion e interseccion reales, no una pausa fija.

| Perfil | Descarga | Subida | Latencia emulada | CPU |
| --- | ---: | ---: | ---: | ---: |
| Rapido | 10 Mbit/s | 5 Mbit/s | 20 ms | 1x |
| 4G moderada | 1.6 Mbit/s | 0.75 Mbit/s | 150 ms | 4x |
| Lenta | 0.4 Mbit/s | 0.2 Mbit/s | 400 ms | 4x |

El guion mide por separado la musica disponible y la primera foto visible;
no espera la musica para navegar a la foto. Video: espera de `canplay`
desde su activacion en la escena, no duracion de descarga completa.
Los tiempos de portada/foto/musica parten de la navegacion; incluyen la
interaccion automatizada de entrada, no representan un tiempo humano fijo.

No hay CrUX ni RUM propios disponibles para esta evaluacion. Son
**observaciones sinteticas**, no Core Web Vitals de campo ni garantia de
tiempos reales. El servidor local no replica la compresion/cache del CDN
de Pages. El equipo Windows es compartido: se informan medianas y rangos,
no una mejora universal basada en una unica ejecucion.
Un telefono con DPR 2/3 puede escoger una imagen mas grande del mismo
`srcset`; sus tiempos no se deducen de estas muestras.

La musica del baseline empieza en cero; la nueva entrada posiciona el
archivo en el segundo 10, como fue solicitado. La comparacion describe el
resultado completo de ambas experiencias, no aisla el efecto del codec de
ese cambio de comportamiento. La portada visible es una observacion de DOM,
no una medicion de LCP ni prueba de que todos los tipos esten renderizados.

Reproducir:

```powershell
$env:BETA_URL = "http://127.0.0.1:3002/boda"
$env:MEASUREMENT_SLUG = "giovanna"
$env:MEASUREMENT_OUTPUT = "test-results\loading.json"
npm.cmd run media:measure
```

`MEASUREMENT_PROFILES` permite seleccionar perfiles separados por coma.
La salida conserva version de navegador, condiciones, cada muestra,
transferencia y heap JavaScript antes/despues de cambios de escena.
El contador `transferredBytes` suma `Network.loadingFinished`: no incluye
los bytes de solicitudes parcialmente recibidas y canceladas al salir de
un video. No representa el consumo total del recorrido y no se utiliza
para afirmar un porcentaje de ahorro de datos de una sesion completa.

## Resultados de laboratorio

Edge 156.0.4314.58. Cada celda temporal es **mediana [minimo-maximo] en
segundos**, con tres muestras. El lote principal contiene 27 recorridos:
tres ediciones con video por tres redes por tres repeticiones. No hubo
errores del guion ni timeouts de disponibilidad en ese lote.

### Entrada: antes y despues

Comparacion de Giovanna contra `ddc1665`. Portada, foto y musica se
cuentan desde la navegacion; la espera de un video se cuenta desde
activar su escena.

| Red / version | Portada visible | Primera foto visible | Musica disponible |
| --- | ---: | ---: | ---: |
| Rapida / antes | 0.630 [0.619-0.876] | 1.735 [1.508-2.884] | 1.486 [1.397-2.667] |
| Rapida / despues | 0.420 [0.410-0.480] | 1.299 [1.212-1.585] | 1.214 [1.162-1.424] |
| 4G / antes | 2.092 [2.055-2.252] | 6.315 [6.187-6.628] | 6.038 [5.934-6.363] |
| 4G / despues | 2.351 [2.305-2.468] | 6.855 [6.586-7.125] | 6.868 [6.668-7.153] |
| Lenta / antes | 7.989 [7.980-8.461] | 21.346 [21.311-23.414] | 21.129 [21.082-22.550] |
| Lenta / despues | 8.212 [8.144-8.231] | 21.384 [21.228-21.601] | 24.091 [24.051-24.181] |

El baseline 4G de esta tabla es una repeticion sin codificacion concurrente.
El primer lote 4G fue inestable: medianas de portada/foto/musica
5.503/10.421/9.523 s y primer video 2.636 s. Se conservan ambas series;
no se mezclan condiciones ni se usa aquella demora como mejora atribuible
a esta implementacion.

**No todos los tiempos iniciales mejoraron.** En 4G la foto pasa de
6.315 a 6.855 s y la musica de 6.038 a 6.868 s; en lenta la musica pasa
de 21.129 a 24.091 s. La nueva bienvenida, preparacion y posicion musical
son comportamientos adicionales, no una prueba causal de que el codec sea
el responsable. M4A y MP4 tienen el indice al principio, verificado por
tests. Priorizar fotos/fuentes inmediatas y limitar el rango a 64 KiB
redujo la competencia observada en iteraciones anteriores, pero no elimina
el coste de entrada en una red muy lenta. La interfaz permite entrar sin
esperar todos los recursos y comunica los pendientes.

Otras dos ediciones, misma exportacion y condiciones:

| Edicion / red | Portada visible | Primera foto visible | Musica disponible |
| --- | ---: | ---: | ---: |
| Roberto / rapida | 0.516 [0.411-0.585] | 1.395 [1.194-1.925] | 1.252 [1.135-1.567] |
| Roberto / 4G | 2.479 [2.380-2.721] | 6.793 [6.710-6.988] | 7.036 [6.774-7.307] |
| Roberto / lenta | 7.533 [7.455-8.411] | 21.425 [21.120-21.471] | 24.725 [24.715-24.949] |
| Maria y Roberto / rapida | 0.482 [0.443-0.739] | 1.468 [1.233-2.702] | 1.277 [1.164-1.967] |
| Maria y Roberto / 4G | 1.854 [1.832-2.118] | 7.216 [6.430-7.518] | 6.969 [6.419-7.085] |
| Maria y Roberto / lenta | 7.885 [7.808-8.204] | 22.452 [22.386-23.577] | 25.437 [25.073-25.815] |

### Tiempo hasta poder iniciar cada video

Los cinco archivos alcanzaron `canplay` en las nueve muestras que les
corresponden. Esto no demuestra reproduccion sin buffering durante toda
su duracion ni permiso de autoplay en otro navegador.

| Video optimizado | Rapida | 4G moderada | Lenta |
| --- | ---: | ---: | ---: |
| Giovanna / invitacion | 0.196 [0.183-0.256] | 1.140 [1.140-1.144] | 8.163 [7.975-8.333] |
| Giovanna / segundo mensaje | 0.210 [0.196-0.215] | 1.164 [1.141-1.200] | 4.753 [4.752-4.758] |
| Roberto / invitacion | 0.201 [0.198-0.202] | 1.129 [1.118-1.137] | 6.655 [6.328-6.697] |
| Roberto / segundo mensaje | 0.244 [0.235-0.260] | 1.221 [1.217-1.247] | 4.817 [4.539-4.957] |
| Maria y Roberto / invitacion | 0.188 [0.186-0.209] | 1.468 [1.134-1.520] | 7.246 [7.217-8.127] |

Comparacion con los dos videos originales de Giovanna:

| Red | Invitacion antes -> despues | Segundo mensaje antes -> despues |
| --- | ---: | ---: |
| Rapida | 0.503 [0.486-0.564] -> 0.196 [0.183-0.256] | 0.407 [0.372-0.415] -> 0.210 [0.196-0.215] |
| 4G | 3.839 [3.805-3.907] -> 1.140 [1.140-1.144] | 1.995 [1.977-2.011] -> 1.164 [1.141-1.200] |
| Lenta | 17.859 [17.778-18.364] -> 8.163 [7.975-8.333] | 7.478 [7.476-7.504] -> 4.753 [4.752-4.758] |

El primer video mejora aproximadamente 70% en 4G y 54% en lenta en
estas muestras. No se extrapola ese porcentaje a otros invitados,
dispositivos, CDN o redes.

### Memoria y cambios rapidos

`Performance.getMetrics().JSHeapUsedSize`, MB decimales. Medianas de
Giovanna antes/despues de cinco ciclos de retroceso/avance:

| Red | Baseline: previo -> posterior | Optimizado: previo -> posterior |
| --- | ---: | ---: |
| Rapida | 6.450 -> 7.384 | 7.198 -> 8.583 |
| 4G | 6.606 -> 7.300 | 7.474 -> 8.223 |
| Lenta | 6.621 -> 6.114 | 7.637 -> 7.062 |

El rango de heap JavaScript observado en las 27 muestras principales fue
6.23-8.82 MB. No es memoria total: faltan decodificadores, buffers nativos,
texturas GPU y proceso del navegador. La nueva preparacion mantiene mas
estado y no se afirma una reduccion de memoria. Las diferencias entre
muestras incluyen recoleccion de basura; estos deltas no prueban ni
descartan una fuga.

La prueba funcional de cambios rapidos verifica por separado que cada
video saliente queda desconectado, pausado y sin `src`, sin acumular
reproductores ni controladores de musica. La medicion nativa en dispositivos
fisicos y sesiones prolongadas sigue pendiente.

### Control del ultimo build

Las tablas anteriores conservan el lote principal. Despues se cerro la
continuidad de musica al salir de pantalla y se incluyeron explicitamente
las variantes tipograficas de las palabras de portada y los botones en la
comprobacion de fuentes. No cambiaron los archivos multimedia.

Sobre el ultimo build se repitieron tres recorridos 4G de Giovanna,
sin errores ni timeouts:

| Portada | Primera foto | Musica | Video 1 | Video 2 |
| ---: | ---: | ---: | ---: | ---: |
| 2.453 [2.314-2.522] | 6.947 [6.775-8.309] | 6.990 [6.754-7.946] | 1.125 [1.100-1.148] | 1.152 [1.150-1.198] |

Confirma la menor espera de video y tambien que la entrada musical/foto
4G no es uniformemente mas rapida que el baseline. Este control no
sustituye pruebas reales de iOS/Android.

## Validacion funcional

- Lint, build de produccion y typecheck: correctos.
- Unitarios: 9 de stories, 7 de QR y 3 de integridad/optimizacion de medios.
- Smoke sobre la exportacion restaurada: 13 correctos.
- Navegador, exportacion real: 71 correctos y 8 fixtures omitidos
  intencionalmente. Incluye las seis rutas a 320/390/768/1440 px, todas las
  fotos, uno/dos mensajes en orden, History obligatorio, sonido y mute,
  ganancia relativa al 2%, fade-in, segundo 10, sesion, bloqueos de autoplay,
  tacto, teclado, axe, movimiento reducido, 200% de texto y fallback sin JS.
- Build temporal con medios sinteticos: los 8 fixtures correctos
  (final del video, pausa, errores/reintento, subtitulos/transcripcion,
  continuidad de musica y bloqueo de audio). Se eliminaron sus cuatro
  archivos y se reconstruyo/valido la exportacion real antes de medirla.
- Cambios rapidos: un video montado como maximo; el anterior desconectado,
  pausado y sin `src`; un solo audio y un solo GainNode comprobados.
- Conservacion final: 51 SHA256 de originales coinciden con los manifiestos
  previos; datos de invitados y configuracion real restaurada sin cambios.
- Revision visual de bienvenida a 320 y 430 px: sin recorte del destinatario
  ni de las dos acciones. No se convierte en un panel de permisos.
- Tras corregir continuidad fuera de pantalla se repitieron los 16 casos
  audiovisuales/de entrada. Tras incluir todas las variantes de fuente
  se repitieron los 5 de entrada y los 13 smoke, ademas de lint/build/types.
  Correctos, incluyendo posicion musical retenida y fuentes realmente listas.

La primera invocacion del lote completo se hizo sin la variable de base
`/boda` y apunto a rutas incorrectas: no es un resultado de producto.
El lote correcto completo paso sin reintentos.

Entrega guardada localmente. Esta iteracion no incluye un nuevo commit,
push ni despliegue a GitHub Pages; el sitio publicado anterior no cambia.

## Ampliacion: ambientacion botanica

Se incorporaron dibujos SVG propios de olivo y flores silvestres como
tinta marginal, sin solicitudes de imagen adicionales, dependencias,
filtros ni modificaciones de fotografias, videos o musica. Las tablas de
rendimiento anteriores corresponden a la optimizacion audiovisual, no
son nuevas mediciones de esta capa.

La bienvenida, portada, History, edicion familiar y cierre tienen
composiciones diferentes. Opacidades de 3.5-15%, con el centro libre y
los videos sin motivos. En fotos se conserva solo una rama tenue y se
alterna el margen. La capa usa `aria-hidden`, no contiene controles y
aplica `pointer-events: none`.

El fade y el desplazamiento de 4-6 px se integran en la linea de tiempo
existente: se ejecutan una sola vez por entrada, se pausan con el lector
y se limpian al cambiar de escena. En movil solo hay fade; no hay
parallax ni listeners de scroll nuevos. Con movimiento reducido, incluso
si cambia durante la visita, la composicion queda estatica.

Validacion de esta ampliacion:

- Lint, build y typecheck correctos.
- 5 pruebas botanicas: margenes/centro, opacidad, ausencia sobre video,
  320/430/1440 px, pausa, fin de movimiento, cambio de preferencia en vivo
  y ausencia de desplazamiento ambiental movil.
- 32 regresiones de navegador correctas: entrada, seis ediciones,
  audio/video, axe, tacto, navegacion, no-JS y texto al 200%.
- 9 unitarios de stories, 3 de medios y 13 smoke correctos.
- Los 51 SHA256 de originales siguen coincidiendo; datos de invitados
  y estructura narrativa sin cambios.
- Revision visual de capturas de bienvenida, portada, fotos y cierre:
  ornamentacion subordinada a texto e imagen, sin nuevas zonas tactiles.

Estas verificaciones son de Edge/Chromium con viewports simulados;
no sustituyen dispositivos fisicos.

## Limites de compatibilidad

Probado en Edge/Chromium de escritorio con emulacion movil, redes lentas,
tacto CDP y bloqueos de politica inyectados. Esto no es una prueba fisica
de Safari/iOS, Chrome/Android o navegadores internos de WhatsApp.

Un gesto no garantiza permiso para todos los elementos multimedia ni
para una navegacion completa posterior. iOS y navegadores internos pueden
seguir exigiendo el boton del video; ahorro de datos/energia puede limitar
precarga o suspender audio. AAC/H.264 amplia compatibilidad, pero no
demuestra que todos los dispositivos reproduciran el archivo.

Pendiente: escucha humana de mezcla/voz, dispositivos fisicos iOS/Android,
VoiceOver/TalkBack, orientacion, pantalla bloqueada, Bluetooth/auriculares
y conexiones reales. No se fuerza autoplay contra la politica del navegador.
