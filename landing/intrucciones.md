Sí. Y con el diseño que adjuntaste, **yo no haría un landing page convencional**. La oportunidad está en convertir la invitación física en una **experiencia digital narrativa**: que la persona sienta que está abriendo una carta antigua, íntima y cuidadosamente escrita para ella, y luego esa carta se transforma lentamente en la historia de Luis & Marie.

La imagen que adjuntaste tiene una proporción de **20,5 × 13 cm** y está girada; visualmente, para la web conviene tratarla como una **pieza editorial vertical de 13 × 20,5 cm**, conservando sus ilustraciones florales, abanicos, trigo, paleta crema/champagne, verde salvia y dorado/bronce.

Además, la idea de `/roberto` es muy buena. No necesitas seis páginas diferentes: necesitas **una experiencia + un archivo de datos que determine a quién está dirigida**.

## 1. Concepto creativo

Yo lo conceptualizaría como:

# **THE LETTER**
### *Luis & Marie — 07 · XII · 2026*

No se siente como:

> "Aquí tienes nuestra página de boda."

Sino como:

> **"Esta carta llegó hasta ti porque eres parte de nuestra historia."**

La experiencia debería tener tres capas:

**Carta → Historia → Encuentro**

Y todo el movimiento debe reforzar esas tres ideas.

---

# 2. La experiencia completa

### ESCENA 01 — La carta cerrada

Al entrar a:

`/roberto`

no aparece inmediatamente un montón de información.

Aparece una **carta/invitación cerrada** sobre un fondo cálido.

La estética:

- papel marfil
- textura muy sutil de papel
- bordes imperfectos
- ornamentación floral de tu diseño
- dorado envejecido
- sombras muy suaves
- tipografía serif editorial
- pequeños detalles manuscritos
- iluminación cálida

En el centro:

**LUIS & MARIE**

`07 · DICIEMBRE · 2026`

Y debajo:

> **Una carta para Roberto**

No utilizaría "INVITACIÓN DE BODA" como protagonista.

Debe sentirse más íntimo.

---

# 3. La apertura

Aquí está uno de los momentos más importantes.

Al hacer clic:

**"Abrir carta"**

la animación debe simular físicamente que se abre una invitación.

No simplemente:

`fadeIn()`

Quiero:

1. el sello/ornamento aparece;
2. la carta hace una pequeña respiración;
3. se abre;
4. el papel gira ligeramente;
5. las dos caras se separan;
6. aparece el interior;
7. el nombre de la familia aparece primero;
8. después aparece el resto del contenido.

Esto es precisamente un buen caso para una animación FLIP: GSAP Flip está diseñado para animar elementos cuando pasan de un estado/layout a otro sin que el cambio resulte brusco. [GSAP](https://gsap.com/docs/v3/Plugins/Flip/?utm_source=chatgpt.com)

Para el resto de la narrativa usaría GSAP + ScrollTrigger, que permite vincular animaciones al desplazamiento, incluyendo scrub, pin y triggers. [GSAP](https://gsap.com/docs/v3/Plugins/ScrollTrigger/?utm_source=chatgpt.com)

---

# 4. El saludo personalizado

Después de abrir la carta:

> **Querida familia Roberto,**

o simplemente:

> **Queridos Roberto y familia,**

Y una frase breve.

Algo como:

> Hay personas que forman parte de nuestra vida no solamente por los años compartidos, sino por el significado que dejan en ellos.

Luego:

**"Por eso esta carta es para ustedes."**

Esto hace que el `/roberto` tenga sentido emocional.

No es simplemente personalización técnica.

---

# 5. EL VIDEO PERSONALIZADO

Aquí pondría uno de los momentos más fuertes.

La carta se desplaza y se convierte en una especie de **marco cinematográfico**.

Aparece:

### **Antes de continuar, queremos decirte algo personalmente.**

Y el video:

**ROBERTO + FAMILIA**

El video no debe aparecer automáticamente con sonido.

Debe existir un botón:

### ▶ Ver nuestro mensaje

Al reproducir:

- video grande
- bordes tipo película/editorial
- sonido activado por interacción
- subtítulos opcionales
- controles minimalistas
- posibilidad de pantalla completa

Y cuando termina:

> **Gracias por escucharnos.  
> Ahora queremos contarte por qué este día significa tanto para nosotros.**

Esto conecta el video con el storytelling.

---

# 6. La historia: 2008 → 2022 → 2026

Aquí evitaría una típica timeline llena de círculos.

Haría una **narrativa cinematográfica vertical**.

### 2008

Pantalla casi vacía.

Número enorme:

# 2008

Luego:

> Nuestra historia comenzó cuando decidimos emprender juntos este increíble viaje llamado vida.

La ilustración floral aparece lentamente.

El número se desvanece.

---

### 2022

El scroll continúa.

La composición cambia.

# 2022

> Después de tantos años, decidimos convertir nuestra historia en un compromiso para toda la vida.

Y aquí aparece:

**Boda civil**

No sobrecargar.

---

### 2026

La tercera transición debe ser la más importante.

# 2026

Y aparece:

> Hay historias que no terminan cuando se escribe un capítulo.  
> Algunas simplemente encuentran una nueva forma de comenzar.

Después:

# LUIS & MARIE

### Nuestra boda religiosa

Esto le da sentido a que hayan tenido boda civil en 2022 y ahora estén celebrando la religiosa.

---

# 7. EL MOMENTO DE LA INVITACIÓN

Aquí finalmente se revela:

## **Queremos vivir este capítulo con ustedes.**

Y entonces:

**7 DE DICIEMBRE DE 2026**

**Puerto Velero · Atlántico**

La ilustración floral de tu invitación vuelve a aparecer.

Aquí es donde el visitante comprende completamente:

> Ah. Esta es la invitación.

---

# 8. Ceremonia

La información debe aparecer como una **agenda editorial**, no como tarjetas genéricas.

### THE CEREMONY

**Puerto Velero, Atlántico**

Luego una línea vertical:

**3:45 PM**  
Llegada de invitados

↓  

**4:00 PM**  
Ceremonia al atardecer

↓

**4:40 PM**  
Golden Hour + cóctel

↓

**7:00 PM**  
Ritual de las velitas

↓

**8:00 PM**  
Recepción

↓

**12:00 AM**  
Final de la celebración

⚠️ Aquí detecto algo importante: en la información que me diste aparece **12:00 PM**, pero por la lógica del evento parece que quieres decir **12:00 AM / medianoche**. Yo haría que el agente lo marque como dato a confirmar, no que lo cambie silenciosamente.

---

# 9. Dress Code

Esta sección puede ser preciosa.

No una caja que diga:

> DRESS CODE: BLANCO.

Sino una escena de verano.

Fondo crema.

Una textura de lino aparece.

Luego:

# BLANCO PLAYERO

Y:

> Únete a nuestra fiesta blanca luciendo tu mejor atuendo de lino o telas frescas.

Después pequeños elementos ilustrados de tu invitación se desplazan suavemente.

La sensación debe ser:

**Caribe sofisticado + heritage + verano europeo.**

No "beach party".

---

# 10. Puerto Velero

Aquí haría una transición visual:

**papel → fotografía → mar**

La ilustración floral comienza a desaparecer y detrás aparece una fotografía/video corto del mar.

Texto:

# PUERTO VELERO

**Atlántico, Colombia**

Y un CTA elegante:

**Ver ubicación →**

Puede abrir Google Maps.

---

# 11. 8 DE DICIEMBRE

Esto no debería parecer parte de la boda principal.

Debe sentirse como:

### **The Morning After**

Una nueva página/capítulo.

---

**08 · DICIEMBRE · 2026**

### La mañana después

**8:00 AM**  
Desayuno en la piscina

**8:45 AM**  
Foto familiar

**8:55 AM**  
Recreación en la piscina

**11:00 AM**  
Final

Y después:

> **Postboda privada**  
> Solo para padres de los novios y hermanos.

Esto le da una sensación mucho más íntima y familiar.

---

# 12. Confirmación

Aquí sí debe ser extremadamente sencilla.

## **¿Nos acompañas?**

> Hemos reservado este día pensando también en ustedes.

**CONFIRMAR CUPO**

**305 295 1053**

No pondría un formulario enorme.

Incluso puede haber:

**Confirmar por WhatsApp**

---

# 13. Cierre

Aquí volvería la estética de la carta.

La pantalla queda prácticamente vacía.

Aparece:

**Luis & Marie**

Luego:

> Algunas fechas pasan.  
> Algunas permanecen.

Y finalmente:

### **07 · XII · 2026**

**Puerto Velero**

Una pequeña animación del ornamento floral cierra la experiencia.

---

# 14. La personalización con JSON

Sí: **JSON es exactamente la solución correcta.**

La arquitectura debería ser:

```text
URL
 ↓
/roberto
 ↓
router obtiene "roberto"
 ↓
guestData.json
 ↓
encuentra roberto
 ↓
carga nombre + familia + video
 ↓
renderiza la experiencia
```

Por ejemplo:

```json
{
  "roberto": {
    "name": "Roberto",
    "displayName": "Roberto y familia",
    "video": "/videos/roberto.mp4"
  },

  "carlos": {
    "name": "Carlos",
    "displayName": "Carlos y familia",
    "video": "/videos/carlos.mp4"
  },

  "ana": {
    "name": "Ana",
    "displayName": "Ana y familia",
    "video": "/videos/ana.mp4"
  },

  "default": {
    "name": "familia",
    "displayName": "Querida familia",
    "video": "/videos/general.mp4"
  }
}
```

Así puedes tener:

`/roberto`

`/carlos`

`/ana`

etc.

Y **no duplicas el landing page**.

---

# 15. Incluso podemos personalizar más

El JSON podría manejar:

```json
{
  "roberto": {
    "displayName": "Roberto y familia",
    "shortGreeting": "Queremos compartir este día con ustedes.",
    "video": "/videos/roberto.mp4",
    "showPostWedding": true,
    "familyPhoto": "/images/families/roberto.jpg"
  }
}
```

Así podrías decidir que algunas familias:

- ven un video diferente;
- tienen una fotografía diferente;
- reciben un saludo diferente;
- tienen acceso a la postboda;
- reciben determinada información.

Todo sin duplicar el sitio.

---

# 16. Stack de animación que le pediría al agente

Yo **no dejaría que el agente simplemente diga "haré animaciones CSS bonitas"**.

Le especificaría una arquitectura de motion.

### GSAP

Para:

- apertura de carta
- timelines
- entrada de textos
- secuencias
- transiciones
- parallax
- storytelling

GSAP ScrollTrigger es especialmente adecuado para las escenas controladas por scroll. [GSAP](https://gsap.com/docs/v3/Plugins/ScrollTrigger/?utm_source=chatgpt.com)

### GSAP Flip

Para:

**carta cerrada → carta abierta → contenido**

y otras transformaciones estructurales. [GSAP](https://gsap.com/docs/v3/Plugins/Flip/?utm_source=chatgpt.com)

### Smooth scrolling

Puedes utilizar **Lenis**, que está pensado precisamente para smooth scroll y sincronización con GSAP/ScrollTrigger, manteniendo el scroll nativo y respetando preferencias de reduced motion. [GitHub](https://github.com/darkroomengineering/lenis?utm_source=chatgpt.com)

También existe GSAP ScrollSmoother, que trabaja sobre scrolling nativo y ofrece parallax; yo escogería **una sola solución**, no ambas. [GSAP](https://gsap.com/docs/v3/Plugins/ScrollSmoother/?utm_source=chatgpt.com)

### View Transitions API

Para cambios de estado/navegación dentro de la experiencia puede utilizarse la View Transition API, que permite animar cambios entre estados del DOM y tiene soporte actual bastante amplio en navegadores modernos. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API?utm_source=chatgpt.com)

### Reduced motion

Esto es importante: el sitio debe tener una versión de movimiento reducido para usuarios que lo soliciten. La propia Web Animations API recomienda contemplar `prefers-reduced-motion`. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API?utm_source=chatgpt.com)

---

# 17. El lenguaje visual

Yo le pondría al agente estas reglas:

### Paleta

- Ivory / papel: `#F7F3EA`
- Champagne: `#E7D7B8`
- Antique gold: `#A8661A`
- Sage: `#A9B09C`
- Olive muted: `#747A62`
- Warm taupe: `#B8A58D`
- Charcoal: `#302C27`

No utilizar:

- dorado metálico brillante;
- beige amarillento excesivo;
- rosa de boda tradicional;
- azul turquesa;
- gradientes modernos;
- glassmorphism;
- neón;
- estética de plantilla de boda.

---

# 18. Tipografía

La combinación debería sentirse **editorial/heritage**, no "wedding template".

Una serif elegante para titulares.

Una serif o sans muy refinada para información.

Y una script únicamente como acento.

La regla:

**80 % editorial / 15 % heritage / 5 % manuscrito.**

No convertir todo en caligrafía.

---

# 19. Motion language

Esto es muy importante.

Las animaciones deben tener **peso**.

No:

- bounce;
- elastic;
- confetti;
- corazones flotando;
- pétalos cayendo eternamente;
- zooms exagerados;
- texto rebotando;
- transiciones TikTok.

Sí:

- slow reveal;
- paper unfolding;
- subtle parallax;
- ink appearing;
- editorial masking;
- gentle scale;
- long easing curves;
- displacement muy sutil;
- page turn;
- image reveal;
- slow floral movement.

La regla sería:

> **La animación debe parecer consecuencia física de la historia, no decoración.**

---

# 20. Y ahora el prompt para el agente

Este es el que yo usaría. Está pensado para que le entregues **la imagen que acabas de adjuntar + las demás imágenes de la carpeta**.

Quiero que diseñes y desarrolles una experiencia web completa para la boda de Luis & Marie.

No quiero un wedding landing page convencional.

Quiero crear una experiencia digital que se sienta como **abrir una carta/invitación física de lujo**, descubrir una historia de amor y finalmente llegar a la invitación completa.

La experiencia debe ser emocional, madura, elegante, cinematográfica, íntima y profundamente editorial.

---

# 1. REFERENCIA VISUAL PRINCIPAL

Voy a proporcionar en la carpeta del proyecto las imágenes y recursos visuales de la boda.

Utiliza como referencia principal la invitación adjunta.

La invitación tiene una estética:

- vintage boho chic
- heritage
- editorial
- art nouveau sutil
- elegante
- madura
- artesanal
- romántica sin ser cursi
- sofisticada
- caribeña de manera muy sutil
- papel antiguo / stationery de lujo

La pieza contiene ilustraciones botánicas, abanicos de palma, flores, hojas, trigo y elementos naturales.

La imagen principal proporcionada está girada; interpreta correctamente su orientación visual y NO reproduzcas el texto de manera rotada en la experiencia web.

La invitación física tiene aproximadamente una proporción de 13 × 20,5 cm cuando se interpreta correctamente en orientación vertical.

NO rediseñes las ilustraciones originales.

NO sustituyas los recursos visuales por ilustraciones genéricas.

Utiliza las imágenes de la carpeta como fuente principal de verdad visual.

---

# 2. CONCEPTO

El concepto creativo es:

THE LETTER

Luis & Marie

07 · XII · 2026

La experiencia debe sentirse como:

CARTA → HISTORIA → ENCUENTRO

La persona no debe sentir que está entrando a una página web.

Debe sentir que alguien le entregó una carta especial y que está descubriendo lentamente su contenido.

---

# 3. PERSONALIZACIÓN POR URL

La experiencia debe funcionar mediante rutas personalizadas.

Ejemplos:

/roberto
/carlos
/ana

Cada ruta representa una familia invitada.

NO crear seis landing pages independientes.

Crear UNA sola experiencia reutilizable alimentada por datos.

Utilizar un archivo JSON como fuente de configuración.

Ejemplo:

{
  "roberto": {
    "name": "Roberto",
    "displayName": "Roberto y familia",
    "video": "/videos/roberto.mp4"
  },
  "carlos": {
    "name": "Carlos",
    "displayName": "Carlos y familia",
    "video": "/videos/carlos.mp4"
  },
  "ana": {
    "name": "Ana",
    "displayName": "Ana y familia",
    "video": "/videos/ana.mp4"
  },
  "default": {
    "name": "familia",
    "displayName": "Querida familia",
    "video": "/videos/general.mp4"
  }
}

Implementar:

URL → slug → JSON → datos de invitado → render personalizado.

Si alguien entra a una ruta inexistente, utilizar el registro "default".

No romper la experiencia.

---

# 4. VIDEO PERSONALIZADO

El video debe ser determinado por el JSON.

Por ejemplo:

/roberto

debe mostrar el video:

/videos/roberto.mp4

en la sección personalizada.

El visitante NO debe recibir un video incorrecto.

La sección debe mostrar algo como:

"Antes de continuar, queremos decirte algo personalmente."

Botón:

"Ver nuestro mensaje"

El video NO debe reproducirse automáticamente con sonido.

Debe existir interacción explícita para reproducirlo.

Debe funcionar correctamente en móvil.

Después del video debe existir una transición narrativa hacia la historia.

---

# 5. ESTRUCTURA NARRATIVA

Construye la experiencia como una historia.

No mostrar toda la información simultáneamente.

El orden debe ser:

01. CARTA CERRADA
02. APERTURA
03. SALUDO PERSONALIZADO
04. VIDEO PERSONALIZADO
05. NUESTRA HISTORIA
06. 2008
07. 2022
08. 2026
09. LA INVITACIÓN
10. CEREMONIA
11. DRESS CODE
12. PUERTO VELERO
13. 8 DE DICIEMBRE
14. CONFIRMACIÓN
15. CIERRE

Cada sección debe tener una razón narrativa.

---

# 6. ESCENA 01 — CARTA CERRADA

La primera pantalla debe parecer una carta física.

Fondo:

- ivory
- textura de papel muy sutil
- iluminación cálida
- ambiente silencioso

En el centro aparece la invitación cerrada.

Mostrar:

LUIS & MARIE

07 · DICIEMBRE · 2026

Y el destinatario:

"Para Roberto y familia"

según el JSON.

Agregar una acción:

"ABRIR"

La invitación debe tener una animación de apertura física.

No hacer simplemente fade-in.

Debe sentirse como:

papel → movimiento → apertura → descubrimiento.

---

# 7. ESCENA 02 — APERTURA

Utilizar una animación de tipo FLIP / page transition.

La carta cerrada debe transformarse visualmente en la carta abierta.

El movimiento debe tener:

- peso
- inercia
- suavidad
- easing elegante
- duración cinematográfica
- ningún bounce infantil

La apertura debe ser uno de los momentos memorables de la experiencia.

---

# 8. ESCENA 03 — SALUDO

Después de abrir:

"Querida familia [nombre]"

o el displayName definido por JSON.

Luego una frase breve:

"Hay personas que forman parte de nuestra vida no solamente por los años compartidos, sino por el significado que dejan en ellos."

Después:

"Por eso esta carta es para ustedes."

El texto debe aparecer progresivamente como si estuviera siendo descubierto.

---

# 9. ESCENA 04 — VIDEO

Introducir el video personalizado.

Título:

"Antes de continuar, queremos decirte algo personalmente."

CTA:

"VER NUESTRO MENSAJE"

Video elegante, editorial, sin interfaz visual pesada.

Al terminar:

"Gracias por escucharnos."

Y continuar naturalmente hacia la historia.

---

# 10. ESCENA 05 — NUESTRA HISTORIA

Título:

"Nuestra historia"

La narración debe sentirse existencial y madura.

NO utilizar lenguaje de boda genérico como:

"Éramos dos almas destinadas a encontrarse."

NO utilizar clichés.

El tono debe inspirarse conceptualmente en:

- sabiduría
- memoria
- tiempo
- permanencia
- decisiones
- familia
- paso de los años
- significado de compartir una vida

La referencia filosófica es:

heritage + sage + senior + existential.

Inspiración conceptual:

Salomón / Eclesiastés
Kierkegaard
Dostoievski
Victor Hugo

NO copiar frases de estos autores.

NO imitar literalmente su estilo.

Utilizar únicamente la profundidad conceptual:

el tiempo pasa,
las personas cambian,
las decisiones construyen una vida,
el amor se demuestra en los años,
y algunas historias adquieren significado precisamente porque han permanecido.

---

# 11. 2008

Mostrar:

2008

Texto:

"Nuestra historia comenzó en 2008, cuando decidimos emprender juntos este increíble viaje llamado vida."

Animación:

El número aparece lentamente.

Después aparece el texto.

Las ilustraciones botánicas pueden moverse ligeramente mediante parallax.

No utilizar animaciones excesivas.

---

# 12. 2022

Mostrar:

2022

Texto:

"En 2022, sellamos nuestro compromiso con nuestra boda civil, marcando un capítulo hermoso de nuestra relación."

La transición debe mostrar que el tiempo ha pasado.

No usar una timeline convencional con círculos.

Crear una sensación de páginas de un libro.

---

# 13. 2026

Mostrar:

2026

Texto:

"Ahora, en este 2026, estamos muy emocionados de dar el paso de nuestra boda religiosa y compartir nuestra alegría rodeados de las personas que más queremos."

Después:

LUIS & MARIE

07 · DICIEMBRE · 2026

Este debe ser uno de los puntos culminantes visuales.

---

# 14. LA INVITACIÓN

Texto:

"Queremos vivir este capítulo con ustedes."

Mostrar:

7 DE DICIEMBRE DE 2026

PUERTO VELERO · ATLÁNTICO

La composición debe inspirarse directamente en la invitación física proporcionada.

---

# 15. CEREMONIA

Presentar la agenda como una pieza editorial.

CEREMONIA

Puerto Velero, Atlántico.

3:45 PM
Llegada de invitados

4:00 PM
Ceremonia al atardecer

4:40 PM
Fotos "Golden Hour" y cóctel

7:00 PM
Ritual de las velitas

8:00 PM
Recepción

12:00 AM
Final de la celebración

IMPORTANTE:

La información original proporcionada dice "12:00 PM" como final de celebración.

Por contexto parece probable que sea "12:00 AM".

NO modificar silenciosamente este dato.

Marcarlo como dato pendiente de confirmación si el sistema permite revisión de contenido.

---

# 16. DRESS CODE

Título:

BLANCO PLAYERO

Texto:

"Únete a nuestra fiesta blanca luciendo tu mejor atuendo de lino o telas frescas. ¡Prepárense para disfrutar del mar con la mayor comodidad!"

La escena debe sentirse como:

lino + verano + Caribe sofisticado.

NO parecer fiesta tropical genérica.

NO utilizar colores tropicales saturados.

---

# 17. PUERTO VELERO

Mostrar:

PUERTO VELERO

Atlántico, Colombia.

Utilizar fotografías proporcionadas en la carpeta cuando existan.

Crear transición:

papel → fotografía → paisaje.

Agregar CTA:

"VER UBICACIÓN"

---

# 18. 8 DE DICIEMBRE

Crear una nueva escena claramente diferenciada.

08 · DICIEMBRE · 2026

"La mañana después"

8:00 AM
Desayuno en la piscina

8:45 AM
Foto familiar

8:55 AM
Recreación en la piscina

11:00 AM
Final

Después:

POSTBODA PRIVADA

"Solo para padres de los novios y hermanos."

Debe sentirse íntimo y familiar.

---

# 19. CONFIRMACIÓN

Título:

"¿Nos acompañas?"

Texto:

"Hemos reservado este día pensando también en ustedes."

CTA principal:

CONFIRMAR CUPO

Teléfono:

305-295-1053

Agregar opción para abrir WhatsApp.

No crear un formulario largo.

---

# 20. CIERRE

Volver visualmente al lenguaje de la carta.

Mucho espacio negativo.

Aparece:

LUIS & MARIE

07 · XII · 2026

Puerto Velero

Y una frase final:

"Algunas fechas pasan.
Algunas permanecen."

Cerrar lentamente con las mismas ilustraciones florales de la invitación.

---

# 21. SISTEMA VISUAL

Paleta base:

Ivory:
#F7F3EA

Champagne:
#E7D7B8

Antique Gold:
#A8661A

Sage:
#A9B09C

Muted Olive:
#747A62

Warm Taupe:
#B8A58D

Charcoal:
#302C27

Evitar:

- dorado metálico brillante
- rosa de boda convencional
- turquesa
- neón
- glassmorphism
- gradients modernos
- UI tecnológica
- tarjetas genéricas
- corazones flotantes
- confetti
- pétalos infinitos
- bounce
- efectos infantiles

---

# 22. TIPOGRAFÍA

La jerarquía debe sentirse editorial.

Usar:

- serif sofisticada para títulos
- serif/sans refinada para información
- script únicamente como acento

Regla visual:

80% editorial
15% heritage
5% manuscrito

NO utilizar tipografía manuscrita para todo.

---

# 23. SISTEMA DE ANIMACIÓN

Utiliza una arquitectura profesional de motion design.

Preferencia:

GSAP
GSAP ScrollTrigger
GSAP Flip

Para smooth scrolling utilizar UNA solución:

Lenis

o

GSAP ScrollSmoother

NO utilizar ambas simultáneamente.

Para transiciones entre estados utilizar View Transition API cuando aporte valor.

La animación debe tener intención.

Cada movimiento debe responder a una acción narrativa.

Ejemplos:

- abrir carta → transformación física
- historia → paso del tiempo
- fotografía → recuerdo
- scroll → descubrimiento
- video → mensaje personal
- cierre → volver a la carta

NO animar elementos simplemente "porque se puede".

---

# 24. MOTION PRINCIPLES

Utilizar:

- slow reveal
- elegant easing
- subtle parallax
- paper unfolding
- mask reveal
- editorial transitions
- image reveal
- slight scale
- depth
- opacity
- blur muy sutil
- desplazamientos pequeños

Evitar:

- bounce
- elastic
- excessive rotation
- excessive zoom
- random particles
- constant movement

La regla principal:

"Motion should feel physical, editorial and intentional."

---

# 25. SCROLL

El scroll debe sentirse fluido.

Las secciones deben revelar progresivamente la historia.

No crear un scroll demasiado lento.

No bloquear permanentemente el scroll.

El sitio debe funcionar correctamente en:

- iPhone
- Android
- tablet
- desktop

La experiencia móvil es PRIORITARIA.

---

# 26. RESPONSIVE

Diseñar primero pensando en móvil.

En móvil:

- carta centrada
- textos legibles
- video vertical/horizontal según archivo
- botones grandes
- touch targets adecuados
- nada debe quedar fuera de pantalla
- no depender de hover
- animaciones optimizadas

En desktop puede existir una composición editorial más amplia.

---

# 27. PERFORMANCE

No sacrificar performance por efectos visuales.

Optimizar:

- imágenes
- videos
- lazy loading
- preload únicamente de recursos críticos
- formatos modernos cuando sea posible
- poster para video
- responsive images
- evitar animar propiedades costosas innecesariamente

Priorizar transform y opacity para animaciones.

---

# 28. ACCESSIBILITY

Implementar:

prefers-reduced-motion

Cuando el usuario tenga reduced motion:

- eliminar smooth scrolling
- reducir parallax
- reducir transformaciones
- mantener la experiencia narrativa
- conservar la funcionalidad

Todos los botones deben tener estados accesibles.

Video debe poder pausarse.

No depender exclusivamente del movimiento para comunicar información.

---

# 29. ARQUITECTURA DEL PROYECTO

Separar:

/assets
/images
/videos
/data
/components
/animations
/styles

Crear:

/data/guests.json

y una estructura limpia para modificar fácilmente invitados y videos.

La información de invitados NO debe estar hardcodeada dentro de los componentes.

---

# 30. DATOS DEL EVENTO

Utilizar exactamente:

Luis & Marie

DICIEMBRE 7, 2026

Nuestra historia comenzó en 2008, cuando decidimos emprender juntos este increíble viaje llamado vida. A lo largo de todos estos años, hemos crecido, reído y construido un amor que se ha hecho más fuerte con cada paso que damos.

En 2022, sellamos nuestro compromiso con nuestra boda civil, marcando un capítulo hermoso en nuestra relación.

Ahora, en este 2026, estamos muy emocionados de dar el paso de nuestra boda religiosa y compartir nuestra alegría rodeados de las personas que más queremos.

Gracias por acompañarnos en esta aventura; estamos ansiosos por festejar nuestro gran día con todos ustedes.

Ceremonia:
Puerto Velero, Atlántico.

Dress Code:
Blanco playero.

Confirmación:
305-295-1053

Email:
ADMIN@METAMAGAGENCY.COM

Metamag Agency S. A. S. BIC

---

# 31. IMPORTANTÍSIMO: NO HACER

NO crear un template genérico de bodas.

NO usar stock photography si existen fotografías nuestras en la carpeta.

NO reemplazar nuestra identidad visual.

NO cambiar los colores arbitrariamente.

NO modificar las ilustraciones.

NO inventar información.

NO inventar nombres de invitados.

NO inventar horarios.

NO inventar ubicaciones.

NO agregar contenido sentimental cliché.

NO utilizar frases religiosas genéricas.

NO hacer que parezca una página de wedding planner.

NO hacer que parezca una invitación infantil.

NO hacer que parezca una página tecnológica.

NO hacer que parezca una landing page de SaaS.

Debe sentirse como:

UNA CARTA DE FAMILIA CONSTRUIDA COMO UNA PIEZA EDITORIAL CINEMATOGRÁFICA.

---

# 32. OBJETIVO EMOCIONAL

Al terminar la experiencia, el visitante debería sentir:

"Esto fue hecho especialmente para nosotros."

"Esta historia tiene muchos años."

"Quieren que estemos allí."

"Esto no parece una invitación genérica."

"Quiero guardar esta página."

"Quiero compartirla."

La experiencia debe ser memorable sin ser estridente.

Elegante sin ser fría.

Romántica sin ser cursi.

Profunda sin ser pretenciosa.

Antigua sin parecer anticuada.

Moderna en tecnología, pero clásica en sensibilidad.

---

# 33. ENTREGABLE

Construye la experiencia funcional completa.

No entregar únicamente un mockup.

Debe existir:

- landing funcional
- rutas personalizadas
- JSON de invitados
- video personalizado por invitado
- animación de apertura de carta
- storytelling completo
- responsive mobile
- desktop
- animaciones
- navegación
- CTA de WhatsApp
- CTA de ubicación
- sección de confirmación
- reduced-motion fallback
- manejo de ruta desconocida
- loading state elegante
- error state para video inexistente

Antes de terminar, revisa toda la experiencia como si fueras uno de los invitados.

Pregunta implícitamente en cada escena:

"¿Por qué estoy viendo esto ahora?"

Si una animación no tiene una razón narrativa, elimínala.

La experiencia final debe sentirse como **abrir una carta, leer una vida compartida y descubrir que uno también forma parte de ese capítulo.**

### Una decisión que me parece especialmente importante

**No pondría el video personalizado al principio absoluto.** Primero dejaría que la persona abra la carta y descubra que la invitación está dirigida a ella. Luego aparece el video. Eso hace que el video tenga significado: *"te hemos preparado algo personalmente"*, en lugar de parecer un video promocional incrustado en una web.

Y técnicamente la arquitectura **`/roberto → JSON → video de Roberto`** es muy limpia y escalable para las seis familias.