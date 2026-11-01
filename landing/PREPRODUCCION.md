# Preproducción: The Letter

Luis & Marie | 1 de noviembre de 2026 | Estado: pendiente de aprobación para implementar.

Este documento define decisiones y contratos; no constituye una landing implementada. No se han creado componentes, instalado paquetes, movido assets, optimizado originales ni iniciado un servidor. La narrativa responde a descubrimiento, memoria y encuentro, no a un conflicto inventado.

## 1. Runtime y alcance

| Herramienta | Estado de partida confirmado por el usuario |
| --- | --- |
| Node.js | v26.13.0, disponible |
| npm | 11.20.0, disponible |
| Git | 2.56.0.windows.4, disponible |
| Entorno | Windows 11 Pro x64 / PowerShell |

La consulta de metadatos npm se ejecutó correctamente con Node en esta sesión. No se reinstaló ninguna herramienta. No falta instalar software del sistema para redactar la preproducción. La instalación de dependencias y la comprobación real de build/typecheck pertenecen a la fase siguiente.

Fuentes locales: [intrucciones.md](intrucciones.md), [instrucciones del agente](../.github/instructions/invitation-experience.instructions.md) e [invitación original](../Dorado%20Ilustrado%20Boda%20Invitación%20%2820.5%20x%2013%20cm%29.png). El último encargo controla el alcance: detenerse antes de construir.

## 2. Stack definitivo recomendado

Versiones consultadas en el registro oficial npm el 1 de noviembre de 2026; recomendación para la primera instalación, no paquetes ya instalados.

| Área | Decisión | Motivo |
| --- | --- | --- |
| Framework | Next.js 16.4.3, App Router, Turbopack | Una experiencia reutilizable, resolución por ruta en servidor, HTML inicial y optimización de imágenes/fuentes. |
| UI | React y React DOM 19.3.1 | Versiones estables coincidentes y aceptadas por los peers de Next.js. |
| Lenguaje | TypeScript 5.9.3, strict | Tipos y validación del contrato de invitados; evita adoptar TypeScript 7.0.2 antes de que el tooling lo soporte. |
| Estilos | CSS Modules + variables CSS compartidas | Aislamiento por escena y control de papel, tipografía y máscaras; sin framework CSS adicional. |
| Motion | GSAP 3.15.0 + @gsap/react 2.1.2 | Timelines, lifecycle y animación por acción. ScrollTrigger y Flip forman parte de GSAP, no paquetes separados. |
| Scroll | Nativo en móvil; Lenis 1.3.27 como mejora en desktop compatible | Un único sistema de smooth scrolling; sin ScrollSmoother ni scroll hijacking. |
| Routing | `/[slug]`, una página reutilizable | No seis páginas ni seis experiencias duplicadas. |
| Datos | JSON privado de invitados + JSON separado del evento | Datos editables sin nombres hardcodeados en componentes. |
| Vídeo | HTML5 nativo + descriptor de media independiente del proveedor | MP4 locales inicialmente; migración posterior a HLS/CDN mediante adaptador. |
| Assets | Masters fuera de `public`; derivados web clasificados | Preservar el material original y publicar únicamente lo necesario. |

Next.js declara Node >=20.9.0 y documenta TypeScript >=5.1.0; Node 26.13.0 y TypeScript 5.9.3 cumplen esos mínimos. @gsap/react declara GSAP ^3.12.5 y React >=17. El parser @typescript-eslint/parser 8.72.1 consultado admite TypeScript >=4.8.4 y <6.1.0, de ahí la exclusión de TypeScript 7. La compatibilidad aquí es documental; no se afirma que una aplicación inexistente haya compilado.

No habilitar React Compiler, Cache Components experimentales, PWA, servicio de analítica, autenticación compleja ni View Transitions por defecto. Las API experimentales de React no se convierten en requisito. Usar documentación correspondiente a la versión instalada, no canary.

## 3. Dependencias y herramientas previstas

**Runtime de la aplicación:** next 16.4.3, react 19.3.1, react-dom 19.3.1, gsap 3.15.0, @gsap/react 2.1.2 y lenis 1.3.27. Lenis se importa únicamente donde se activa la mejora de desktop.

**Desarrollo:** typescript 5.9.3, @types/node 26.6.6, @types/react 19.3.0 y @types/react-dom 19.3.0. Para lint, **eslint 9.39.5 + eslint-config-next 16.4.3**. No adoptar ESLint 10.14.0: eslint-plugin-react 7.37.5, eslint-plugin-import 2.32.0 y eslint-plugin-jsx-a11y 6.10.2 consultados admiten ESLint 9 pero no declaran ESLint 10. Los peers de hooks y typescript-eslint también aceptan 9.39.5. No resolver conflictos con `--force` o `--legacy-peer-deps`.

En la siguiente fase, crear el lockfile con npm y fijar las versiones realmente verificadas. Gates separados: typecheck, ESLint y build, porque Next.js 16 no ejecuta el linter dentro de `next build`. Playwright/axe se añadirán solo al preparar las pruebas que los necesiten; no instalar una suite completa ahora.

No hacen falta Tailwind, Sass, una librería de componentes, Zustand/Redux, Framer Motion, Three.js, un SDK de vídeo ni una base de datos para seis configuraciones. Iconos: un conjunto pequeño de una biblioteca mantenida si los controles futuros lo justifican, no SVG decorativos inventados. Procesamiento de assets: herramientas puntuales, sin añadirlas al bundle.

## 4. Auditoría de assets disponibles

Se enumeraron recursivamente los archivos del proyecto. La documentación de `.github/skills`, sus muestras y las tareas de VS Code son herramientas del agente, no material visual de la boda. Las categorías siguientes son una clasificación lógica: no se han creado carpetas ni trasladado archivos.

| Categoría | Archivos reales de la boda | Estado |
| --- | --- | --- |
| `/images` | Ninguna fotografía independiente | Faltan recuerdos 2008/2022/2026 y fotografías de Puerto Velero. |
| `/videos` | Ninguno | Los seis mensajes personalizados todavía no están en la carpeta. |
| `/fonts` | Ningún archivo de fuente | Los nombres exactos de las tipografías del raster no se pueden certificar. |
| `/logos` | Ninguno independiente | El monograma L & M está integrado en la invitación. |
| `/invitation` | PNG original y PDF de impresión | Único asset visual propio disponible y un derivado de preprensa. |
| `/backgrounds` | Ninguno independiente | El fondo del PNG es blanco; no se suministró textura de papel/lino. |
| `/flowers` | Ninguno independiente | Flores, hojas, palmas y espigas son píxeles integrados, no capas. |
| `/other` | Brief, informe de impresión y script de preprensa | Documentos de apoyo; no se sirven como contenido web. |

### Imagen A01: invitación original

- Archivo: [Dorado Ilustrado Boda Invitación (20.5 x 13 cm).png](../Dorado%20Ilustrado%20Boda%20Invitación%20%2820.5%20x%2013%20cm%29.png).
- Representa: invitación de Luis y Marie, 07 diciembre, 15:45 horas, Puerto Velero, Atlántico; monograma botánico y QR.
- Resolución medida: **6250 x 3963 px**, RGB de 24 bits, **8 776 126 bytes / 8,37 MiB**. No se detectó perfil ICC mediante System.Drawing; esa comprobación no es una certificación de color de imprenta.
- Orientación del archivo: horizontal; el texto está girado 90 grados. Proporción ancho/alto: **1,577088**. Al orientar una copia de visualización para lectura: **3963 x 6250 px**, ancho/alto **0,63408**, equivalente aproximado a 13 x 20,5 cm.
- DPI declarado por System.Drawing: aproximadamente 773,99; para web importan píxeles y tamaño mostrado, no cambiar una etiqueta DPI a 300.
- Uso: referencia principal y facsímil de escena 09; antecedente de las escenas 01/02/15. No es una textura repetible, una foto ni una colección de flores separables automáticamente.
- Optimización necesaria: sí, derivados responsive manteniendo color y legibilidad de texto/QR; no descargar 8,37 MiB al entrar.
- Mobile: sí, facsímil completo en orientación legible y opción de ampliarlo. Desktop: sí, con más espacio alrededor, sin estirarlo ni convertirlo en fondo recortado.
- No se modifica el master. Una rotación exacta de una copia de visualización corrige la lectura siguiendo el brief web; no cambia ilustraciones, textos o composición. El PDF de impresión conserva su orientación anterior.

### Documento A02: PDF de impresión

[Invitacion_2_copias_CARTA_SIN_SANGRADO.pdf](../Invitacion_2_copias_CARTA_SIN_SANGRADO.pdf): **13 553 848 bytes / 12,93 MiB**. Derivado para imprimir dos copias en carta, no una imagen optimizada para la web. No cargarlo, renderizarlo como hero ni ofrecerlo como descarga predeterminada; además incluye marcas de corte y no tiene sangrado real.

### Auditoría de vídeo y fuentes

No hay vídeo que permita medir duración, contenedor/codecs, resolución, orientación, bitrate, tamaño o necesidades reales de compresión. No se asignan valores inventados. Al recibir cada uno se registrarán: slug propietario, nombre de archivo, duración, codec de imagen/audio, dimensiones, orientación/display rotation, bytes, bitrate, audio, captions y checksum. Se decidirán el poster y los derivados por vídeo, no con una orientación fija global.

Los WOFF2/TTF/OTF, fotografías, posters, VTT y capas botánicas están ausentes. Tampoco hay editable PSD/AI/SVG/PDF por capas. Sin él, no se promete parallax independiente de los pétalos ni eliminación limpia de textos. No se obtendrán imágenes de stock para llenar esos huecos.

## 5. Análisis visual de la invitación

**Composición:** cuatro esquinas botánicas equilibran una columna central de información; al orientar la lectura, el monograma abre la pieza, siguen el saludo y la categoría, los nombres ocupan el centro y fecha/hora/lugar conducen al QR. Es una composición axial, no una cuadrícula de tarjetas.

**Proporciones:** facsímil vertical aproximado 13:20,5. Mantener esa proporción solo para la pieza física; el sitio no debe convertirse en una sucesión de pantallas rígidas de ese formato. El ritmo web adapta el espacio negativo a contenido, viewport y lectura.

**Paleta observada:** papel blanco, tinta cobriza oscura, palmas champagne, hojas desaturadas, flores melocotón y amarillo suave. Un muestreo uniforme de píxeles cada 64 px encontró blanco `#FFFFFF` como color más repetido y `#995110` como tinta frecuente. No es una extracción completa de todos los colores ni identifica una tinta Pantone.

**Ornamentación e ilustración:** contornos finos taupe, rellenos suaves con apariencia de acuarela, abanicos/palmas secos, flores redondeadas, hojas ovaladas y espigas; lenguaje artesanal/vintage boho. La textura percibida de los dibujos no demuestra que exista una fotografía de papel. El centro incluye un motivo muy tenue que no debe intensificarse como marca de agua dominante.

**Tipografía:** serif romana de contraste marcado en etiquetas/fecha, caligrafía de trazos contrastados en los nombres y monograma. El archivo aplanado no permite identificar las familias exactas; cualquier familia propuesta para HTML es una elección compatible, no la fuente original certificada.

**Jerarquía y negativo:** nombres primero; fecha y hora después; textos introductorios y ubicación secundarios. El blanco central es parte del diseño. No llenar ese espacio con partículas, flores nuevas, banners o copy de marketing.

**Traslado digital:** conservar el facsímil intacto; traducir jerarquía, márgenes, línea fina y contraste material al HTML. No reescribir el texto de la imagen, recolorearla, recrear su QR o dibujar flores nuevas. La fotografía de un recuerdo debe aparecer porque existe ese recuerdo y la imagen se suministró, no como decoración.

## 6. Design system

### Color y roles

| Token | Valor | Uso propuesto |
| --- | --- | --- |
| Ivory | `#F7F3EA` | Fondo del entorno de carta, no sustitución del blanco del PNG. |
| Champagne | `#E7D7B8` | Superficie secundaria y detalles de papel, con moderación. |
| Antique Gold | `#A8661A` | Líneas e indicadores suficientemente grandes, no texto pequeño sobre ivory. |
| Sage | `#A9B09C` | Acento botánico/superficie, nunca texto principal claro. |
| Muted Olive | `#747A62` | Ornamento y algunos indicadores; no texto pequeño sobre ivory. |
| Warm Taupe | `#B8A58D` | Detalle material suave, no borde único de un control importante. |
| Charcoal | `#302C27` | Cuerpo, información de evento, controles, foco y estados de error. |
| Original Ink | `#995110` | Acento de tinta opcional para HTML; valor muestreado, sin alterar el original. |
| Original Paper | `#FFFFFF` | Fondo propio de la imagen y área neutra para integrarla sin halos. |

Contraste calculado en sRGB sobre Ivory: Charcoal **12,51:1**, Original Ink **5,36:1**, Antique Gold **4,14:1**, Muted Olive **4,03:1**, Sage **2,02:1**, Warm Taupe **2,15:1**. Usar Charcoal/Original Ink para texto normal. El dorado no alcanza 4,5:1 en ese par; reservarlo para texto grande que cumpla 3:1 o decoración. Texto grande WCAG: 18 pt/24 CSS px regular o 14 pt/aproximadamente 18,67 CSS px en negrita. Revalidar cada par efectivo, especialmente controles y foco, no solo el color aislado.

Evitar dominante monocromática beige/dorada: el blanco físico, charcoal y la botánica desaturada sostienen el contraste; distribuir champagne como acento, no como color de todas las secciones. Sin dorado metálico, filtros sepia, neón ni gradientes modernos.

### Tipografía

| Rol | Propuesta | Tratamiento |
| --- | --- | --- |
| Display serif | Cormorant Garamond, 400/500 | Nombres HTML, títulos y años; contraste editorial, sin pesos demasiado finos. |
| Body | Source Serif 4, 400/600 | Lectura y datos prácticos con mayor robustez a tamaños pequeños. |
| Accent/script | Caligrafía original del facsímil/monograma | No añadir una tercera fuente por imitación. Si se entrega la fuente original y su licencia, reservarla a firmas breves. |

Dos familias web como máximo; los trazos originales siguen siendo raster, no una fuente nueva. Ambas candidatas constan en Google Fonts con licencia OFL; aún no se descargaron. Alojar WOFF2 localmente con licencia, usando next/font/local cuando existan los archivos. Georgia es solo fallback funcional durante carga, no la dirección tipográfica final.

Escala propuesta, tamaños en rem sin dependencia de `vw`: body 1,0625 rem, secundario 0,9375 rem, heading 1,75 rem móvil / 2,5 rem desktop, display 2,5 / 3,5 rem, años 3,5 / 5 rem. Body line-height 1,65; display 1,1-1,2. Limitar texto a 55-65 caracteres por línea, permitir reflow al 200-400% y nombres largos. Letter-spacing 0; no espaciado negativo. Los saltos responden al contenido, no a una composición que corte palabras.

### Espacio, superficies y controles

- Escala base: 4, 8, 12, 16, 24, 32, 48, 64 y 96 px, expresados en rem en implementación.
- Móvil: gutters 20 px, 16 px en ancho 320; lectura de una columna. Desktop: contenedor editorial máximo 1120 px; texto máximo 640 px.
- Papel físico: radio 0-2 px y sombra leve solo si explica su profundidad; secciones sin cajas flotantes y sin tarjetas anidadas.
- Botones: altura mínima 48 px, ancho estable, foco de 2 px con offset 3 px; hover, focus, pressed, loading y disabled explícitos. Usar texto para comandos claros y controles nativos/iconos accesibles para herramientas.
- Medios: aspect-ratio real, dimensiones reservadas y object-fit contain cuando un recorte dañaría contenido. Cero salto de layout al aparecer controles o cambiar el destinatario.
- Estados: mensaje preciso de error y recuperación, visible además de anunciado. No esconder fallos para conservar una estética limpia.

## 7. Storyboard completo: 15 escenas

Los números son de producción, no etiquetas decorativas obligatorias en pantalla. Las duraciones son de transición, no tiempos mínimos de lectura; nadie debe esperar una animación para acceder a la información. Escenas 01-04 se activan por acciones; 05-15 siguen scroll libre. Cualquier asset pendiente queda señalado, no reemplazado.

### 01. Carta cerrada
- Objetivo: establecer que la carta tiene un destinatario antes de mostrar el mensaje.
- Contenido: Luis & Marie, 07 diciembre 2026, destinatario desde displayName y acción Abrir carta; copy del brief, no nuevos invitados.
- Imagen principal: identidad de A01; un frente separado sin datos interiores requiere exportación original. Hasta entonces, apertura visual del papel sin fingir que existe ese archivo.
- Entrada: papel estable visible desde HTML; asentamiento corto tras hidratación si hay motion.
- Salida: acción Abrir carta inicia exclusivamente la escena 02.
- Interacción: click/tap/Enter/Space; acceso alternativo a detalles sin apertura.
- Animación: profundidad mínima y tinta legible; no respiración en bucle ni preloader obligatorio.
- Duración: entrada 0,5-0,7 s; espera ilimitada controlada por el visitante.
- Mobile: carta centrada, ancho máximo de viewport menos gutters, CTA visible debajo sin forzar altura fija.
- Desktop: pieza central de ancho contenido y más negativo alrededor, sin layout marketing dividido.

### 02. Apertura
- Objetivo: convertir un objeto cerrado en una lectura personal, referencia de todo el motion.
- Contenido: el mismo papel cambia de estado; no añade palabras durante el pliegue.
- Imagen principal: pieza/capas originales si se suministran; con el raster actual, transformaciones del soporte externo sin cortar ni reconstruir ilustraciones.
- Entrada: gesto explícito de apertura; estado opening, bloqueo de doble activación solo de ese botón.
- Salida: papel asentado, estado opened y foco en el saludo; navegación disponible sin más espera.
- Interacción: abrir una vez por visita; saltar la secuencia si se solicita, nunca drag obligatorio.
- Animación: timeline de liberación 0,2 s, pliegue 0,9 s, asentamiento 0,4 s y descubrimiento del saludo 0,3 s, con pequeños solapamientos. Flip solo para handoff de layout, no para simular la física del pliegue.
- Duración: aproximadamente 1,6-1,8 s completa; reduced motion 0-0,15 s.
- Mobile: profundidad muy leve, sin giros fuera del viewport ni scroll retenido; sombra sobria.
- Desktop: profundidad un poco mayor, misma dirección y duración; sin teatralidad adicional.

### 03. Saludo personalizado
- Objetivo: explicar por qué ese invitado está leyendo la carta.
- Contenido: displayName o saludo aprobado; frases del brief sobre personas que forman parte de la vida y Por eso esta carta es para ustedes.
- Imagen principal: ninguna nueva; la identidad botánica acompaña solo si existe exportación sin texto.
- Entrada: foco en el heading; aparición de bloque después del papel asentado.
- Salida: continuidad vertical hacia el marco de vídeo, sin desaparición obligatoria del saludo.
- Interacción: lectura libre y opción de continuar; nombre no interpolado en una fórmula gramatical incorrecta.
- Animación: tinta por bloques o líneas, sin efecto máquina de escribir ni caracteres rebotando.
- Duración: reveal 0,7-0,85 s; lectura libre.
- Mobile: nombre largo puede ocupar varias líneas; cuerpo 17 px y columna única.
- Desktop: columna literaria de 55-65 caracteres, misma prioridad del nombre.

### 04. Vídeo personalizado
- Objetivo: escuchar un mensaje realmente preparado para el destinatario.
- Contenido: Antes de continuar, queremos decirte algo personalmente; Ver nuestro mensaje, controles y Continuar sin vídeo; Gracias por escucharnos al terminar.
- Imagen principal: poster del vídeo del invitado actual, pendiente. No un poster de otra familia ni una foto de stock.
- Entrada: transición del papel al espacio de media con proporción reservada; no petición del MP4 por el mero reveal.
- Salida: scroll manual hacia Nuestra historia, tanto al terminar como al saltar; no auto-scroll ni avance obligatorio.
- Interacción: reproducir, pausar, buscar, volumen, captions y fullscreen cuando disponible; reintentar y continuar ante error.
- Animación: reveal corto del marco; vídeo/controles permanecen estables mientras se reproduce.
- Duración: reveal 0,65-0,8 s; duración de vídeo desconocida hasta recibirlo.
- Mobile: playsInline, controles táctiles, orientación real del archivo y sin recortes de personas.
- Desktop: ancho suficiente para el mensaje, sin autoplay ni embellecimiento que reduzca legibilidad.

### 05. Nuestra historia
- Objetivo: pasar del saludo privado a la memoria común de la pareja.
- Contenido: título Nuestra historia e introducción suministrada sobre compartir una vida; no citas ni biografía añadida.
- Imagen principal: ninguna disponible; la tipografía sostiene esta pausa.
- Entrada: aparición breve del título después del espacio de vídeo.
- Salida: continuidad de lectura hacia 2008, sin pantalla negra intermedia.
- Interacción: scroll nativo y acceso a datos prácticos por enlace de salto.
- Animación: cambio de ritmo mediante espacio y una transición de tinta, no otra apertura.
- Duración: 0,7 s de entrada; lectura libre.
- Mobile: título y párrafo apilados, sin imagen ficticia ocupando pantalla.
- Desktop: más negativo lateral, sin convertir una frase en un hero desproporcionado.

### 06. 2008
- Objetivo: situar el comienzo real de la historia.
- Contenido: 2008 y el texto suministrado Nuestra historia comenzó en 2008, cuando decidimos emprender juntos este increíble viaje llamado vida.
- Imagen principal: fotografía propia de 2008, pendiente; si no se entrega, capítulo tipográfico completo.
- Entrada: año primero, texto inmediatamente después.
- Salida: siguiente capítulo entra con un relevo editorial, el contenido anterior queda disponible al volver.
- Interacción: leer/scroll; ampliar foto solo si existe y aporta detalle.
- Animación: reveal del año y eventual foto; parallax no se aplica a texto ni al raster completo de A01.
- Duración: 0,85 s de entrada y 0,35-0,45 s de relevo; lectura libre.
- Mobile: año, texto y foto en orden lógico, sin pinning.
- Desktop: composición de recuerdo con foto real si existe, no timeline de círculos; pinning no necesario.

### 07. 2022
- Objetivo: distinguir la boda civil del inicio de la relación y de la religiosa.
- Contenido: 2022 y el texto aprobado sobre sellar el compromiso con la boda civil.
- Imagen principal: fotografía/documento de boda civil, pendiente; no usar una imagen de la futura ceremonia.
- Entrada: relevo de página consistente con 2008, no efecto distinto.
- Salida: línea de lectura hacia 2026, sin forzar una transición dramática.
- Interacción: lectura y scroll; foto ampliable si se entrega.
- Animación: máscara breve de foto y reveal del título por bloque.
- Duración: entrada 0,85-1 s; relevo 0,4 s; lectura libre.
- Mobile: media debajo del texto o antes según su significado, conservando orden DOM congruente.
- Desktop: mismo vocabulario tipográfico, variación espacial moderada entre recuerdo y texto.

### 08. 2026
- Objetivo: culminar la cronología en el motivo de la invitación religiosa.
- Contenido: 2026, texto suministrado sobre boda religiosa, Luis & Marie y 07 diciembre 2026.
- Imagen principal: fotografía actual propia, pendiente; identidad original de A01 como referencia, no foto generada.
- Entrada: año seguido del motivo y nombres, con un único crescendo sobrio.
- Salida: el espacio se abre al facsímil de la invitación.
- Interacción: continuar hacia la invitación o volver a los capítulos.
- Animación: reveal 1 s, desplazamiento corto y asentamiento; sin zoom que tape el texto.
- Duración: 1-1,1 s de entrada; lectura libre.
- Mobile: titulares que envuelven naturalmente; información esencial visible aunque no haya fotografía.
- Desktop: contraste de escala algo mayor, no una segunda animación de carta.

### 09. La invitación
- Objetivo: presentar la pieza física como culminación del recorrido, no como anuncio inicial.
- Contenido: Queremos vivir este capítulo con ustedes; fecha, Puerto Velero, Atlántico y horario distinguiendo llegada/ceremonia según confirmación.
- Imagen principal: A01 completo, copia orientada para lectura y optimizada; no recolorear ni sustituir su texto.
- Entrada: reveal del contenedor, sin máscara que deje contenido importante recortado al final.
- Salida: continuidad hacia la agenda de ceremonia; el facsímil permanece accesible.
- Interacción: ampliar la invitación; datos también en HTML, QR nunca único camino a una acción.
- Animación: imagen de escala 0,985 a 1 y opacity; sin distorsión ni parallax interno fingido.
- Duración: 0,85-1 s; lectura/ampliación libre.
- Mobile: facsímil contenido por ancho, texto HTML legible y ampliación reversible con foco correcto.
- Desktop: proporción vertical intacta con espacio exterior blanco compatible con el original.

### 10. Ceremonia
- Objetivo: transformar la emoción en información de llegada y agenda utilizable.
- Contenido: Puerto Velero, Atlántico; 15:45 llegada, 16:00 ceremonia, 16:40 fotos/cóctel, 19:00 velitas, 20:00 recepción; final pendiente de confirmar AM/PM.
- Imagen principal: ninguna necesaria; no fotografías para representar horarios.
- Entrada: agenda disponible como bloque; reveal opcional no condiciona el acceso a los datos.
- Salida: cambio de sección hacia dress code sin desvanecer la agenda al consultar.
- Interacción: leer, seleccionar texto y usar ubicación/confirmación; no carrusel ni acordeón necesario.
- Animación: entrada conjunta 0,5 s o estática; no stagger de cada hora que retrase encontrarla.
- Duración: 0-0,5 s; consulta libre.
- Mobile: lista semántica vertical con hora y descripción que envuelven sin columnas apretadas.
- Desktop: agenda editorial alineada, no seis tarjetas flotantes.

### 11. Dress code
- Objetivo: aclarar cómo asistir cómodamente y compartir la intención de blanco playero.
- Contenido: Blanco playero y texto del brief sobre lino/telas frescas y comodidad junto al mar.
- Imagen principal: textura de lino o foto propia de vestimenta, pendiente; no collage de moda ajeno.
- Entrada: pausa visual blanca, título y texto.
- Salida: continuidad hacia el lugar, sin pétalos animados de transición.
- Interacción: lectura; ningún hover necesario para comprender el código.
- Animación: transición de tinta/superficie corta; sin ornamentos flotantes.
- Duración: 0,65-0,8 s; lectura libre.
- Mobile: una columna de explicación completa; mantener contraste incluso sobre textura futura.
- Desktop: misma composición con amplitud, no simular un catálogo comercial.

### 12. Puerto Velero
- Objetivo: conectar el encuentro con un lugar real y facilitar la llegada.
- Contenido: Puerto Velero, Atlántico, Colombia; Ver ubicación con enlace exacto pendiente.
- Imagen principal: fotografía propia del lugar, pendiente; mientras falta, texto y enlace, no mar de stock.
- Entrada: papel a paisaje únicamente cuando se suministre la foto.
- Salida: regreso al papel antes del capítulo del día siguiente.
- Interacción: abrir mapa externo, sin iframe pesado ni geolocalización requerida.
- Animación: máscara de foto 0,9-1,1 s; parallax decorativo limitado en desktop, si no recorta zonas importantes.
- Duración: reveal 1 s; consulta libre.
- Mobile: foto responsive sin texto sobre zonas complejas; acción de mapa grande y visible.
- Desktop: paisaje más amplio si su resolución/orientación lo permite, texto en área de contraste verificada.

### 13. 8 de diciembre
- Objetivo: distinguir la postboda privada de la ceremonia principal del día 7.
- Contenido: La mañana después, 08 diciembre 2026; 08:00 desayuno, 08:45 foto familiar, 08:55 recreación, 11:00 final; solo padres y hermanos.
- Imagen principal: imagen propia de piscina/familia, pendiente; no exponer una fotografía privada a otros slugs.
- Entrada: nuevo capítulo de papel con fecha inequívoca, sin parecer cambio de fecha de boda.
- Salida: continuidad hacia confirmación.
- Interacción: lectura para invitados autorizados; la política de privacidad decide autorización real, no un mero booleano visual.
- Animación: entrada 0,7 s; agenda estática.
- Duración: 0,7 s y lectura libre.
- Mobile: capítulo compacto de una columna; para no elegibles, se omiten sus datos antes de enviar HTML/props.
- Desktop: misma restricción y jerarquía. Es una escena canónica del storyboard, no obliga a mostrar 15 escenas idénticas a todas las familias.

### 14. Confirmación
- Objetivo: permitir una respuesta clara y sencilla.
- Contenido: ¿Nos acompañas?, texto del brief, Confirmar cupo y contacto 305-295-1053; email de apoyo ADMIN@METAMAGAGENCY.COM cuando corresponda.
- Imagen principal: ninguna; la acción tiene prioridad sobre la ornamentación.
- Entrada: bloque de acción inmediatamente disponible, sin esperar todos los reveals anteriores.
- Salida: WhatsApp externo al activar; si se vuelve, el contenido no se reinicia innecesariamente.
- Interacción: WhatsApp con mensaje generado desde displayName y fecha; teléfono seleccionable y alternativa mailto. No marcar confirmado solo por abrir WhatsApp.
- Animación: focus/pressed y reveal 0,3-0,45 s opcional, sin botón magnético.
- Duración: estados cortos 0,18-0,3 s; decisión libre.
- Mobile: botón 48 px o mayor, retorno desde WhatsApp previsible y sin pedir nombre ya conocido.
- Desktop: botón/contacto accesibles con teclado; no abrir un formulario largo.

### 15. Cierre
- Objetivo: devolver al visitante al lenguaje de la carta y cerrar con permanencia, no con espectáculo.
- Contenido: Luis & Marie, 07 diciembre 2026, Puerto Velero; Algunas fechas pasan. Algunas permanecen.
- Imagen principal: identidad original/monograma si se entrega separado; el facsímil disponible sigue accesible en escena 09.
- Entrada: pausa de espacio negativo y tinta final.
- Salida: ninguna obligatoria; la página queda disponible para volver a información o confirmar.
- Interacción: Volver a los detalles y confirmar sin reiniciar la carta; no exhortar a compartir vídeos privados.
- Animación: cierre de tinta 0,85 s, sin pliegue que oculte información ni loop floral.
- Duración: 0,85-1 s; permanencia libre.
- Mobile: cierre breve con enlaces accesibles; no pantalla vacía de altura arbitraria.
- Desktop: espacio exterior más generoso, misma tranquilidad y retorno funcional.

## 8. Motion system coherente

Regla: Every animation must have a narrative reason. El gesto principal es abrir un papel; las demás transiciones heredan dirección, desaceleración y escala, no repiten la apertura.

| Token / técnica | Valor inicial | Aplicación |
| --- | --- | --- |
| Easing principal | `power3.out` | Descubrimiento de tinta, imagen y asentamiento. |
| Easing de cambio físico | `power2.inOut` | Apertura/relevo de layout; sin bounce ni elastic. |
| Easing scroll-linked | `none` | Solo parallax ligado al scroll; nada de snap obligatorio. |
| Duración corta | 0,22 s, rango 0,18-0,3 | Focus/pressed y feedback. |
| Duración media | 0,7 s, rango 0,55-0,85 | Reveal de bloque. |
| Duración larga | 1,05 s, rango 0,9-1,2 | Revelación de recuerdo y paisaje. |
| Apertura principal | 1,6-1,8 s total | Gesto único por interacción, interrumpible. |
| Reveal | y 12-20 px a 0 + opacity | Bloques con propósito, no todas las secciones automáticamente. |
| Fade | opacity 0 a 1, 0,35-0,5 s | Handoffs; no transmite información por sí solo. |
| Scale | 0,985 a 1; máximo 1,025 en media | Solo piezas visuales, nunca texto práctico o personas recortadas. |
| Parallax | 0 px móvil; máximo 12-24 px desktop | Capas decorativas reales, no el texto ni flores inseparables del raster. |
| Mask | inset/overflow del contenedor, 0,9 s | Recuerdo/foto real; probar coste y no dejar contenido cortado. |
| Page transition | 0,35-0,5 s | Relevo entre capítulos, no nueva ruta por cada escena. |
| Text reveal | Bloques/líneas, 0,7 s, stagger máximo 0,06 s | Sin chars para todo el texto; semántica y accesibilidad intactas. |
| Image reveal | Mask o opacity + scale, 0,9-1 s | Una técnica dominante por imagen. |

El pliegue del soporte puede atravesar ángulos mayores por su mecánica, pero no rota toda la página ni deforma el arte; la profundidad se conserva contenida. No se promete plegar capas internas inexistentes del PNG. Empezar por la versión estática y probar la apertura antes de propagar el motion al resto.

GSAP se inicia en lifecycle de cliente con refs y useGSAP scoped. Capturar el estado Flip antes del cambio React y medir el layout después del commit; no hacer lecturas/ escrituras por frame. Cada escena limpia únicamente sus animaciones y triggers. Lenis tiene un único owner, un callback ticker con referencia conservada, cleanup de listeners y destroy; sincronizar ScrollTrigger y refrescar después de layout/medios/fuentes. No hay estado React actualizado a 60 Hz.

Reduced motion: transición inmediata o fade <=0,15 s; quitar pliegues, translate, scale, parallax, pinning y Lenis. Una preferencia que cambie en vivo revierte el sistema sin devolver a la persona al inicio. CSS no detiene por sí solo los timelines JS. View Transition API queda fuera del baseline; solo se estudiará para navegación real si aporta continuidad y funciona con la versión/browser, sin duplicar GSAP.

## 9. Arquitectura de rutas y responsabilidades

Contrato: **URL -> slug -> guest.json privado -> guest object validado -> experiencia personalizada**.

Estructura futura propuesta, todavía no creada:

```text
landing/
  src/app/layout.tsx
  src/app/page.tsx                 entrada general usando default
  src/app/[slug]/page.tsx          resolución servidor de un invitado
  src/app/[slug]/loading.tsx       fallback breve, sin falso progreso
  src/app/error.tsx                recuperación ante fallo de aplicación
  src/app/not-found.tsx            rutas de forma no soportada
  src/data/guests.json             privado, no dentro de public
  src/data/event.json              contenido común y datos confirmados
  src/lib/guests.server.ts         resolución/validación server-only
  src/lib/media.server.ts          selección de descriptor/proveedor
  src/components/experience/       composición del recorrido
  src/components/scenes/           unidades de contenido
  src/components/media/            controles y estados HTML5
  src/animations/                 tokens y lifecycle scoped
  src/styles/                     tokens, base, CSS Modules
  assets/masters/                 material fuente, fuera de public
  public/invitation/              derivados públicos del facsímil
  public/images/                  fotografías publicables optimizadas
  public/videos/                  MP4 publicables, si se acepta acceso por URL
  public/fonts/                   solo fuentes con licencia
```

Una ruta de un segmento corresponde a un slug validado; `params` es asíncrono en Next.js y se resuelve en servidor. No usar rutas catch-all para nombres de invitados ni convertir un slug en una ruta de archivo sin allowlist.

El brief existente aprueba un registro `default` para slugs desconocidos: mantener esa experiencia general **sin vídeo de otra familia, sin postboda privada y sin inventar destinatarios**. `/` usa el mismo default. Rutas de varios segmentos o formatos maliciosos no necesitan ese fallback y pueden ser 404. Los ejemplos Roberto/Carlos/Ana no certifican los seis destinatarios reales.

Composición servidor para historia y evento; pequeñas islas cliente para apertura, ampliación, vídeo y motion. Props limitadas al invitado seleccionado. Sin estado global salvo que una dependencia real entre escenas lo justifique; no generalizar la página a un motor arbitrario de 15 pasos.

Para la primera versión, resolver la selección en servidor por solicitud, sin activar cache compartida de respuestas personalizadas ni export estático hasta decidir privacidad. Cachear únicamente assets públicos comunes. Nunca persistir un mutable currentGuest global. Metadata WhatsApp con título/preview común, sin nombres ni fotogramas privados; no listar slugs en sitemap ni enlaces de navegación. `noindex` reduce indexación, **no es seguridad**.

## 10. Arquitectura JSON de invitados

`guests.json` privado, indexado por slug ASCII en minúsculas. A continuación hay **un ejemplo de contrato**, no datos operativos ni archivos creados. Valores null señalan ausencia; no se inventan URLs de posters o duraciones.

```json
{
  "schemaVersion": 1,
  "guests": {
    "roberto": {
      "name": "Roberto",
      "displayName": "Roberto y familia",
      "greeting": "Para Roberto y familia",
      "video": "/videos/roberto.mp4",
      "media": {
        "provider": "local",
        "poster": null,
        "width": null,
        "height": null,
        "durationSeconds": null,
        "captions": null,
        "transcript": null
      },
      "postWeddingEligible": false
    },
    "default": {
      "name": "familia",
      "displayName": "familia",
      "greeting": "Esta carta es para ustedes",
      "video": null,
      "media": null,
      "postWeddingEligible": false
    }
  }
}
```

Contrato de validación: objeto con schemaVersion admitido, campos requeridos no vacíos, longitudes razonables, slugs únicos de una allowlist, booleanos estrictos, dimensiones/duración positivas si existen y media opcional coherente. `video` admite únicamente un archivo aprobado bajo `/videos/` o una URL HTTPS de proveedor autorizado; rechazar traversal, esquemas extraños y HTML arbitrario. Renderizar nombres como texto, no HTML.

`media.provider` discrimina local / cdn / hls; el último puede añadir playbackId o manifest según adaptador elegido. Una configuración migrada no tiene dos URLs competidoras; `video` representa la fuente activa para proveedores basados en URL. Tokens firmados se generan en servidor cuando hagan falta, nunca se almacenan en JSON público. No imponer Mux ni su formato en todos los registros.

`event.json` mantiene nombres de pareja, fecha ISO `2026-12-07`, timezone `America/Bogota`, agenda, dress code, confirmación, email y datos de postboda; separarlo evita duplicar la misma agenda seis veces. Números de plaza/contactos o elegibilidad no se inventan. La elegibilidad no autentica: debe combinarse con la política real de acceso si existe confidencialidad.

## 11. Arquitectura de los seis vídeos

Se necesitan seis asociaciones invitado -> vídeo, no seis players montados. Estado actual: **0/6 archivos recibidos**.

| Slot de producción | Ruta/fuente propuesta | Estado |
| --- | --- | --- |
| 1, ejemplo Roberto | `/roberto` -> `/videos/roberto.mp4` | Ejemplo del brief; identidad final y archivo pendientes. |
| 2, ejemplo Carlos | `/carlos` -> `/videos/carlos.mp4` | Ejemplo del brief; identidad final y archivo pendientes. |
| 3, ejemplo Ana | `/ana` -> `/videos/ana.mp4` | Ejemplo del brief; identidad final y archivo pendientes. |
| 4 | slug/fuente sin asignar | No inventar nombre ni reutilizar otro mensaje. |
| 5 | slug/fuente sin asignar | No inventar nombre ni reutilizar otro mensaje. |
| 6 | slug/fuente sin asignar | No inventar nombre ni reutilizar otro mensaje. |

### Ciclo de vida y carga

1. Servidor selecciona solo el descriptor del invitado actual. No envía todos los registros al cliente ni prefetch de slugs de otras familias.
2. HTML muestra un poster si existe y reserva la proporción. Si no hay poster, usar superficie neutra y texto/acción, no pedir el MP4 para obtener una miniatura.
3. Baseline `preload="none"`, sin autoplay. Al acercarse la escena se puede cargar su UI ligera/poster; no todos los vídeos ni metadata por defecto. `preload` es una sugerencia del navegador, por lo que la garantía fuerte exige no adjuntar src/source antes de la acción.
4. Tap/click Ver nuestro mensaje adjunta la fuente y solicita `play()` desde la interacción. Manejar rechazo/autoplay policy: conservar control de reproducción, nunca falsificar un estado playing.
5. Estados: poster/idle -> loading -> playing/paused -> ended; desde cualquier carga a error -> retry o continuar. No deshabilitar la historia mientras buffering.
6. Al cambiar slug/desmontar, pausar, limpiar listeners y liberar la fuente anterior; no conservar audio oculto ni reanudar automáticamente el mensaje de otra familia.

### Reproducción y accesibilidad

HTML5 `<video>` con controls y playsInline; nativos en el primer incremento para fiabilidad de teclado/iOS. Fullscreen sujeto a API disponible, controles de volumen según restricciones iOS, orientación real, sin overlay fijo sobre caras. No asociar el mensaje hablado al scroll-scrubbing. Captions `.vtt` en español si existen y transcripción revisada; sin ellos se documenta la carencia y no se declara vídeo accesible por tener solo un botón CC.

Si falta `video`: estado de ausencia con Continuar sin vídeo y contacto, sin intentar una URL inventada. Si existe configuración pero responde 404/codec incompatible: error recuperable, retry y alternativa de lectura/contacto. La validación de archivos antes de deploy ayuda, pero no sustituye handling en navegador.

### Derivados y migración

Conservar masters. Cuando lleguen, inspeccionar con ffprobe o MediaInfo si están disponibles; no afirmar que existen hoy. MP4 H.264 + AAC, fast-start, y una resolución/bitrate derivados del material y pruebas móviles; punto de partida orientativo 720p para conexiones limitadas, 1080p solo si mejora real, nunca upscale. Poster ligero a proporción exacta. Comprobar soporte de range requests, MIME `video/mp4`, carga por HTTPS y CORS de VTT/CDN.

La abstracción de media separa selección, descriptor y player. CDN con MP4 puede mantener HTML5; HLS usa reproducción nativa cuando soportada y un adaptador probado como hls.js cargado solo para ese caso, o Mux Player si se elige ese servicio. Esa migración requerirá evaluar coste, privacidad, URLs firmadas y API; no añadir esos paquetes ahora.

**Privacidad crítica:** `public/videos/roberto.mp4` es accesible directamente a quien conozca la URL, aunque el JSON esté en servidor. Si los mensajes deben ser confidenciales, alojarlos fuera de public y usar acceso autorizado/firmado; un slug y un booleano no bastan. En ese escenario tampoco basta entregar posters/captions privados desde public.

## 12. Composición mobile-first

Baseline 390 px y control a 320 px. Primer viewport: pieza/destinatario y acción; mantener algo de continuidad inferior cuando el alto lo permita. Nada de navegación densa, marketing hero o instrucciones de interfaz como contenido decorativo. No fijar toda la carta a 100vh: browser chrome, teclado y paisaje no deben cortar el CTA.

Flujo principal: WhatsApp -> enlace -> `/slug` -> carta -> abrir -> saludo -> vídeo -> historia -> datos -> confirmar. No solicitar instalación, login ni permisos del dispositivo para el baseline no confidencial. Los enlaces de salto a detalles/confirmación son navegación real, no texto de ayuda.

No hover-only, cursor personalizado, pinning ni desplazamiento horizontal obligatorio. Gutters 16-20 px, controles 48 px, safe-area padding en acciones inferiores y unidades svh/dvh únicamente donde convenga. Los nombres, correos y horarios largos deben envolver y no empujar fuera de pantalla. El email tiene wrap seguro, no reducción ilegible.

Desktop desde un breakpoint orientativo 960 px permite ancho editorial y eventualmente recordar foto junto al texto, si existe; no cambia orden, historia ni datos. Tablet conserva la columna cuando esa composición lee mejor. Breakpoints determinados por contenido. Landscape móvil mantiene scroll vertical y acceso a controles, sin overlay que ocupe toda la pantalla.

## 13. Estrategia de accesibilidad

Objetivo WCAG 2.2 AA con revisión automática **y manual**. HTML `lang="es"`, un h1 de identidad y headings jerárquicos por capítulo. Texto del evento en HTML además del facsímil; alt descriptivo para la pieza, alt vacío para decoración y sin duplicar párrafos extensos en aria-label.

Acciones mediante button/a nativos, nombres accesibles, foco visible y orden lógico; no focus trap para la apertura. Un diálogo real de ampliación sí devuelve foco al disparador y admite Escape. La apertura no requiere arrastrar; sus estados se anuncian de forma breve sin leer cada frame. Contenido no visible interactivo fuera de tab order solo durante su estado cerrado, no oculto indefinidamente.

Enlaces de salto evitan la apertura y llevan a detalles/confirmación. No obligar a ver el vídeo. Pausar disponible; loading/error anunciados sin mensajes por frame ni doble activación Enter/Space. Reduced motion aplica al JS y CSS, en carga inicial y cambios en vivo. No usar color/movimiento como única señal de estado.

Verificar 200% zoom, reflow a 320 CSS px/400%, forced colors, teclado, NVDA en Windows y una prueba de vídeo/lectura en VoiceOver/TalkBack si se dispone de dispositivo. No atribuir conformidad a un score Lighthouse. Sin JS, la lectura y las acciones nativas permanecen disponibles: no dejar historia/agenda bajo estilos que la oculten esperando una animación.

## 14. Estrategia de performance y assets

### Imágenes y fuentes

Masters fuera de publicación. Generar derivados de A01 orientados para lectura a anchos 640, 960, 1280 y 1600 px como punto de partida, conservando proporción. Comprobar visualmente texto, líneas florales y QR: si WebP/AVIF con pérdida degrada tinta/QR, usar WebP lossless o PNG optimizado para el facsímil. No declarar un ahorro antes de medirlo. Un futuro SVG debe ser exportación del editable original, no vectorización/redibujo automático.

Fotografías: AVIF/WebP con fallback compatible, resolución según contenedor/DPR. next/image, width/height y sizes exactos para no descargar tamaño desktop en teléfono. Lazy para bajo el fold; solo el LCP real se carga eager/preload. No lazy-load del hero por costumbre ni preload de todas las escenas.

Fuentes WOFF2 locales con `font-display: swap`, fallback de métricas compatible; solo cortes usados y subset que conserve español/signos. Preload de una familia crítica cuando esté justificado. La caligrafía integrada no obliga a cargar otra fuente. Nada de llamadas a Google Fonts en runtime por defecto.

### Bundle, animación y media

HTML/RSC para contenido estático y JSON seleccionado en servidor. JS cliente limitado a acciones; GSAP/Flip por imports precisos, Lenis condicional y sin SDK de streaming inicial. No fragmentar cada párrafo en un client component ni crear 15 handlers globales. Eventos de scroll/pointer no actualizan React cada frame.

Animar transform/opacity; limitar clip-path a áreas razonables. Sin blur de pantalla completa, sombras animadas enormes o lectura de layout por frame. `will-change` temporal, no en todo el documento. Un refresco coordinado de triggers después de cambios reales, no en cada frame. Cancelar observers/ticker/media al desmontar.

Al primer acceso: **0 peticiones de MP4/manifest**, **0 peticiones de vídeos de otros invitados** y **0 SDKs externos de media**. Poster del invitado solo si se utiliza. No descargar el PDF de 12,93 MiB ni el PNG master de 8,37 MiB al entrar.

### Presupuestos iniciales y verificación futura

Presupuestos propuestos, no mediciones actuales: transfer inicial total <=1 MiB sin vídeo; JS comprimido <=250 KiB; imágenes above-fold <=350 KiB; fuentes críticas <=120 KiB. Revisar si el facsímil requiere más para ser legible, sin sacrificar el contenido por un número arbitrario.

Core Web Vitals a field p75: LCP <=2,5 s, INP <=200 ms y CLS <=0,1. Simulación móvil/red lenta y CPU limitada para diagnóstico, al menos tres cargas equivalentes para mediana/rango. Lighthouse y TBT no son INP de usuarios reales. En sitio nuevo/privado puede no existir CrUX; decir no disponible, no aprobado. Sin analítica/RUM de invitados por defecto.

Pruebas del incremento siguiente: build/typecheck/lint, screenshots 320/390/768/1440, apertura normal/reducida, ruta general y seis rutas reales cuando existan, vídeo válido/ausente/404, retorno desde WhatsApp, ampliación con teclado y consola/red limpia. La performance y accesibilidad de una web aún no construida no se declaran verificadas.

## 15. Riesgos y mitigaciones

| Riesgo | Decisión de mitigación |
| --- | --- |
| Raster sin capas para pliegue/parallax botánico | Mantener el arte intacto; soporte externo animado y exportaciones originales antes de prometer capas internas. |
| Fotos, vídeos, posters y fuentes ausentes | Storyboard honesto; capítulos tipográficos y estados de ausencia, nunca stock o nombres nuevos. |
| Texto pequeño dentro del facsímil móvil | HTML equivalente legible y ampliación, no estirar/cambiar el original. |
| Dorado/oliva insuficientes para body | Roles de color con contraste medido; charcoal/tinta original para lectura. |
| Filtración entre invitados | Resolver JSON en servidor, props mínimas, fuente actual única, sin caché mutable común ni prefetch de otras familias. |
| Confundir URL personalizada con acceso privado | Acordar política; autorización/signed URLs si se exige confidencialidad. |
| iOS/WhatsApp bloquea play o cambia fullscreen | Interacción explícita, playsInline, manejo de promise y controles nativos probados en dispositivo. |
| Motion oculta información o interrumpe vídeo | Scroll libre, sin pinning móvil, fallbacks y no auto-avance. |
| TypeScript/ESLint latest incompatibles | TS 5.9.3 y ESLint 9.39.5 según peers consultados; verificar instalación/build/lint sin force al implementar. |
| Datos horarios ambiguos | No publicar final de celebración como AM/PM supuesto; distinguir llegada y ceremonia y confirmar cierre. |
| Mostrar postboda a todas las familias | Filtrar antes de render y acordar quiénes son elegibles; no ocultamiento cliente como seguridad. |
| QR lleva a un destino no auditado | Preservar su imagen pero pedir/confirmar enlace canónico de ubicación; no inferir URL por aspecto. |
| CTA WhatsApp interpretado como RSVP guardado | Abrir un mensaje no confirma asistencia; sin estado confirmado hasta una respuesta real. |

## 16. Decisiones realmente pendientes y cierre

No es necesario volver a preguntar por estilo, stack preferido, fecha principal, ubicación general, teléfono, secuencia o mobile-first: están en el brief. La fecha principal es **7 de diciembre de 2026**; **8 de diciembre** es la postboda, no una fecha alternativa.

Antes del primer incremento se necesita resolver únicamente:

1. **Privacidad:** ¿se acepta que los enlaces personalizados y sus MP4 puedan abrirse por quien reciba la URL, o los mensajes/postboda deben tener acceso restringido real? Cambia almacenamiento, autorización y caching.
2. **Destinatarios y asociaciones:** los seis slugs/displayName reales, sus archivos y qué familias corresponden a padres/hermanos. Roberto/Carlos/Ana son ejemplos, no lista certificada; no crear los otros tres nombres.
3. **Arte separado:** editable o exportaciones originales del frente/carta, monograma y botánica si se desea desplegar/animar esas capas. Con el PNG se conserva identidad, pero no se promete independencia de elementos integrados.
4. **Agenda final:** confirmar el final de celebración (el brief cita un original 12:00 PM y propone medianoche). 15:45 puede ser llegada y 16:00 ceremonia según el documento; confirmar esa distinción al cerrar el copy, sin modificar el facsímil.
5. **Enlace exacto de ubicación:** venue/pin/URL canónica que deba abrir Ver ubicación; Puerto Velero, Atlántico no identifica por sí solo un punto preciso.

La recepción de fotos/vídeos/captions es un insumo pendiente, no una razón para inventar contenido. No se descargan fuentes ni se extraen motivos hasta aprobar los derivados. Si las fuentes originales se suministran, revisar licencia y ajustar la selección web sin cambiar la invitación física.

**Cierre de fase:** informe preparado; implementación en pausa. El próximo paso, solo con aprobación, es construir primero la escena estática de carta y probar la apertura, y después avanzar escena por escena. Nada de scaffold, componentes o instalaciones de aplicación en esta entrega.

### Fuentes técnicas consultadas

- [Next.js: instalación, requisitos y lint](https://nextjs.org/docs/app/getting-started/installation).
- [Next.js: segmentos dinámicos y params asíncronos](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes).
- [Registro npm de Next.js](https://registry.npmjs.org/next/latest), [React](https://registry.npmjs.org/react/latest), [GSAP](https://registry.npmjs.org/gsap/latest) y [parser TypeScript](https://registry.npmjs.org/@typescript-eslint/parser/latest).
- [Cormorant Garamond y OFL](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond), [Source Serif 4 y OFL](https://github.com/google/fonts/tree/main/ofl/sourceserif4).
- [MDN: vídeo HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video), [MDN: autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

Las mediciones de PNG y contraste son comprobaciones locales; la auditoría de vídeo, las pruebas de navegadores y la conformidad del sitio quedan pendientes porque esos archivos/la implementación todavía no existen.