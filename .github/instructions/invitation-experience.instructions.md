---
description: 'Project constraints for the cinematic editorial invitation: narrative motion, Next.js React TypeScript, guest-specific video, mobile-first UX, accessibility, performance and privacy.'
applyTo: 'landing/**'
---

# Scope And Stage

This phase installs agent knowledge only. Do not scaffold an application, generate a landing page, install application packages, create guest records, or provision hosting until the user explicitly authorizes development.
Read `landing/intrucciones.md` and the latest user brief before development. The latest user brief controls when they differ. Preserve original artwork and supplied personal facts; do not fabricate story details, dates, family membership, captions or media.

# Skill Routing

Load the narrowest matching skill from `.github/skills/` before relevant work:

| Work | Skill |
| --- | --- |
| Cinematic pacing, reveals, GSAP + ScrollTrigger + Lenis | cinematic-gsap-lenis-motion-system |
| React animation lifecycle, refs, SSR, contextSafe | gsap-react |
| Flip layout transitions and plugin registration | gsap-plugins |
| Editorial art direction, heritage typography, composition | frontend-design |
| Emotional structure, scene purpose, truthful narrative | storytelling |
| Component boundaries, explicit variants, local state | vercel-composition-patterns |
| Next.js/React data boundaries, waterfalls and bundles | vercel-react-best-practices |
| Optional adaptive video, Mux playback, current video documentation | mux-video |
| Small-screen baseline, touch and progressive enhancement | mobile-first-design |
| WCAG 2.2, keyboard, focus, captions and reduced motion | accessibility |
| Measured loading/runtime performance, images, fonts and media | performance |

These are on-demand instructions, not runtime dependencies. Do not load every skill for every edit. Do not install sibling skills simply because an upstream guide mentions them.

# Narrative And Art Direction

Preserve this sequence:

CARTA -> APERTURA -> SALUDO PERSONALIZADO -> VIDEO PERSONALIZADO -> HISTORIA -> 2008 -> 2022 -> 2026 -> INVITACION -> CEREMONIA -> DRESS CODE -> PUERTO VELERO -> 8 DE DICIEMBRE -> CONFIRMACION -> CIERRE.

For each scene, document its purpose, known content, user action, transition and static fallback before implementation. The chronology is factual, not a reason to invent conflict or romance copy. Guests can skip video and still reach event details and confirmation.

Direction: vintage Vogue editorial + heritage + luxury stationery + vintage boho chic + modern digital experience. Use the supplied invitation as the reference for materials, illustration, color and typography; do not replace it with a wedding template or copy Vogue branding/layouts.

"Every animation must have a narrative reason."

Use paper unfolding, letter opening, slow reveal, editorial transitions, mask/image reveals, cinematic pacing and subtle layered depth. No bounce, elastic easing, confetti, hearts, floating petals, random particles, excessive zoom/rotation, cursor decoration, or automatic section-by-section effects without purpose. Upstream samples are techniques, not approved content or layout.

# Motion Integration

Prefer GSAP + ScrollTrigger with @gsap/react and Flip only where layout actually changes. Flip animates layout states; it does not simulate paper folding by itself. Specify the paper mechanism separately, then use a scoped timeline for its physical-feeling motion.

Use one scroll system: native scrolling by default on touch; Lenis only if testing justifies it. Never combine Lenis and ScrollSmoother. Use one named ticker callback, synchronize ScrollTrigger, remove the callback and scroll listener, and destroy Lenis on cleanup. Do not paste anonymous global ticker/listener examples into React. Avoid global kill-all cleanup that affects unrelated scenes.

Use refs and scoped useGSAP/gsap.context. Keep DOM manipulation out of React-owned text unless a reversible technique preserves semantics and lifecycle. Refresh trigger positions after fonts, images, video dimensions or layout changes. Validate API/default claims in the version-matched official docs before copying examples, including Flip options and ScrollTrigger refreshPriority.

View Transitions are optional progressive enhancement. Check actual browser and installed React/Next.js support; do not assume experimental React ViewTransition is a stable API. Do not let View Transitions and GSAP animate the same property/element simultaneously.

# Architecture And Personalization

Target Next.js + React + TypeScript only after checking the available runtime and framework requirements. Use version-matched Next.js docs rather than the retired next-best-practices skill. Apply React 19-only patterns only to a compatible installed version. Do not add memoization or a state library without a measured need.

Use one reusable experience with allowlisted guest slugs and JSON-driven server-side selection. Keep private guest data outside public assets and client bundles. Send only the selected guest's safe fields to client components. Do not serialize or prefetch all guests' records, routes or videos. Invalid slugs return a controlled not-found state or an explicitly approved public fallback, never another guest's video.

A personalized URL is not authentication. If video/postwedding information must be private, agree on actual server-side authorization and signed, expiring media access. Do not claim that hiding a section or using an obscure slug protects it. No guest names in third-party analytics by default. Configure public WhatsApp preview metadata without exposing private media.

# Video Contract

For a small set of supplied MP4s, start with native HTML5 video; Mux/CDN is optional for justified adaptive streaming or delivery needs, not a mandatory service. Load the installed mux-video skill for Mux work; it retrieves current documentation, it does not install a player or create personalized videos.

Provide a matching responsive poster, fixed aspect ratio, playsInline, accessible controls, reviewed Spanish WebVTT captions/transcript, loading/buffering/error/retry states and fullscreen when supported. Do not crop important people. No forced autoplay with sound. Handle the play() promise and user-gesture restrictions on Safari and WhatsApp's in-app browser.

Only mount/select the current guest's media. Use preload="none" and attach the source on explicit play when zero early media requests are required; preload is only a browser hint. Never use autoplay to defeat lazy loading. Pause/release previous media and listeners on route change. Verify the network has no requests for other guests' media. Optimize a derivative, not the supplied master: compatible codec, reasonable bitrate/resolution, fast-start MP4 or adaptive streaming when warranted. Do not force heavy scroll-scrubbing onto spoken guest videos.

Reference documentation, read on demand:
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- https://web.dev/articles/lazy-loading-video
- https://www.mux.com/docs/guides/player-advanced-usage.md
- https://www.mux.com/docs/guides/player-integrate-in-your-webapp.md

# Mobile, Accessibility And Performance

Start at 320-390 CSS pixels; verify portrait/landscape, touch targets of at least 44 CSS pixels, safe areas, dynamic browser chrome, long personalized names, text zoom and keyboard operation. Keep every narrative chapter and essential action available on mobile. Breakpoints follow content. Do not add a hamburger menu merely because a skill's sample has one. Use rem-based typography without viewport-scaled font sizing or negative letter spacing.

Reduced motion must preserve the full experience: static paper state, immediate readable content, no parallax, pinning traps, smooth-scroll layer or autoplay decoration. React to preference changes while the page is open; CSS alone does not stop GSAP. Manage focus on opening and revealing content, preserve semantic headings and allow skipping the opening/video. Test keyboard and screen-reader paths as well as browser-emulated reduced motion.

Use responsive images, reserved dimensions, optimized fonts, lazy below-fold media and conditional motion/player bundles. Preload only proven critical assets, never all personalized media. Accessibility and readable content take priority over motion samples. Calibrate initial transfer budgets to the chosen stack; a mobile skill's generic 500 KB or 100 KB budget is not a universal gate.

Target Core Web Vitals at field p75: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1. Lab traces and TBT are diagnostics, not proof of field INP. Before launch, check representative guest routes on mobile/desktop, reduced motion, no-JS/static fallback, error states, private-data boundaries and real-device video playback. Do not claim these checks have run during skills installation.

# Facts To Confirm Later

The source shows 7 December and 15:45; the planning document includes 16:00 for the ceremony and questions midnight notation. The latest sequence separately includes the 8 December chapter. Confirm event times, final wording and who may access the private postwedding before coding those facts. Do not silently reconcile them or treat the 8 December chapter as a replacement wedding date.