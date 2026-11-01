# Skills: Discover -> Evaluate -> Select -> Install -> Verify

Estado: 11 skills reales instaladas para este workspace en `.github/skills/`. No se ha construido la landing ni instalado paquetes de la aplicacion.

## Seleccion

| Prioridad / categoria | Skill instalada y fuente | Adecuacion y funcion | Comparacion / dependencia |
| --- | --- | --- | --- |
| 1. Motion cinematica | `cinematic-gsap-lenis-motion-system` - [MengTo/Skills](https://github.com/MengTo/Skills) | Sistema de ritmo, reveals, mascaras, parallax, timelines y sincronizacion GSAP/ScrollTrigger/Lenis; evita bounce y elastic. | Elegida sobre `cinematic-scroll-storytelling`, que repite recetas e impone anatomia de portfolio/preloader. No instalar ambas. Adaptar ejemplos vanilla a React. |
| 1. Motion en React | `gsap-react` - [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | Guia oficial para useGSAP, scope, refs, SSR y limpieza en cambios de ruta. | Complementa, no reemplaza, la direccion cinematica. Paquetes futuros: `gsap`, `@gsap/react`. |
| 1. Flip | `gsap-plugins` - GreenSock | Captura de estado y transicion de layout con Flip; registro de plugins y texto reversible. | La skill cinematica no documenta Flip. Solo usar los plugins necesarios; no habilitar fisica, bounce o ScrollSmoother por estar mencionados. |
| 2. Editorial / lujo | `frontend-design` - [anthropics/skills](https://github.com/anthropics/skills) | Direccion de arte contextual, tipografia y composicion deliberadas; rechaza estetica generica. | Elegida sobre `editorial` de bergside: esa candidata fija Gelasio y tokens universales. No es una skill exclusiva de lujo; la direccion heritage/stationery la fija el brief local. |
| 3. Narrative UX | `storytelling` - [ghaida/intent](https://github.com/ghaida/intent) | Estructura emocional por escenas y razones de cada etapa, con flujo independiente y prohibicion de inventar hechos. | Aporta el por que; motion aporta el como. No se instalo toda la familia Intent ni sus agentes/hooks. |
| 4. Arquitectura React | `vercel-composition-patterns` - [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Composicion, variantes explicitas y fronteras de estado para evitar un componente monolitico. | Distinta de optimizacion de recursos. Algunas recetas requieren React 19; aplicarlas solo a la version compatible. |
| 4. React / Next.js | `vercel-react-best-practices` - Vercel | Fronteras servidor/cliente, serializacion, fetches, waterfalls y carga condicional. | Preferida al antiguo `next-best-practices`, retirado como skill independiente. Consultar docs Next.js versionadas al iniciar la aplicacion. |
| 5. Video web | `mux-video` - [muxinc/skills](https://github.com/muxinc/skills), carpeta upstream `skills/mux-docs` | Consulta documentacion actual de playback React/TypeScript, posters, subtitulos, preload, errores y streaming. | Elegida frente a `19-video-optimization`, cuyo contenido inspeccionado es un contrato generico sin recetas de video, y `video-player`, cuyo ejemplo no reproduce video real. Mux es opcional: el contrato local prioriza HTML5 para MP4 simples. |
| 6. Mobile-first | `mobile-first-design` - [secondsky/claude-skills](https://github.com/secondsky/claude-skills) | CSS desde pantallas pequenas, controles tactiles y mejora progresiva sin exigir framework CSS o app nativa. | Elegida frente a aj-geddes, con objetivo erroneo CLS <100, y Tailwind mobile-first, que presupone Tailwind. Guia breve: safe areas y pruebas WhatsApp se completan con el contrato local. |
| 7. Accesibilidad | `accessibility` - [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | WCAG 2.2, teclado, foco, lectores de pantalla, video accesible y reduced motion. | Mas especifica que una segunda guia visual general. Chrome DevTools MCP es opcional; admite CLI, axe y pruebas manuales. |
| 8. Rendimiento | `performance` - Addy Osmani | Imagenes, fuentes, carga diferida, bundles, runtime y medicion de Core Web Vitals. | No instalar ademas `core-web-vitals` ni `web-quality-audit`: referencias externas disponibles. Complementa las reglas React con medicion de entrega y navegador. |

## Compatibilidad Y Conflictos

- Stack objetivo documentado: Next.js + React + TypeScript + GSAP/ScrollTrigger + @gsap/react + Flip puntual. Lenis solo si aporta valor y nunca junto a ScrollSmoother. View Transitions opcionales, segun soporte real y sin competir con GSAP.
- Un JSON privado resuelve un solo invitado por slug en servidor. No cargar, serializar o precargar los videos de todos. Un slug no autentica: videos o postboda privados necesitan autorizacion real si se exige confidencialidad.
- Mux no crea los videos personalizados ni genera los datos de invitados. Su skill busca docs actuales y requiere red; usar Mux en produccion puede requerir cuenta, configuracion y costes. No se creo ninguna cuenta ni se instalo su SDK.
- Reduced motion desactiva tambien GSAP/Lenis en JavaScript y mantiene narrativa, controles y confirmacion. Las recetas con cursores, blur, preloaders o tarjetas no son decisiones de diseno aprobadas.
- Los ejemplos upstream no son garantia de APIs correctas: confirmar opciones Flip, refreshPriority y APIs React experimentales contra documentacion versionada al implementarlas. Los presupuestos genericos mobile no prevalecen sobre medicion del stack real.
- La documentacion de direccion visual no certifica una estetica final. Se requiere revisar el diseno contra el original, no adoptar paletas o tipografias de ejemplo.

## Instalacion Y Verificacion

- Copia documental de commits fijados: **113 archivos upstream**, incluidas referencias, reglas y licencias disponibles. No se ejecutaron scripts remotos ni se importaron hooks, agentes, binarios o demos. La demo HTML y demas recursos ejecutables se omiten y constan en el inventario; las skills seleccionadas no los requieren para leer sus guias.
- Procedencia, commits, fechas de repositorio, SHA256 y ajustes: [skills-lock.json](skills-lock.json). La fecha registrada es del ultimo commit del repositorio, no una promesa de mantenimiento continuo de cada skill.
- Ajustes locales limitados a enlaces: referencias a skills no instaladas apuntan al commit upstream; enlaces del documento compilado Vercel apuntan a `rules/`. Se conservaron hashes originales y se registraron las adaptaciones.
- Verificados: exactamente 11 `SKILL.md`, nombre coincidente con carpeta, metadatos requeridos, rutas de instalacion, todos los archivos del inventario, hashes y enlaces Markdown locales. El contenido y su frontmatter se revisaron; el chequeo automatizado valida campos, no sustituye un parser YAML completo ni una auditoria de seguridad independiente.
- Instrucciones y seleccion por tarea: [instructions/invitation-experience.instructions.md](instructions/invitation-experience.instructions.md), aplicables a `landing/**`. Conservan la secuencia completa del usuario y no modifican [../landing/intrucciones.md](../landing/intrucciones.md).
- Repetir verificacion desde la raiz con la tarea VS Code **Skills: verificacion final**, o ejecutar el contenido de [skill-tools/Manage-Skills.ps1](skill-tools/Manage-Skills.ps1) con `-Mode Verify`. Una actualizacion requiere nueva inspeccion; el instalador no sobrescribe skills existentes.

## Preparacion Pendiente

El entorno de conocimiento del agente esta preparado. **Node.js, npm y Git no estan disponibles en el PATH comprobado.** No se instalaron herramientas del sistema fuera del alcance solicitado. Antes de scaffolding, verificar si existen fuera del PATH o preparar un runtime compatible con la version elegida de Next.js.

La ubicacion sigue el formato oficial de [Agent Skills de VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills). La instalacion en disco esta comprobada; la incorporacion automatica a una nueva sesion depende de VS Code y de su configuracion. Si no aparecen como slash commands, revisar Agent Customizations/Diagnostics y recargar la ventana. No se afirma haber probado la activacion automatica de cada skill dentro de esta conversacion.

**Pausa de desarrollo:** no hay pagina, servidor ni arquitectura de aplicacion creada. Esperar las instrucciones de desarrollo y confirmar horarios/datos del evento antes de codificarlos.