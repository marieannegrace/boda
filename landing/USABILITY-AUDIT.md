# THE LOVE ISSUE: auditoria audiovisual y de usabilidad

## Alcance y metodo

V1 existente, seis segmentos y quince escenas, sin nuevas dependencias.
Pruebas funcionales sobre exportacion estatica local en Microsoft Edge/Chromium
mediante Playwright; viewports 320, 360, 390, 430, 768 y 1440 px, tacto
emulado por CDP, teclado, movimiento reducido y lectura sin JavaScript.
Los perfiles siguientes son **recorridos simulados**, no entrevistas ni pruebas
con invitados reales. No acreditan comprension humana ni conformidad WCAG completa.

## Inventario comprobado

| Edicion | Fotografias familiares | Videos, en orden |
| --- | ---: | --- |
| Roberto | 8 | ROBERTO.mp4; ROBERTO 2.mp4 |
| Maria y Roberto | 11 | ROBERTO Y MARIA.mp4 |
| Giovanna | 13 | GIOVANNA.mp4; GIOVANNA 2.mp4 |
| Amparo y Eduardo | 1 | Ninguno recibido |
| Mercedes | 0 | Ninguno recibido |
| Floris y Absalon | 10 | Ninguno recibido |

Ademas: dos fotografias globales distintas de Luis y Marie, y
`public/audio/videoplayback.weba` (WebM/Opus). No se inventan medios faltantes.
La asignacion de los videos y el significado de los archivos "2" fueron
confirmados por el usuario. Los segundos se presentan sin anticipar el cargo.

## Problemas corregidos

| Hallazgo | Correccion |
| --- | --- |
| Nombres reales con espacios y mayusculas no coincidian con las rutas MP4 convencionales | Descubrimiento en build con el clasificador existente y URL con nombre real; misma seleccion en Windows y Linux |
| Solo habia un mensaje por edicion | Paginas internas consecutivas dentro del quinto segmento; presentacion neutra y boton para el segundo |
| Musica MP3 ausente, audio WEBA no reconocido | Deteccion WEBA, MIME correcto y comprobacion del codec; alternativa MP3 opcional |
| La musica se pausaba durante el video | Una pista continua, ganancia relativa al 2%, rampas de 350 ms y restauracion del volumen elegido |
| Flechas aisladas y "Pausa" eran poco explicitas | Anterior, Siguiente, Pausar y Reanudar visibles, objetivos de al menos 44 px |
| Los gestos eran una convencion oculta | Ayuda contextual tras 3.5 s, mano SVG con dos movimientos y texto; controles equivalentes siempre visibles |
| Una ayuda dentro del marco desplazaba el boton al tocar | Ayuda fuera del marco; se retira al completar el click, no antes del pointerup |
| El desbloqueo podia ocurrir al avanzar la primera foto | Se verifica que el contenido posterior siga oculto hasta salir de la ultima pagina de History |
| El video podia recortar personas o texto | Fotograma completo mediante contain |
| El cierre estrecho comprimia el mensaje; una altura minima aislada ensanchaba el marco | A 320 px el cierre crece verticalmente sin imponer la relacion 9:16 ni producir scroll horizontal |

## Matriz de los tres perfiles

Cada celda describe la via comprobada, no una inferencia sobre una persona real.

| Pregunta | A: experimentado | B: ocasional | C: poca experiencia |
| --- | --- | --- | --- |
| Como comenzar | Abrir carta y abrir edicion | Boton con etiqueta y foco | Boton ancho y ayuda diferida |
| Hay mas contenido | Seis barras y avance | Nombre/pagina actual | Siguiente siempre visible |
| Como avanzar | Toque, swipe, flechas | Boton Siguiente | Etiqueta y mano contextual |
| Como regresar | Swipe o flecha izquierda | Anterior | Anterior visible, sin gesto obligatorio |
| Como pausar/reanudar | Hold o espacio | Pausar / Reanudar | Etiquetas distintas de Siguiente |
| Como controlar musica | Toggle y slider | Activar / Silenciar musica | Etiquetas completas y porcentaje |
| Como reproducir videos | Autoplay muted o control | Reproducir video / Escuchar video | Boton central y guia contextual; segundo mensaje explicito |
| Como reconocer el final | Segmento 6/6 | Invitacion y compartir | Guia "Terminaste" y boton Ver la invitacion |
| Continuar sin ayuda externa | Flujo completo automatizado | Recorrido de teclado comprobado | Recorrido con botones comprobado en 320/430 px |

## History obligatorio

Por decision confirmada del usuario, tambien la agenda y la confirmacion se
desbloquean al terminar History. Las seis rutas conservan sus nombres, cupos
y quince escenas. Los enlaces y hashes directos anteriores a terminar redirigen
a la edicion con una explicacion. Cada fotografia sigue disponible para volver.
No se impone tiempo minimo ni se exige descubrir un gesto.

Esto es una condicion de navegacion en memoria, no autenticacion, proteccion
de archivos ni garantia de que alguien observo las fotos. En lectura sin JS se
presenta la secuencia completa de forma lineal y se conservan los enlaces utiles.

## Audio y compatibilidad

Un unico elemento audio en loop. Abrir la edicion solicita el audio bajo gesto;
un bloqueo del navegador deja un boton de reintento. La reproduccion se
comprueba mediante avance de currentTime; la atenuacion se mide en el GainNode
real, no solo en atributos de interfaz.

Ejemplo comprobado: volumen elegido 40%, durante video ganancia 0.008
(0.4 x 0.02), al pausar/terminar/cerrar vuelve a 0.4. No se pausa ni reinicia
la pista por entrar en un video; el silencio elegido se conserva. Al pausar el
recorrido, ocultar pestana o salir de pantalla se pausa sin perder posicion.

El WEBA recibido contiene Opus. Funciona en Edge/Chromium local. `canPlayType`
es una comprobacion inicial, no una garantia de decodificacion en todos los
telefonos; los errores reales tambien se manejan. Web Audio controla el
volumen sin depender de HTMLMediaElement.volume, limitado en algunos moviles.
Safari/iOS antiguos pueden necesitar otro contenedor/codec.

Alternativa propuesta: generar una copia MP3, nunca sobrescribir el WEBA,
y ubicarla en `public/audio/the-love-issue.mp3`. El build ya reconoce esa
alternativa. No se instalo un transcodificador ni se fabrico otra pista.
Si ambos formatos faltan o fallan, la experiencia sigue disponible con un aviso.

Fuentes: [contenedores MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers)
y [limitaciones de volume](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume).

## Accesibilidad y limites

Auditoria automatizada axe-core sobre la interfaz renderizada, ademas de
teclado, foco, movimiento reducido, texto al 200%, objetivos tactiles y
geometria de las fotografias. Una auditoria automatizada no reemplaza lector
de pantalla ni pruebas con personas.

## Resultados de validacion local

| Comprobacion | Resultado |
| --- | --- |
| Build de produccion, ESLint y TypeScript | Aprobados |
| Unidades de stories y seleccion de medios | 9/9 |
| QR, decodificacion y rutas | 7/7 |
| Smoke de exportacion estatica | 13/13 |
| Suite completa de navegador | 65 aprobadas, 1 timeout, 8 de fixtures omitidas |
| Repeticion aislada del caso con timeout, sin cambiar aserciones | 3/3 aprobadas |
| Suite separada con medios sinteticos temporales | 8/8; fixtures retirados antes del build final |
| Nuevos casos audiovisuales y usabilidad, incluidos en la suite completa | 11/11 |
| axe-core sobre el cierre renderizado | Sin infracciones en las reglas ejecutadas |
| Integridad SHA256 de originales | 51/51 sin cambios |

El timeout de la suite completa ocurrio en la apertura de Mercedes a 320 px:
el estado quedo locked y tambien expiro el cierre del contexto del navegador.
No se reprodujo en tres ejecuciones consecutivas del mismo caso. Se registra
como incidencia intermitente no diagnosticada, no como una suite completa
limpia. Las demas 65 pruebas finalizaron correctamente, incluidas todas las
fotografias, las seis rutas, el audio real, los videos, tacto y pausa.

Se revisaron capturas de portada, introduccion, fotografia, video, segundo
mensaje y cierre a 320, 430 y 1440 px. La comprobacion automatica recorre
todas las fotos asignadas a cada edicion a 320, 390, 768 y 1440 px y verifica
contain, ausencia de transformacion, visibilidad y cierre sin texto recortado.
Esto verifica la presentacion completa del encuadre, no identifica personas
automaticamente.

Pendiente en **dispositivos fisicos**:

- Safari/iOS, Chrome/Android y navegadores internos de WhatsApp.
- Escucha real de voces, volumen percibido y mezcla musical.
- Desbloqueo de AudioContext y autoplay, auriculares, bloqueo de pantalla.
- VoiceOver/TalkBack, orientacion y barras dinamicas.
- Pruebas observadas con invitados de los tres perfiles.
- Copia MP3 para versiones antiguas de Safari, si se incluyen en el soporte.

## Conservacion y publicacion

Los originales de las 45 fotos, cinco MP4 y WEBA no se renombran, recortan,
sobrescriben ni convierten. Solo las fotos tienen derivados WebP regenerables.
No se descarga anticipadamente toda la coleccion de videos; solo se monta el
actual y se libera al cambiar de mensaje. El siguiente MP4 espera a su boton.
Los cinco originales usan H.264/AAC y conservan el indice moov al final
(sin fast-start). Para mejorar el inicio en redes lentas se recomienda una
copia derivada con fast-start, sin modificar los originales; no se genero en
esta iteracion. El servidor local admite peticiones de rango para reproduccion
y busqueda sin leer cada archivo entero en memoria.

El usuario autorizo publicar esta iteracion en GitHub Pages el 2 de noviembre
de 2026. La publicacion incluye los cinco videos y el WEBA recibidos.
GitHub Pages y un repositorio publico exponen los medios por URL; los slugs
no son autenticacion.
