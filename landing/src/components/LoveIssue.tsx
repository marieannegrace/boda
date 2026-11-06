"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { StoriesContent, StorySlide, StoryPhoto as Photo } from "@/lib/stories";
import { assetPath } from "@/lib/asset-path";
import { photoSizes, photoSrcSet, prepareImage, prepareVideoStart } from "@/lib/story-preload";
import { useHistoryJourney } from "./InvitationGate";
import { BotanicalAtmosphere } from "./BotanicalAtmosphere";
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

function StoryPhoto({ source, alt, className, photo }: { source: string; alt: string; className: string; photo?: Photo }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) return null;
  return (
    <figure className={className} data-photo-file={photo?.file} data-treatment={photo?.treatment ?? "editorial"}>
      <picture>
        {photo ? <source srcSet={photoSrcSet(photo)} sizes={photoSizes} type="image/webp" /> : null}
        <Image src={assetPath(source)} alt={alt} fill sizes={photoSizes}
        style={{ objectFit: photo?.treatment === "hero" ? "cover" : "contain",
          objectPosition: `${photo?.focalPoint.x ?? 50}% ${photo?.focalPoint.y ?? 50}%` }}
        loading="eager" data-story-photo onLoad={() => setLoaded(true)} onError={() => {
          console.error("Story image failed to load:", source);
          setFailed(true);
        }} />
      </picture>
      {!loaded ? <span className={styles.imageLoading} data-image-loading role="status">El recuerdo está llegando…</span> : null}
    </figure>
  );
}

function StoryPage({ content, slide, active = true, historyIndex = 0 }: {
  content: StoriesContent; slide: StorySlide; active?: boolean; historyIndex?: number;
}) {
  const historyPage = content.historyPages[historyIndex];
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
      {slide.id === "history" && historyPage.kind === "intro" ? (
        <div className={styles.history}>
          <h3 className={styles.historyLabel}>Nuestra historia contigo</h3>
          <span className={styles.largeQuote} aria-hidden="true">“</span>
          {slide.lines.map((line) => <p key={line} data-story-reveal>{line}</p>)}
          <p className={styles.signature} data-story-reveal>{content.couple}</p>
          {active && content.historyPhoto ? <StoryPhoto source={content.historyPhoto} alt="Una memoria de Luis y Marie."
            className={styles.historyPhoto} /> : null}
        </div>
      ) : null}
      {slide.id === "history" && historyPage.kind === "photos" ? (
        <div className={styles.historySpread} data-photo-count={historyPage.photos.length}>
          <h3 className={styles.historyLabel}>Nuestra historia contigo</h3>
          <div className={styles.historyImages} data-layout={historyPage.photos.length === 2
            && historyPage.photos.every((photo) => photo.width < photo.height * 0.9) ? "paired-portraits" : "stacked"}>
            {active ? historyPage.photos.map((photo) => <StoryPhoto key={photo.file} source={photo.source}
              alt={photo.alt} photo={photo} className={styles.memoryPhoto} />) : null}
          </div>
          {historyIndex === 1 ? <p className={styles.memoryCaption}>{content.historyReflection}</p> : null}
          <p className={styles.memoryNumber}>{historyIndex} / {content.historyPages.length - 1}</p>
        </div>
      ) : null}
      {slide.id === "history" && historyPage.kind === "reflection" ? (
        <div className={styles.historyReflection}>
          <span className={styles.rule} aria-hidden="true" />
          <p>{content.historyReflection}</p>
          <p className={styles.signature}>{content.couple}</p>
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
          {active && (content.momentPhoto || content.photo) ? <StoryPhoto source={content.momentPhoto?.source ?? content.photo!}
            alt={content.momentPhoto?.alt ?? content.photoAlt} photo={content.momentPhoto ?? undefined} className={styles.photoFrame} /> : null}
          <span className={styles.momentMonogram} aria-hidden="true" data-story-reveal>L &amp; M</span>
          <p className={styles.momentFootnote} data-story-reveal>{slide.lines[1]}</p>
        </div>
      ) : null}
      {slide.id === "message" ? (
        <div className={styles.messageEditorial}>
          <p className={styles.special} data-story-reveal>{content.messageHeading}</p>
          {active && (content.messagePhoto || content.photo) ? (
            <StoryPhoto source={content.messagePhoto?.source ?? content.photo!} alt={content.messagePhoto?.alt ?? content.photoAlt}
              photo={content.messagePhoto ?? undefined} className={styles.messagePhoto} />
          ) : <span className={styles.rule} aria-hidden="true" data-story-reveal />}
          {!content.messagePhoto && !content.photo ? <p className={styles.signoff} data-story-reveal>{content.messageSignoff}</p> : null}
          <h3 className={content.messagePhoto || content.photo ? styles.photoSignature : styles.messageSignature} data-story-reveal>{content.couple}</h3>
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
          <p className={styles.closingBlessing} data-story-reveal>{slide.lines[1]}</p>
          <p className={styles.editionTitle} data-story-reveal>{content.title}</p>
          <p className={styles.hashtag} data-story-reveal>{content.hashtag}</p>
        </div>
      ) : null}
    </>
  );
}

export default function LoveIssue({ content }: { content: StoriesContent }) {
  const [started, setStarted] = useState(false);
  const [entryRequested, setEntryRequested] = useState(false);
  const [index, setIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [specialStarted, setSpecialStarted] = useState(false);
  const journey = useHistoryJourney();
  const [automaticChoice, setAutomaticChoice] = useState(true);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [inView, setInView] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [videoIntent, setVideoIntent] = useState(true);
  const [videoBlocked, setVideoBlocked] = useState(false);
  const [prepared, setPrepared] = useState<string[]>([]);
  const [preparationFailed, setPreparationFailed] = useState(false);
  const [mediaState, setMediaState] = useState<"loading" | "ready" | "playing" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [shareFallback, setShareFallback] = useState(false);
  const [localShareUrl, setLocalShareUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicAttached, setMusicAttached] = useState(false);
  const [musicFailed, setMusicFailed] = useState(false);
  const [musicVolume, setMusicVolume] = useState(content.musicVolume);
  const [musicFallback, setMusicFallback] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [interaction, setInteraction] = useState(0);
  const soundPreference = useRef<boolean | null>(null);
  const musicPositioned = useRef(false);
  const musicFadingIn = useRef(false);
  const preparedVideos = useRef(new Set<string>());
  const restoredSound = useRef<boolean | null>(null);
  const audioGraph = useRef<{ context: AudioContext; gain: GainNode } | null>(null);
  const musicPlayer = useRef<HTMLAudioElement>(null);
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
  const currentVideo = content.videos[videoIndex];
  const videoActive = started && slide.id === "message" && Boolean(currentVideo);
  const specialIntro = videoActive && currentVideo.kind === "special" && !specialStarted;
  const showVideo = videoActive && !specialIntro && mediaState !== "error";
  const last = index === content.slides.length - 1;
  const videoFailed = mediaState === "error";
  const wantsVideo = !paused && videoIntent && !videoBlocked;
  const historyCount = content.historyPages.length;
  const inHistory = slide.id === "history";
  const musicDucked = showVideo && mediaState === "playing" && wantsVideo && !suspended;
  const effectiveVolume = musicEnabled ? musicVolume * (musicDucked ? 0.02 : 1) : 0;
  const musicSource = musicFallback ? content.musicFallback : content.music;
  const firstPhoto = content.historyPages.find((page) => page.photos.length)?.photos[0] ?? content.momentPhoto;
  const firstVideo = content.videos[0];
  const essentialCount = 1 + (firstPhoto ? 1 : 0) + (musicSource ? 1 : 0)
    + (firstVideo?.poster ? 1 : 0) + (firstVideo ? 1 : 0);
  const coreReady = prepared.includes("cover") && (!firstPhoto || prepared.includes("photo"));

  useEffect(() => {
    if (!entryRequested || !coreReady || started) return;
    const frame = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(frame);
  }, [entryRequested, coreReady, started]);

  function rememberSound(sound: boolean, volume = musicVolume) {
    try { sessionStorage.setItem("love-issue-sound-v1", JSON.stringify({ sound, volume })); }
    catch (error) { console.warn("Sound preference cannot be retained in this session:", error); }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved: unknown = JSON.parse(sessionStorage.getItem("love-issue-sound-v1") ?? "null");
        if (typeof saved === "object" && saved !== null && "sound" in saved && typeof saved.sound === "boolean"
          && "volume" in saved && typeof saved.volume === "number" && saved.volume >= 0 && saved.volume <= 1) {
          restoredSound.current = saved.sound;
          soundPreference.current = saved.sound;
          setMusicVolume(saved.volume);
          setStarted(true);
        }
      } catch (error) { console.warn("Saved sound preference could not be read:", error); }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const controller = new AbortController();
    const done = (key: string) => setPrepared((items) => items.includes(key) ? items : [...items, key]);
    const failed = (error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("Edition preparation failed:", error);
      setPreparationFailed(true);
    };
    const typography = root.current?.querySelectorAll<HTMLElement>("[data-welcome] h3 > span, [data-welcome] p, [data-welcome] button") ?? [];
    void Promise.all(Array.from(typography).map((element) => {
      const style = getComputedStyle(element);
      return document.fonts.load(`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`);
    })).then(() => done("cover"), failed);
    if (firstPhoto) void prepareImage(firstPhoto.source, controller.signal, firstPhoto).then(() => done("photo"), failed);
    if (firstVideo?.poster) void prepareImage(firstVideo.poster, controller.signal).then(() => done("poster"), failed);
    if (firstVideo && !preparedVideos.current.has(firstVideo.source)) {
      preparedVideos.current.add(firstVideo.source);
      void prepareVideoStart(firstVideo.source, controller.signal).then((supported) => {
        if (supported) done("video");
        else { preparedVideos.current.delete(firstVideo.source); setPreparationFailed(true); }
      }, (error: unknown) => { preparedVideos.current.delete(firstVideo.source); failed(error); });
    }
    return () => controller.abort();
  }, [inView, firstPhoto, firstVideo]);

  useEffect(() => {
    if (!inView || !started || showVideo) return;
    const upcoming = specialIntro ? currentVideo : index >= 2 ? firstVideo : null;
    if (!upcoming || preparedVideos.current.has(upcoming.source)) return;
    const controller = new AbortController();
    if (upcoming.poster) void prepareImage(upcoming.poster, controller.signal).catch((error: unknown) => {
      if (!controller.signal.aborted) console.error("Upcoming message poster preparation failed:", error);
    });
    preparedVideos.current.add(upcoming.source);
    void prepareVideoStart(upcoming.source, controller.signal).then((supported) => {
      if (!supported) preparedVideos.current.delete(upcoming.source);
    }, (error: unknown) => {
      preparedVideos.current.delete(upcoming.source);
      if (!controller.signal.aborted) console.error("Upcoming message preparation failed:", error);
    });
    return () => controller.abort();
  }, [inView, started, showVideo, specialIntro, currentVideo, firstVideo, index]);

  useEffect(() => {
    if (!specialIntro || suspended) return;
    const timer = window.setTimeout(() => {
      setSpecialStarted(true);
      setVideoIntent(true);
      setMediaState("loading");
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [specialIntro, suspended]);

  function recordInteraction() {
    setHelpVisible(false);
    setInteraction((value) => value + 1);
  }

  useEffect(() => {
    if (!inView || !visible) return;
    const timer = window.setTimeout(() => setHelpVisible(true), 3500);
    return () => window.clearTimeout(timer);
  }, [inView, visible, index, historyIndex, videoIndex, interaction]);

  useEffect(() => {
    const audio = musicPlayer.current;
    return () => {
      audio?.pause();
      audio?.removeAttribute("src");
      audio?.load();
      const graph = audioGraph.current;
      if (graph) void graph.context.close().catch((error: unknown) => console.error("Music context cleanup failed:", error));
    };
  }, []);

  const musicError = useCallback((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") return;
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      setMusicEnabled(false);
      setNotice("Tu edición está lista. Pulsa Activar música para acompañarla con sonido.");
    } else if (content.musicFallback && !musicFallback) {
      console.warn("Trying compatible story audio:", error);
      musicPositioned.current = false;
      setMusicFallback(true);
      setNotice("La música usará el formato alternativo de este navegador.");
    } else {
      console.error("Story music playback failed:", error);
      setMusicFailed(true);
      setMusicEnabled(false);
      setNotice("No se pudo cargar la música. Puedes continuar recorriendo la edición.");
    }
  }, [content.musicFallback, musicFallback]);

  function activateMusic() {
    const audio = musicPlayer.current;
    if (!audio || !content.music || musicFailed) return;
    let source = musicSource;
    const audioType = (file: string) => file.endsWith(".weba") ? 'audio/webm; codecs="opus"'
      : file.endsWith(".m4a") ? 'audio/mp4; codecs="mp4a.40.2"' : "audio/mpeg";
    if (source && !audio.canPlayType(audioType(source))) {
      if (!content.musicFallback || !audio.canPlayType(audioType(content.musicFallback))) {
        setMusicFailed(true);
        setNotice("Este navegador no admite el formato de la música. Puedes recorrer la edición sin música.");
        return;
      }
      setMusicFallback(true);
      source = content.musicFallback;
    }
    if (!source) return;
    try {
      if (!audioGraph.current) {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = 0;
        context.createMediaElementSource(audio).connect(gain).connect(context.destination);
        audioGraph.current = { context, gain };
      }
      void audioGraph.current.context.resume().catch(musicError);
      if (!audio.getAttribute("src")) audio.src = assetPath(source);
      if (!musicPositioned.current && audio.readyState >= 1) {
        audio.currentTime = Math.min(10, Math.max(0, audio.duration - 0.1));
        musicPositioned.current = true;
      }
      void audio.play().catch(musicError);
      setMusicEnabled(true);
    } catch (error) { musicError(error); }
  }

  useEffect(() => {
    const graph = audioGraph.current;
    if (!graph) return;
    const now = graph.context.currentTime;
    graph.gain.gain.cancelScheduledValues(now);
    graph.gain.gain.setValueAtTime(graph.gain.gain.value, now);
    graph.gain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.35);
  }, [effectiveVolume]);

  useEffect(() => {
    if (!started || !inView) return;
    const next = inHistory ? content.historyPages[historyIndex + 1]?.photos ?? []
      : index === 2 && content.momentPhoto ? [content.momentPhoto] : [];
    const controller = new AbortController();
    for (const photo of next) void prepareImage(photo.source, controller.signal, photo).catch((error: unknown) => {
      if (!controller.signal.aborted) console.error("Upcoming photograph preparation failed:", error);
    });
    return () => controller.abort();
  }, [started, inView, inHistory, historyIndex, index, content.historyPages, content.momentPhoto]);

  useEffect(() => {
    const audio = musicPlayer.current;
    if (!audio || musicFailed) return;
    if (suspended || (!started && !entryRequested)) {
      audio.pause();
      return;
    }
    if (!musicEnabled) {
      const timer = window.setTimeout(() => audio.pause(), 350);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    audio.play().catch((error: unknown) => {
      if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
      musicError(error);
    });
    return () => { cancelled = true; };
  }, [musicEnabled, musicFailed, suspended, started, entryRequested, musicFallback, musicError]);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => {
      const active = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      setInView(active);
      if (active) setMusicAttached(true);
    }, { threshold: [0, 0.3] });
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
  }, [showVideo, videoIndex]);

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
  }, [showVideo, videoIndex, captionsEnabled]);

  useGSAP(() => {
    if (reduced) return;
    const active = started ? panels.current?.querySelector<HTMLElement>(`[data-story-id="${slide.id}"]`)
      : root.current?.querySelector<HTMLElement>("[data-welcome]");
    if (!active) return;
    const timeline = gsap.timeline({ paused: suspended });
    sequence.current = timeline;
    const botanical = active.querySelectorAll("[data-botanical-motif]");
    if (botanical.length) {
      const desktop = matchMedia("(min-width: 960px) and (hover: hover) and (pointer: fine)").matches;
      timeline.from(botanical, {
        opacity: 0, y: (i) => desktop ? (i === 0 ? 6 : -4) : 0,
        duration: 1.6, ease: "power3.out", stagger: 0.12,
      }, 0);
    }
    if (!started) return () => { sequence.current = null; };
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
    const photo = active.querySelector('[data-treatment="hero"] [data-story-photo]');
    if (photo) timeline.from(photo, { scale: 1.02, duration: 3, ease: "power2.inOut" }, 0.3);
    return () => { sequence.current = null; };
  }, { scope: root, dependencies: [index, historyIndex, videoIndex, specialStarted, started, reduced], revertOnUpdate: true });

  useEffect(() => {
    if (suspended) sequence.current?.pause();
    else sequence.current?.resume();
  }, [suspended]);

  useEffect(() => {
    const video = player.current;
    if (!showVideo || !video || videoFailed) return;
    let cancelled = false;
    if (suspended || !videoIntent || videoBlocked) video.pause();
    else {
      video.play().catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        if (error instanceof DOMException && error.name === "NotAllowedError" && !video.error) {
          setVideoBlocked(true);
          setMediaState("ready");
          setNotice("Tu mensaje está listo. Pulsa Reproducir con sonido.");
        } else {
          setVideoIntent(false);
          setMediaState("error");
          elapsed.current = 0;
          setNotice("El mensaje no pudo cargarse. Puedes reintentar o continuar a la invitación.");
        }
      });
    }
    return () => { cancelled = true; video.pause(); };
  }, [showVideo, videoIndex, suspended, videoIntent, videoBlocked, videoFailed]);

  useEffect(() => {
    if (!started || suspended || specialIntro || (!automatic && (!showVideo || mediaState !== "playing"))) return;
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
        const photos = panels.current?.querySelectorAll<HTMLImageElement>(`[data-story-id="${slide.id}"] img`);
        if (!photos || Array.from(photos).every((photo) => photo.complete)) elapsed.current += (now - previous) / 1000;
        progress = Math.min(1, elapsed.current / slide.duration);
        if (progress >= 1) {
          finished = true;
          if (inHistory && historyIndex < historyCount - 1) {
            elapsed.current = 0;
            setHistoryIndex((current) => current + 1);
          } else if (!last) {
            if (inHistory) journey.finish();
            elapsed.current = 0;
            setIndex((current) => current + 1);
          }
        }
      }
      previous = now;
      if (bar) bar.style.transform = `scaleX(${inHistory ? (historyIndex + progress) / historyCount
        : videoActive ? (videoIndex + progress) / content.videos.length : progress})`;
      if (!finished) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, historyIndex, historyCount, inHistory, started, suspended, automatic, showVideo, specialIntro, mediaState, slide.id, slide.duration, last, journey, videoActive, videoIndex, content.videos.length]);

  function go(next: number) {
    recordInteraction();
    const target = Math.max(0, Math.min(content.slides.length - 1, next));
    if (target === index) return;
    player.current?.pause();
    setVideoBlocked(false);
    if (specialIntro && next > index) {
      setSpecialStarted(true); setVideoIntent(true); setPaused(false); setMediaState("loading");
      return;
    }
    if (videoActive && ((next > index && videoIndex < content.videos.length - 1) || (next < index && videoIndex > 0))) {
      elapsed.current = 0;
      setVideoIndex((value) => value + (next > index ? 1 : -1));
      setSpecialStarted(false);
      setVideoIntent(true);
      setMediaState("loading");
      setNotice("");
      return;
    }
    if (inHistory && ((next > index && historyIndex < historyCount - 1) || (next < index && historyIndex > 0))) {
      elapsed.current = 0;
      const page = historyIndex + (next > index ? 1 : -1);
      setHistoryIndex(page);
      if (bars.current[index]) bars.current[index]!.style.transform = `scaleX(${page / historyCount})`;
      return;
    }
    elapsed.current = 0;
    if (inHistory && next > index) journey.finish();
    const nextHistory = target === 1 && next < index ? historyCount - 1 : 0;
    setHistoryIndex(nextHistory);
    setIndex(target);
    setVideoIndex(target === 4 && next < index ? Math.max(0, content.videos.length - 1) : 0);
    setSpecialStarted(false);
    setVideoIntent(true);
    setMediaState("loading");
    for (const [i, bar] of bars.current.entries()) {
      if (bar) bar.style.transform = `scaleX(${i < target ? 1 : i === target && target === 1 ? nextHistory / historyCount : 0})`;
    }
    setNotice("");
    setShareFallback(false);
    if (panels.current?.contains(document.activeElement)) screen.current?.focus({ preventScroll: true });
  }

  function begin(sound: boolean) {
    recordInteraction();
    setEntryRequested(true);
    if (coreReady) setStarted(true);
    setPaused(false);
    if (reduced) setAutomaticChoice(false);
    screen.current?.focus({ preventScroll: true });
    screen.current?.scrollIntoView({ behavior: "instant", block: "start" });
    soundPreference.current = sound;
    rememberSound(sound);
    if (sound) activateMusic();
    else setMusicEnabled(false);
  }

  function playWithSound() {
    setMuted(false);
    setVideoBlocked(false);
    setVideoIntent(true);
    setPaused(false);
    setKeyboardFocus(false);
    if (musicEnabled && audioGraph.current) void audioGraph.current.context.resume().catch(musicError);
    else if (soundPreference.current && !musicFailed) activateMusic();
    const video = player.current;
    if (video) {
      video.muted = false;
      void video.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setVideoBlocked(true);
          setNotice("Pulsa otra vez Reproducir con sonido para escuchar el mensaje.");
        } else if (!(error instanceof DOMException && error.name === "AbortError")) mediaFailed();
      });
    }
  }

  function mediaFailed() {
    console.error("Story video failed to load:", currentVideo?.source);
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
      data-history-index={historyIndex} data-history-count={historyCount}
      data-video-index={videoIndex} data-video-count={content.videos.length}
      data-music-volume={musicVolume} data-music-effective-volume={effectiveVolume}
      data-automatic={automatic} data-suspended={suspended} data-holding={holding}
      data-prepared={prepared.length} data-essential-count={essentialCount}
      onClickCapture={recordInteraction} onKeyDownCapture={recordInteraction}>
      {content.music && !musicFailed ? <audio ref={musicPlayer} src={musicAttached && musicSource ? assetPath(musicSource) : undefined}
        loop preload={musicAttached ? "auto" : "none"} onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          if (!musicPositioned.current && Number.isFinite(audio.duration)) {
            audio.currentTime = Math.min(10, Math.max(0, audio.duration - 0.1));
            musicPositioned.current = true;
          }
        }} onCanPlay={() => {
          setPrepared((items) => items.includes("music") ? items : [...items, "music"]);
          if (restoredSound.current !== null) {
            const sound = restoredSound.current;
            restoredSound.current = null;
            if (sound) activateMusic();
          }
        }} onPlaying={() => {
          const graph = audioGraph.current;
          if (!graph || musicFadingIn.current) return;
          musicFadingIn.current = true;
          const now = graph.context.currentTime;
          graph.gain.gain.cancelScheduledValues(now);
          graph.gain.gain.setValueAtTime(0, now);
          graph.gain.gain.linearRampToValueAtTime(effectiveVolume, now + 1.6);
        }} onError={() => {
          if (content.musicFallback && !musicFallback) {
            musicPositioned.current = false;
            setMusicFallback(true);
            setNotice("La música usará el formato alternativo de este navegador.");
            return;
          }
          console.error("Story music failed to load:", musicSource);
          setMusicFailed(true); setMusicEnabled(false);
          setNotice("No se pudo cargar la música. Puedes continuar recorriendo la edición.");
        }} /> : null}
      <div className={styles.issueIntro}>
        <h2 id="video-heading">{content.title}</h2>
        <p>{content.subtitle}</p>
        <p className={styles.editionFor}>Edición dedicada a {content.recipient}</p>
        <p className={styles.journeyNote}>{journey.complete ? "Tus recuerdos ya están recorridos. Puedes continuar a la invitación."
          : "Primero, nuestros recuerdos contigo. Después, la invitación."}</p>
      </div>
      <div ref={screen} className={styles.screen} tabIndex={0} role="region" aria-roledescription="historias"
        aria-label={`${content.title}, edición para ${content.recipient}`} data-lenis-prevent
        onKeyDown={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest("button, a, input")) return;
          if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
          if (event.key === " ") { event.preventDefault(); if (!started) begin(true); else setPaused((value) => !value); }
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
              {started && content.music && !musicFailed ? <button className={styles.musicButton} aria-label={musicEnabled ? "Silenciar música" : "Activar música"}
                aria-pressed={musicEnabled} onClick={() => {
                  soundPreference.current = !musicEnabled;
                  if (!started) { setStarted(true); screen.current?.focus({ preventScroll: true }); }
                  rememberSound(!musicEnabled);
                  if (musicEnabled) setMusicEnabled(false);
                  else activateMusic();
                }}>{musicEnabled ? "Silenciar música" : "Activar música"}</button> : null}
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
            {!started ? <div className={styles.welcome} data-welcome>
              <BotanicalAtmosphere scene="welcome" />
              <p className={styles.special}>Una edición para ustedes</p>
              <h3 className={styles.masthead}>{content.title.split(" ").map((word, i) => <span key={i}>{word}</span>)}</h3>
              <p className={styles.welcomeRecipient}>Para {content.recipient}</p>
              <span className={styles.rule} aria-hidden="true" />
              <p>Los recuerdos tienen su propia música.</p>
              <div className={styles.preparation}>
                <progress aria-label="Preparación de tu edición" value={prepared.length} max={essentialCount} />
                <p role="status">{prepared.length === essentialCount ? "Tu edición está lista."
                  : preparationFailed || musicFailed ? "Puedes entrar. Prepararemos el resto durante el recorrido."
                  : "Preparando esta edición para ustedes"} <span>{prepared.length} / {essentialCount}</span></p>
              </div>
              <button className={styles.startButton} disabled={entryRequested} onClick={() => begin(true)}>Entrar con sonido</button>
              <button className={styles.quietEntry} onClick={() => begin(false)}>Continuar sin música</button>
              {entryRequested && !coreReady ? <button className={styles.quietEntry} onClick={() => setStarted(true)}>Entrar mientras carga</button> : null}
            </div> : null}
            <div ref={panels} className={styles.pages} hidden={!started}>
              {content.slides.map((item, i) => (
                <article key={item.id} data-story-id={item.id} hidden={index !== i} inert={index !== i}
                  className={styles.page} aria-label={item.label}>
                  {started && index === i && !showVideo ? <BotanicalAtmosphere
                    scene={item.id === "history" && content.historyPages[historyIndex].kind === "photos" ? "photos" : item.id}
                    alternate={item.id === "history" && historyIndex % 2 === 1} /> : null}
                  <span className={styles.paperTexture} data-story-texture aria-hidden="true" />
                  <span className={styles.cornerFrame} data-story-ornament aria-hidden="true"><i /><i /><i /><i /></span>
                  {item.id !== "message" || (!showVideo && !specialIntro) ? <StoryPage content={content} slide={item} active={started && index === i} historyIndex={historyIndex} /> : null}
                  {item.id === "message" && specialIntro ? <div className={styles.specialIntroduction}>
                    <p className={styles.historyLabel}>Un momento más, solo para {currentVideo.recipient ?? content.recipient}</p>
                    <h3>Hay algo más que queremos compartir contigo.</h3>
                    <p>Un mensaje especial de Luis &amp; Marie.</p>
                    <button className={styles.startButton} onClick={() => {
                      setSpecialStarted(true); setVideoIntent(true); setPaused(false); setMediaState("loading");
                    }}>Reproducir segundo mensaje</button>
                  </div> : null}
                  {item.id === "message" && showVideo && currentVideo ? (
                    <div className={styles.videoStory}>
                      <video key={videoIndex} ref={player} src={assetPath(currentVideo.source)} muted={muted} playsInline
                        data-original-video={currentVideo.originalSource ?? currentVideo.source}
                        preload="auto" loop={false} poster={currentVideo.poster ? assetPath(currentVideo.poster) : undefined}
                        aria-label={`${currentVideo.kind === "special" ? "Mensaje especial" : "Mensaje de invitación"} para ${currentVideo.recipient ?? content.recipient}, de ${content.couple}`}
                        onLoadedMetadata={() => setMediaState("ready")}
                        onPlaying={() => { setMediaState("playing"); setNotice(""); }}
                        onWaiting={() => setMediaState("loading")}
                        onStalled={() => setNotice("La conexión está tardando. Puedes pausar el mensaje o continuar con la invitación.")}
                        onError={mediaFailed}
                        onEnded={() => {
                          setMediaState("ready");
                          setVideoIntent(false);
                          if (!suspended && (automatic || videoIndex < content.videos.length - 1)) go(index + 1);
                        }}>
                        {currentVideo.captions ? <track kind="captions" src={assetPath(currentVideo.captions)} srcLang="es" label="Español" default /> : null}
                      </video>
                      <div className={styles.videoCaption}>
                        <p>{currentVideo.recipient ? `Para ${currentVideo.recipient}`
                          : currentVideo.kind === "special" ? "Un segundo mensaje para ti" : `Para ${content.recipient}`} · Video {videoIndex + 1} de {content.videos.length}</p>
                        <div className={styles.videoControls}>
                          <button onClick={() => {
                            if (wantsVideo) { setVideoIntent(false); setPaused(true); }
                            else playWithSound();
                          }}
                            aria-label={wantsVideo ? "Pausar video" : "Reproducir video"}>
                            {wantsVideo ? "Pausar video" : "Reproducir video"}
                          </button>
                          <button onClick={() => setMuted((value) => !value)} aria-pressed={!muted}>
                            {muted ? "Escuchar video" : "Silenciar video"}
                          </button>
                          {currentVideo.captions ? <button aria-label="Subtítulos" aria-pressed={captionsEnabled}
                            onClick={() => setCaptionsEnabled((value) => !value)}>CC</button> : null}
                        </div>
                        {wantsVideo && mediaState === "loading" ? <p role="status">Cargando el mensaje…</p> : null}
                      </div>
                      {!wantsVideo ? <button className={styles.playOverlay} onClick={playWithSound}>
                        <span aria-hidden="true">▷</span>{videoBlocked ? "Reproducir con sonido" : "Reproducir video"}</button> : null}
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
            {started ? (
              <div className={styles.navigation}>
                <button aria-label="Historia anterior" disabled={index === 0} onClick={() => go(index - 1)}>‹ Anterior</button>
                <button aria-label={paused ? "Continuar stories" : "Pausar stories"} onClick={() => setPaused((value) => !value)}>{paused ? "Reanudar" : "Pausar"}</button>
                <button aria-label="Historia siguiente" disabled={last} onClick={() => go(index + 1)}>{inHistory && historyIndex === historyCount - 1 ? "Continuar" : "Siguiente"} ›</button>
              </div>
            ) : null}
            {started ? <p className={styles.pagePosition} aria-live="polite" aria-atomic="true">{inHistory ? `Recuerdos: página ${historyIndex + 1} de ${historyCount}`
              : specialIntro ? `Mensaje ${videoIndex + 1} de ${content.videos.length}`
              : `${index + 1} / ${content.slides.length} · ${slide.label}`}</p> : null}
          </div>
        </div>
            {helpVisible ? <div className={styles.contextHelp} data-context-help>
              <svg className={styles.helpHand} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 29V10a3 3 0 0 1 6 0v13-7a3 3 0 0 1 6 0v8-5a3 3 0 0 1 6 0v9-4a3 3 0 0 1 6 0v9c0 8-5 12-12 12h-2c-4 0-7-2-9-5l-8-10a3 3 0 0 1 5-4l6 7" />
              </svg>
              <p>{!started ? "Pulsa Entrar con sonido. Si prefieres, puedes continuar sin música."
                : last ? "Terminaste. Pulsa Ver la invitación para continuar."
                : specialIntro ? "Pulsa Reproducir segundo mensaje."
                : showVideo ? wantsVideo ? "Puedes pausar el mensaje cuando quieras." : videoBlocked ? "Pulsa Reproducir con sonido para escuchar el mensaje." : "Pulsa Reproducir video para comenzar."
                : paused ? "Pulsa Reanudar cuando quieras seguir."
                : "Pulsa Siguiente para avanzar. Anterior te permite volver. También puedes deslizar."}</p>
            </div> : null}
      <div className={styles.readerControls} hidden={!started}>
        {content.music && !musicFailed ? <label className={styles.volumeControl}>Volumen de música
          <input type="range" min="0" max="100" step="1" value={Math.round(musicVolume * 100)}
            onChange={(event) => {
              const volume = Number(event.target.value) / 100;
              setMusicVolume(volume);
              rememberSound(musicEnabled, volume);
            }} />
          <output>{Math.round(musicVolume * 100)}%</output>
        </label> : null}
        <label><input type="checkbox" checked={automatic} disabled={reduced}
          onChange={(event) => setAutomaticChoice(event.target.checked)} /> Avance automático</label>
        <p>{reduced ? "Movimiento reducido: recorre la edición a tu ritmo." : "Siguiente para avanzar. Anterior para volver. Pausar detiene el recorrido."}</p>
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
      {videoActive && currentVideo?.transcript ? <details className={styles.transcript}><summary>Leer el mensaje</summary><p>{currentVideo.transcript}</p></details> : null}
      </div>
      <noscript>
        <style>{'[data-love-issue] > [role="region"], [data-love-issue] [data-image-loading] { display: none; }'}</style>
        <div className={styles.staticEdition}>
          <p>Tu edición en formato de lectura, sin reproducción automática.</p>
          {content.slides.map((item) => (
            <div key={item.id}>
              <h3>{item.label}</h3>
              {item.id === "history" ? content.historyPages.map((_, page) => <StoryPage key={page} content={content} slide={item} historyIndex={page} />)
                : <StoryPage content={content} slide={item} />}
              {item.id === "message" ? content.videos.map((video, number) => <p key={video.source}><a href={assetPath(video.source)}>
                {number === 0 ? "Abrir mensaje de invitación" : "Abrir segundo mensaje"}</a></p>) : null}
            </div>
          ))}
          <a href="#invitacion">Ver la invitación</a>
        </div>
      </noscript>
    </div>
  );
}
