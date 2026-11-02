"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { StoriesContent, StorySlide } from "@/lib/stories";
import { assetPath } from "@/lib/asset-path";
import styles from "./LoveIssue.module.css";

gsap.registerPlugin(useGSAP);

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = matchMedia(reducedQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function subscribeSharing() { return () => {}; }

function StoryPhoto({ source, alt, className }: { source: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <figure className={className}>
      <Image src={assetPath(source)} alt={alt} fill sizes="(min-width: 768px) 400px, 94vw"
        loading="lazy" data-story-photo onError={() => {
          console.error("Story image failed to load:", source);
          setFailed(true);
        }} />
    </figure>
  );
}

function StoryPage({ content, slide, active = true }: { content: StoriesContent; slide: StorySlide; active?: boolean }) {
  return (
    <>
      {slide.id === "cover" ? (
        <div className={styles.cover}>
          <h3 className={styles.masthead} aria-label={content.title} data-story-reveal data-story-title>
            {content.title.split(" ").map((word, i) => <span key={`${word}-${i}`}>{word}</span>)}
          </h3>
          <p className={styles.special} data-story-reveal>{content.specialEdition}</p>
          <p className={styles.coverSubtitle} data-story-reveal>{content.subtitle}</p>
          <span className={styles.rule} data-story-reveal aria-hidden="true" />
          <div className={styles.publication} data-story-reveal><span>{content.volume}</span><span>{content.number}</span></div>
          <p className={styles.colophon} data-story-reveal>{content.colophon}</p>
          <p className={styles.coverDedication} data-story-reveal>Para {content.recipient}</p>
        </div>
      ) : null}
      {slide.id === "history" ? (
        <div className={styles.history}>
          <span className={styles.largeQuote} aria-hidden="true">“</span>
          {slide.lines.map((line) => <p key={line} data-story-reveal>{line}</p>)}
          <p className={styles.signature} data-story-reveal>{content.couple}</p>
          {active && content.historyPhoto ? <StoryPhoto source={content.historyPhoto} alt="Una memoria de Luis y Marie."
            className={styles.historyPhoto} /> : null}
        </div>
      ) : null}
      {slide.id === "family" ? (
        <div className={styles.family}>
          <p className={styles.editionTitle} data-story-reveal>{content.title}</p>
          <p className={styles.special} data-story-reveal>{content.edition}</p>
          <span className={styles.rule} aria-hidden="true" data-story-reveal />
          <p className={styles.familyLabel} data-story-reveal>{content.personalizationLabel}</p>
          <h3 className={styles.familyName} data-story-reveal>{content.recipient}</h3>
          <p className={styles.cupos} data-story-reveal>{content.seats}</p>
          <div className={styles.publication} data-story-reveal><span>{content.volume}</span><span>{content.number}</span></div>
        </div>
      ) : null}
      {slide.id === "moment" ? (
        <div className={styles.moment}>
          <p className={styles.momentHeading} data-story-reveal>{slide.lines[0]}</p>
          {active && content.photo ? <StoryPhoto source={content.photo} alt={content.photoAlt} className={styles.photoFrame} /> : null}
          <span className={styles.momentMonogram} aria-hidden="true" data-story-reveal>L &amp; M</span>
          <p className={styles.momentFootnote} data-story-reveal>{slide.lines[1]}</p>
        </div>
      ) : null}
      {slide.id === "message" ? (
        <div className={styles.messageEditorial}>
          <p className={styles.special} data-story-reveal>{content.messageHeading}</p>
          <span className={styles.rule} aria-hidden="true" data-story-reveal />
          <p className={styles.signoff} data-story-reveal>{content.messageSignoff}</p>
          <h3 className={styles.messageSignature} data-story-reveal>{content.couple}</h3>
        </div>
      ) : null}
      {slide.id === "closing" ? (
        <div className={styles.closing}>
          <p className={styles.special} data-story-reveal>El encuentro</p>
          <h3 data-story-reveal>{content.couple}</h3>
          <p className={styles.date} data-story-reveal>{content.date}</p>
          <p className={styles.colophon} data-story-reveal>{content.location}</p>
          <span className={styles.rule} aria-hidden="true" data-story-reveal />
          <p className={styles.closingNote} data-story-reveal>{slide.lines[0]}</p>
          <p className={styles.editionTitle} data-story-reveal>{content.title}</p>
          <p className={styles.hashtag} data-story-reveal>{content.hashtag}</p>
        </div>
      ) : null}
    </>
  );
}

export default function LoveIssue({ content }: { content: StoriesContent }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [automaticChoice, setAutomaticChoice] = useState(true);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [inView, setInView] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [videoIntent, setVideoIntent] = useState(false);
  const [mediaState, setMediaState] = useState<"loading" | "ready" | "playing" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [shareFallback, setShareFallback] = useState(false);
  const [localShareUrl, setLocalShareUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const panels = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsed = useRef(0);
  const gesture = useRef<{ id: number; x: number; y: number; time: number } | null>(null);
  const sequence = useRef<gsap.core.Timeline | null>(null);
  const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia(reducedQuery).matches, () => false);
  const nativeSharing = useSyncExternalStore(subscribeSharing, () => typeof navigator.share === "function", () => true);
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
  const automatic = automaticChoice && !reduced;
  const suspended = paused || holding || (!inView && !isFullscreen) || !visible || keyboardFocus;
  const slide = content.slides[index];
  const videoActive = started && slide.id === "message" && Boolean(content.video);
  const showVideo = videoActive && mediaState !== "error";
  const last = index === content.slides.length - 1;
  const videoFailed = mediaState === "error";
  const wantsVideo = !paused && (automatic || videoIntent);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.3), { threshold: [0, 0.3] });
    observer.observe(screen.current ?? container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const changed = () => setIsFullscreen(document.fullscreenElement === screen.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  useEffect(() => {
    const video = player.current;
    return () => {
      video?.pause();
      video?.removeAttribute("src");
      video?.load();
    };
  }, [showVideo]);

  useEffect(() => {
    const video = player.current;
    if (!video || !showVideo) return;
    const update = () => {
      for (const track of Array.from(video.textTracks)) track.mode = captionsEnabled ? "showing" : "hidden";
    };
    update();
    video.textTracks.addEventListener("addtrack", update);
    const track = video.querySelector("track");
    track?.addEventListener("load", update);
    return () => {
      video.textTracks.removeEventListener("addtrack", update);
      track?.removeEventListener("load", update);
    };
  }, [showVideo, captionsEnabled]);

  useGSAP(() => {
    if (!started || reduced) return;
    const active = panels.current?.querySelector<HTMLElement>(`[data-story-id="${slide.id}"]`);
    if (!active) return;
    const timeline = gsap.timeline({ paused: suspended });
    sequence.current = timeline;
    if (slide.id === "cover") {
      timeline.from(active.querySelector("[data-story-texture]"), { opacity: 0, duration: 0.7 }, 0)
        .from(active.querySelector("[data-story-ornament]"), { opacity: 0, scale: 0.98, duration: 0.7, ease: "power3.out" }, 0.15);
    }
    timeline.from(active, { opacity: 0, x: 12, duration: 0.7, ease: "power3.out" }, 0);
    const reveals = active.querySelectorAll("[data-story-reveal]");
    if (reveals.length) timeline.from(reveals, {
      opacity: 0, y: 16, duration: 0.7, stagger: 0.16, ease: "power3.out",
    }, slide.id === "cover" ? 0.4 : 0.12);
    const title = active.querySelector("[data-story-title]");
    if (title) timeline.from(title, { letterSpacing: "0.08em", duration: 1.05, ease: "power3.out" }, 0.22);
    const photo = active.querySelector("[data-story-photo]");
    if (photo) timeline.from(photo, { scale: 1.03, duration: 3, ease: "power2.inOut" }, 0.3);
    return () => { sequence.current = null; };
  }, { scope: root, dependencies: [index, started, reduced], revertOnUpdate: true });

  useEffect(() => {
    if (suspended) sequence.current?.pause();
    else sequence.current?.resume();
  }, [suspended]);

  useEffect(() => {
    const video = player.current;
    if (!videoActive || !video || videoFailed) return;
    let cancelled = false;
    if (suspended || (!automatic && !videoIntent)) video.pause();
    else {
      video.play().catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        setVideoIntent(false);
        setPaused(true);
        if (error instanceof DOMException && error.name === "NotAllowedError" && !video.error) {
          setNotice("La reproducción automática no está disponible. Pulsa Reproducir video para escuchar el mensaje.");
        } else {
          setMediaState("error");
          elapsed.current = 0;
          setNotice("El mensaje no pudo cargarse. Puedes reintentar o continuar a la invitación.");
        }
      });
    }
    return () => { cancelled = true; video.pause(); };
  }, [videoActive, suspended, automatic, videoIntent, videoFailed]);

  useEffect(() => {
    if (!started || suspended || (!automatic && (!showVideo || mediaState !== "playing"))) return;
    const bar = bars.current[index];
    let frame = 0;
    let previous = performance.now();
    let finished = false;
    const tick = (now: number) => {
      let progress = Math.min(1, elapsed.current / slide.duration);
      const video = player.current;
      if (showVideo) {
        progress = video && Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration : 0;
      } else if (automatic) {
        elapsed.current += (now - previous) / 1000;
        progress = Math.min(1, elapsed.current / slide.duration);
        if (progress >= 1) {
          finished = true;
          if (!last) {
            elapsed.current = 0;
            setIndex((current) => current + 1);
          }
        }
      }
      previous = now;
      if (bar) bar.style.transform = `scaleX(${progress})`;
      if (!finished) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, started, suspended, automatic, showVideo, mediaState, slide.duration, last]);

  function go(next: number) {
    const target = Math.max(0, Math.min(content.slides.length - 1, next));
    if (target === index) return;
    elapsed.current = 0;
    setIndex(target);
    setVideoIntent(false);
    setMediaState("loading");
    for (const [i, bar] of bars.current.entries()) {
      if (bar) bar.style.transform = `scaleX(${i < target ? 1 : 0})`;
    }
    setNotice("");
    setShareFallback(false);
    if (panels.current?.contains(document.activeElement)) screen.current?.focus({ preventScroll: true });
  }

  function begin() {
    setStarted(true);
    setPaused(false);
    if (reduced) setAutomaticChoice(false);
    screen.current?.focus({ preventScroll: true });
    screen.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }

  function mediaFailed() {
    console.error("Story video failed to load:", content.video?.source);
    setMediaState("error");
    elapsed.current = 0;
    setNotice("El mensaje no pudo cargarse. Puedes reintentar o continuar a la invitación.");
  }

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (screen.current?.requestFullscreen) await screen.current.requestFullscreen();
      else setNotice("Este navegador no permite pantalla completa. Puedes recorrer la edición aquí.");
    } catch {
      setNotice("No se pudo abrir pantalla completa. Puedes seguir recorriendo la edición aquí.");
    }
  }

  async function share() {
    const url = content.shareUrl ?? `${location.origin}${location.pathname}`;
    setLocalShareUrl(url);
    if (!navigator.share) {
      setShareFallback(true);
      setNotice("Puedes compartir por WhatsApp o copiar el enlace de tu carta.");
      return;
    }
    try {
      await navigator.share({ title: content.title, text: content.shareText, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareFallback(true);
      setNotice("No se pudo abrir el menú de compartir. Usa las opciones de abajo.");
    }
  }

  async function copy() {
    setLocalShareUrl(content.shareUrl ?? `${location.origin}${location.pathname}`);
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(content.shareUrl ?? `${location.origin}${location.pathname}`);
      setNotice("Enlace copiado.");
    } catch {
      setShareFallback(true);
      setNotice("No se pudo copiar automáticamente. Selecciona y copia el enlace que aparece debajo.");
    }
  }

  async function openInvitation() {
    setPaused(true);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        setNotice("Sal de pantalla completa para ver la invitación.");
        return;
      }
    }
    history.replaceState(null, "", "#invitacion");
    document.getElementById("invitacion-heading")?.focus({ preventScroll: true });
    document.getElementById("invitacion")?.scrollIntoView({ behavior: "instant", block: "start" });
  }

  const shareUrl = content.shareUrl ?? localShareUrl;
  return (
    <div ref={root} className={styles.issue} data-love-issue data-started={started} data-story-index={index}
      data-automatic={automatic} data-suspended={suspended} data-holding={holding}>
      <div className={styles.issueIntro}>
        <h2 id="video-heading">{content.title}</h2>
        <p>{content.subtitle}</p>
        <p className={styles.editionFor}>Edición dedicada a {content.recipient}</p>
        <a href="#invitacion" className={styles.skip}>Ir directamente a la invitación</a>
      </div>
      <div ref={screen} className={styles.screen} tabIndex={0} role="region" aria-roledescription="historias"
        aria-label={`${content.title}, edición para ${content.recipient}`} data-lenis-prevent
        onKeyDown={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest("button, a, input")) return;
          if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
          if (event.key === " ") { event.preventDefault(); if (!started) begin(); else setPaused((value) => !value); }
        }}
        onFocusCapture={(event) => {
          if (event.target === screen.current) setKeyboardFocus(false);
          else if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false);
        }}>
        <div className={styles.phone}>
          <div className={styles.storyTop}>
            <ol className={styles.progress} aria-label="Progreso de la edición">
              {content.slides.map((item, i) => (
                <li key={item.id} aria-current={index === i ? "step" : undefined} aria-label={`Historia ${i + 1}: ${item.label}`}>
                  <span ref={(element) => { bars.current[i] = element; }} style={{ transform: `scaleX(${i < index ? 1 : 0})` }} />
                </li>
              ))}
            </ol>
            <div className={styles.topLine}>
              <span>{content.title}</span>
              <button type="button" aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver stories en pantalla completa"} onClick={fullscreen}>⛶</button>
            </div>
          </div>
          <div className={styles.surface}
            onPointerDown={(event) => {
              if (!started || !event.isPrimary || event.button !== 0 || (event.target instanceof HTMLElement && event.target.closest("button, a"))) return;
              gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
              event.currentTarget.setPointerCapture(event.pointerId);
              setHolding(true);
            }}
            onPointerUp={(event) => {
              const start = gesture.current;
              if (!start || start.id !== event.pointerId) return;
              gesture.current = null;
              setHolding(false);
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
              else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && performance.now() - start.time < 250) {
                const bounds = event.currentTarget.getBoundingClientRect();
                go(index + (event.clientX - bounds.left < bounds.width / 2 ? -1 : 1));
              }
            }}
            onPointerCancel={(event) => {
              if (gesture.current?.id === event.pointerId) { gesture.current = null; setHolding(false); }
            }}
            onLostPointerCapture={(event) => {
              if (gesture.current?.id === event.pointerId) { gesture.current = null; setHolding(false); }
            }}>
            <div ref={panels} className={styles.pages}>
              {content.slides.map((item, i) => (
                <article key={item.id} data-story-id={item.id} hidden={index !== i} inert={index !== i}
                  className={styles.page} aria-label={item.label}>
                  <span className={styles.paperTexture} data-story-texture aria-hidden="true" />
                  <span className={styles.cornerFrame} data-story-ornament aria-hidden="true"><i /><i /><i /><i /></span>
                  {item.id !== "message" || !showVideo ? <StoryPage content={content} slide={item} active={started && index === i} /> : null}
                  {item.id === "message" && showVideo && content.video ? (
                    <div className={styles.videoStory}>
                      <video ref={player} src={assetPath(content.video.source)} muted={muted} playsInline
                        preload="none" loop={false} poster={content.video.poster ? assetPath(content.video.poster) : undefined}
                        aria-label={`Mensaje ${content.video.personalized ? "personalizado" : "general"} de ${content.couple}`}
                        onLoadedMetadata={() => setMediaState("ready")}
                        onPlaying={() => { setMediaState("playing"); setNotice(""); }}
                        onWaiting={() => setMediaState("loading")}
                        onStalled={() => setNotice("La conexión está tardando. Puedes pausar el mensaje o continuar con la invitación.")}
                        onError={mediaFailed}
                        onEnded={() => { if (automatic && !suspended) go(index + 1); }}>
                        {content.video.captions ? <track kind="captions" src={assetPath(content.video.captions)} srcLang="es" label="Español" default /> : null}
                      </video>
                      <div className={styles.videoCaption}>
                        <p>{content.video.personalized ? `Para ${content.recipient}` : "Un mensaje de Luis & Marie"}</p>
                        <div className={styles.videoControls}>
                          <button onClick={() => {
                            if (wantsVideo) { setVideoIntent(false); setPaused(true); }
                            else { setVideoIntent(true); setPaused(false); }
                          }}
                            aria-label={wantsVideo ? "Pausar video" : "Reproducir video"}>
                            {wantsVideo ? "Pausa" : "Play"}
                          </button>
                          <button onClick={() => setMuted((value) => !value)} aria-pressed={!muted}>
                            <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span><span className={styles.srOnly}>{muted ? "Activar sonido" : "Silenciar"}</span>
                          </button>
                          {content.video.captions ? <button aria-label="Subtítulos" aria-pressed={captionsEnabled}
                            onClick={() => setCaptionsEnabled((value) => !value)}>CC</button> : null}
                        </div>
                        {mediaState === "loading" ? <p role="status">Cargando el mensaje…</p> : null}
                      </div>
                    </div>
                  ) : null}
                  {item.id === "message" && videoFailed ? <button className={styles.retryButton} onClick={() => {
                    setMediaState("loading"); setPaused(false); setVideoIntent(true); setNotice("");
                  }}>Reintentar mensaje</button> : null}
                </article>
              ))}
            </div>
          </div>
          <div className={styles.bottomLine}>
            {last && started ? (
              <div className={styles.finalActions}>
                <a className={styles.primaryLink} href="#invitacion" onClick={(event) => {
                  event.preventDefault();
                  void openInvitation();
                }}>Ver la invitación</a>
                <button onClick={nativeSharing ? share : copy}>{nativeSharing ? "Compartir" : "Copiar enlace"}</button>
              </div>
            ) : null}
            {!started ? <button className={styles.startButton} onClick={begin}>Abrir mi edición</button> : (
              <div className={styles.navigation}>
                <button aria-label="Historia anterior" disabled={index === 0} onClick={() => go(index - 1)}>‹</button>
                <span aria-live="polite" aria-atomic="true">{index + 1} / {content.slides.length}<span className={styles.srOnly}> · {slide.label}</span></span>
                <button aria-label={paused ? "Continuar stories" : "Pausar stories"} onClick={() => setPaused((value) => !value)}>{paused ? "Continuar" : "Pausa"}</button>
                <button aria-label="Historia siguiente" disabled={last} onClick={() => go(index + 1)}>›</button>
              </div>
            )}
          </div>
        </div>
      <div className={styles.readerControls}>
        <label><input type="checkbox" checked={automatic} disabled={reduced}
          onChange={(event) => setAutomaticChoice(event.target.checked)} /> Avance automático</label>
        <p>{reduced ? "Movimiento reducido: recorre la edición a tu ritmo." : "Toca los lados para pasar de página. Mantén presionado para pausar."}</p>
      </div>
      {last && started ? (
        <button className={styles.repeatButton} onClick={() => { go(0); setPaused(false); }}>Volver a recorrer la edición</button>
      ) : null}
      <p className={styles.notice} role="status">{notice}</p>
      {shareFallback ? (
        <div className={styles.shareOptions}>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${content.shareText}\n${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">Compartir por WhatsApp</a>
          <button onClick={copy}>Copiar enlace</button>
          <label>Enlace de tu carta<input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /></label>
        </div>
      ) : null}
      {videoActive && content.video?.transcript ? <details className={styles.transcript}><summary>Leer el mensaje</summary><p>{content.video.transcript}</p></details> : null}
      </div>
      <noscript>
        <style>{'[data-love-issue] > [role="region"] { display: none; }'}</style>
        <div className={styles.staticEdition}>
          <p>Tu edición en formato de lectura, sin reproducción automática.</p>
          {content.slides.map((item) => (
            <div key={item.id}>
              <h3>{item.label}</h3>
              <StoryPage content={content} slide={item} />
              {item.id === "message" && content.video ? <a href={assetPath(content.video.source)}>Abrir mensaje en video</a> : null}
            </div>
          ))}
          <a href="#invitacion">Ver la invitación</a>
        </div>
      </noscript>
    </div>
  );
}
