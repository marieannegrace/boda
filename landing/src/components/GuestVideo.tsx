"use client";

import { useEffect, useRef, useState } from "react";
import type { Guest } from "@/lib/guests.server";
import styles from "./Experience.module.css";

type Status = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export default function GuestVideo({ guest, available, placeholder }: {
  guest: Guest; available: boolean; placeholder: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const player = video.current;
    return () => {
      player?.pause();
      player?.removeAttribute("src");
      player?.load();
    };
  }, [guest.video]);

  function failed(message: string) {
    setError(message);
    setStatus("error");
  }
  async function play() {
    const player = video.current;
    if (!player || !guest.video) {
      failed("El archivo del mensaje no está disponible. Puedes continuar con la carta.");
      return;
    }
    setError("");
    setStatus("loading");
    player.src = guest.video;
    player.load();
    try {
      await player.play();
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      failed("No pudimos reproducir el mensaje. Usa los controles del video o vuelve a intentarlo.");
    }
  }
  const ratio = guest.videoWidth && guest.videoHeight ? `${guest.videoWidth} / ${guest.videoHeight}` : "16 / 9";
  return (
    <div>
      {available ? (
        <>
          <div className={styles.videoFrame} style={{ aspectRatio: ratio }}>
            <video ref={video} controls playsInline preload="none" poster={guest.poster ?? undefined}
              aria-label={`Mensaje de Luis y Marie para ${guest.displayName}`}
              onWaiting={() => setStatus("loading")}
              onPlaying={() => { setStatus("playing"); setError(""); }}
              onPause={() => setStatus((previous) => previous === "error" || previous === "ended" ? previous : "paused")}
              onEnded={() => setStatus("ended")}
              onError={() => failed("El video no pudo cargarse. Reintenta o continúa con nuestra historia.")}>
              {guest.captions ? <track kind="captions" src={guest.captions} srcLang="es" label="Español" default /> : null}
            </video>
          </div>
          <button className={styles.button} onClick={play}>
            {status === "error" ? "Reintentar mensaje" : status === "ended" ? "Volver a ver el mensaje" : "Ver nuestro mensaje"}
          </button>
          <p role="status" className={styles.mediaStatus}>
            {status === "loading" ? "Cargando el mensaje…" : status === "ended" ? "Gracias por escucharnos." : ""}
          </p>
          {error ? <p role="alert">{error}</p> : null}
          {guest.transcript ? <details><summary>Leer transcripción</summary><p>{guest.transcript}</p></details> : null}
          {!guest.captions ? <p className={styles.small}>Subtítulos pendientes de incorporación.</p> : null}
        </>
      ) : (
        <div className={styles.videoPlaceholder}>
          <span className={styles.videoSignature} aria-hidden="true">L &amp; M</span>
          <p>Un mensaje para {guest.displayName}</p>
          <p className={styles.placeholderCopy}>{placeholder}</p>
          <span className={styles.small}>Mensaje en video pendiente</span>
        </div>
      )}
      <a className={styles.quietLink} href="#historia">Continuar con nuestra historia, sin video</a>
    </div>
  );
}
