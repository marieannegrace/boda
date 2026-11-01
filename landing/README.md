# The Letter — V1

Evolución de la Beta aprobada, no una reconstrucción. Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, CSS Modules/variables, GSAP 3.15.0, @gsap/react 2.1.2, ScrollTrigger, Flip y Lenis únicamente en desktop.

## Ejecutar en Windows

Desde esta carpeta, con las dependencias ya instaladas:

```powershell
npm.cmd run dev
```

Abrir `http://localhost:3000/roberto`. Si el puerto está ocupado: `npm.cmd run dev -- --port 3001`. La entrega V1 se revisa en `http://127.0.0.1:3001/roberto`, sin detener procesos ajenos.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd start -- --port 3001
```

No ejecutar dev/start en el mismo puerto. `npm.cmd` evita el bloqueo de scripts de PowerShell sin modificar la política del sistema. No se reinstalaron Node, npm ni Git.

## Rutas y destinatarios reales

| Ruta | Nombre visible | Cupos |
| --- | --- | --- |
| `/roberto` | Roberto y familia | Pendiente de confirmar |
| `/mariayroberto` | María y Roberto | 2 |
| `/giovanna` | Giovanna y Noah | 2 |
| `/amparoyeduardo` | Amparo y Eduardo | 2 |
| `/mercedes` | Mercedes y familia | Pendiente de definir |
| `/florisyabsalon` | Floris, Absalon y Charlotte | 3 |

`/` y slugs desconocidos válidos usan `default`: sin video, cupos ni acceso asignados de otra familia. Rutas anidadas no soportadas devuelven 404. No se crean otras familias.

`src/data/guests.json` es la fuente: slug, name, displayName, greeting, seats, seatsPendingLabel, video, poster, captions, transcript, dimensiones y postWeddingAccess. Cupos pendientes son `null`, nunca cero ni una cifra supuesta. Agregar registros no requiere modificar componentes. La URL/QR se derivan del slug y de la configuración pública.

## Umbral de entrada

`InvitationGate.tsx` mantiene el contenido posterior con `hidden` e `inert` desde el HTML inicial, incluidos navegación y enlaces de salto. El scroll del documento está bloqueado por CSS y por estilos de body restaurables; no hay Lenis ni ScrollTriggers hasta abrir.

`LetterOpening.tsx` conserva la identidad de papel: respuesta de CTA (0,22 s), anticipación del soporte, liberación de sello de papel CSS, apertura de solapa con dos caras, extracción del interior, retirada del bolsillo, handoff de layout Flip, dos pliegues del papel y revelación del destinatario. Duración total aproximada: 3,6 s. El arte plano original no se corta ni se usa como capas falsas.

El único control inicial es **Abrir la carta**, con contraste de tinta, área táctil de 56 px y “para comenzar”. No hay loops, partículas, bounce ni glow. Durante la apertura, el mismo control permite **Continuar sin animación**; Escape completa la secuencia. El scroll se restaura únicamente tras completarla y el foco pasa al saludo personalizado.

Reduced motion: el gesto abre inmediatamente, sin pliegues/Flip. El cambio de preferencia en vivo completa una apertura en curso y elimina Lenis/revelaciones. Un viewport excepcionalmente bajo permite desplazar **solo la escena inicial** para alcanzar el control, nunca acceder al contenido bloqueado. En móvil, después de abrir, el scroll es nativo y no hay parallax.

Sin JavaScript, el mismo botón funciona como formulario GET explícito a `?open=1#saludo`: el servidor entrega el contenido abierto. No existe un preloader que requiera JavaScript para revelar HTML. Esa variante es un fallback de lectura, no autenticación. Una visita normal/refresco a `/slug` vuelve a la carta cerrada.

## Recorrido y función narrativa

| Escena | Propósito / contenido | Acción y transición | Fallback |
| --- | --- | --- | --- |
| Carta cerrada | Identificar destinatario y cupos | Abrir, sin enlaces de bypass | Formulario nativo |
| Apertura | Umbral físico de objeto a lectura | Solapa → papel → pliegues → destinatario | Inmediata con reduced motion; control para omitir animación |
| Saludo | Dedicar la carta | Foco y lectura libre | Nombre y cupos en HTML |
| Video | Mensaje personal | Reproducción explícita o continuar | Placeholder honesto si no existe |
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

**Dominio confirmado por el usuario: pendiente.** No se codifica localhost ni un dominio inventado. No hay seis QR imprimibles emitidos todavía.

1. Copiar `.env.example` a `.env.local`.
2. Completar `NEXT_PUBLIC_SITE_URL` con el origen HTTPS público real, sin rutas, query ni fragmentos.
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

La aplicación presenta el QR y descargas en “El enlace de tu carta” al cierre, solo si está configurada la URL. Endpoints individuales:

- `/{slug}/qr/svg`
- `/{slug}/qr/png`

Aceptan únicamente invitados exactos, sin fallback general. Dominio pendiente: 503 JSON explícito. Formato/slug no soportado: 404. No listan otras familias ni envían todos los QR al cliente.

La decodificación local verifica `QR → URL → slug → registro`. **La URL pública todavía no está desplegada**: faltan verificar `URL pública → invitado renderizado`, escaneo en móvil real y una prueba física al tamaño final antes de imprimir/distribuir.

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

Con la V1 sirviendo en 3001:

```powershell
$env:BETA_URL = "http://127.0.0.1:3001"
npm.cmd run test:smoke
npm.cmd run test:browser
```

Se mantienen las pruebas smoke de Beta, ampliadas para seis destinatarios/cupos, 15 escenas, bloqueo en SSR, postboda no concedida, WhatsApp, fallback sin datos de otros invitados, no-JS, facsímil y QR pendiente/404. Las pruebas QR usan un origen reservado **solo en memoria**, nunca imprimen archivos con ese origen.

Playwright usa el Microsoft Edge ya instalado, sin reinstalar navegadores. La matriz incluye seis rutas × 320/390/768/1440 px, bloqueo/CTA/nombre/cupos, duración de apertura, desbloqueo/foco, recarga, scroll nativo móvil, ausencia de MP4/errores, reduced motion inicial/en vivo, Escape/omisión, fallback sin JS, 360/430 px y paisaje bajo. No sustituye QA en teléfonos reales.

Antes de V1.1: configurar y desplegar la URL pública, emitir/verificar QR finales, confirmar cupos/accesos y datos comunes; incorporar medios y revisar iOS/Android/WhatsApp, lectores de pantalla y rendimiento real. No hay autenticación, analítica ni privacidad inventadas. Un slug, `inert` y `noindex` no protegen archivos en `public`.

## Resultado de esta entrega

- Typecheck strict, lint y build de producción aprobados.
- **13 smoke + 7 pruebas QR + 32 pruebas de navegador = 52 pruebas aprobadas**. Smoke y navegador ejecutados también contra el build de producción en 3001.
- Seis rutas y cupos correctos; apertura física medida entre 2,5 y 6,5 s en las pruebas, bloqueo/desbloqueo, foco, refresh, responsive, touch, reduced motion, fallback, video ausente y WhatsApp verificados. Sin errores JS/console en el recorrido normal ni peticiones MP4.
- Revisión visual de la entrada, despliegue del papel y saludo en 390 px. Sin parallax móvil.
- Corregidos durante la validación: import CommonJS de `@next/env` en el generador, separadores de texto SSR en assertions smoke y un favicon 404. El favicon tipográfico LM es interfaz, no extracción/redibujo del monograma del raster.
- **QR finales pendientes, no emitidos**: el usuario confirmó que la URL pública todavía no existe. El manifest queda en `pending` con seis archivos planificados. La decodificación se verificó con un origen de pruebas solo en memoria; no es una validación de escaneo físico ni del hosting público.
