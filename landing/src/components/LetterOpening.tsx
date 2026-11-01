"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { motion } from "@/animations/tokens";
import type { EntryLetter } from "./InvitationGate";
import styles from "./Experience.module.css";

gsap.registerPlugin(useGSAP, Flip);

export default function LetterOpening({ couple, date, recipient, greeting, seatsLabel, note, location, initialOpened, onOpened }: EntryLetter & {
  initialOpened: boolean; onOpened: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const pocket = useRef<HTMLDivElement>(null);
  const insert = useRef<HTMLDivElement>(null);
  const upperFold = useRef<HTMLDivElement>(null);
  const lowerFold = useRef<HTMLDivElement>(null);
  const recipientInk = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const before = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const sequence = useRef<gsap.core.Timeline | null>(null);
  const busy = useRef(initialOpened);
  const skipping = useRef(false);
  const [phase, setPhase] = useState<"closed" | "opening" | "unfolding" | "opened">(initialOpened ? "opened" : "closed");
  const expanded = phase === "unfolding" || phase === "opened";

  function finish() {
    envelope.current?.style.removeProperty("transform");
    insert.current?.style.removeProperty("transform");
    setPhase("opened");
    onOpened();
  }
  const { contextSafe } = useGSAP(() => {
    if (!initialOpened) button.current?.focus({ preventScroll: true });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => {
      if (preference.matches && busy.current) sequence.current?.progress(1);
    };
    preference.addEventListener("change", changed);
    return () => preference.removeEventListener("change", changed);
  }, { scope: root });

  useGSAP(() => {
    if (!expanded || phase === "opened") return;
    if (skipping.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const unfold = gsap.timeline({ onComplete: finish });
    sequence.current = unfold;
    if (before.current) {
      unfold.add(Flip.from(before.current, {
        scale: true, duration: motion.medium, ease: motion.openingEase,
      }), 0);
    }
    unfold
      .to(upperFold.current, { rotationX: 175, duration: 0.65, ease: motion.openingEase }, 0.1)
      .to(lowerFold.current, { rotationX: -175, duration: 0.65, ease: motion.openingEase }, 0.32)
      .to([upperFold.current, lowerFold.current], { opacity: 0, duration: motion.short }, 0.78)
      .fromTo(recipientInk.current, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: motion.medium, ease: motion.ease,
      }, 0.8)
      .to({}, { duration: 0.3 });
  }, { scope: root, dependencies: [expanded] });

  function open() {
    if (busy.current) {
      skipping.current = true;
      sequence.current?.progress(1);
      return;
    }
    busy.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    setPhase("opening");
    const opening = gsap.timeline({
      onComplete: () => {
        before.current = Flip.getState(insert.current);
        setPhase("unfolding");
      },
    });
    sequence.current = opening;
    opening
      .to(envelope.current, { y: -8, rotationX: 4, duration: motion.short, ease: motion.openingEase }, 0)
      .to(seal.current, { opacity: 0, scale: 0.97, duration: motion.short, ease: motion.ease }, 0.12)
      .to(flap.current, { rotationX: -175, duration: 0.85, ease: motion.openingEase }, 0.24)
      .to(insert.current, { y: -32, duration: motion.medium, ease: motion.ease }, 0.92)
      .to(pocket.current, { y: 20, opacity: 0, duration: motion.medium, ease: motion.ease }, 1.12)
      .to(flap.current, { opacity: 0, duration: motion.short }, 1.4)
      .to(envelope.current, { rotationX: 0, y: 0, duration: motion.medium, ease: motion.ease }, 1.12);
  }

  function continueOpening() {
    skipping.current = true;
    sequence.current?.progress(1);
  }

  return (
    <div ref={root} className={styles.letterStage} data-opening-phase={phase}
      onKeyDown={(event) => {
        if (phase !== "opened" && event.key === "Tab") {
          event.preventDefault();
          button.current?.focus();
        }
        if (phase !== "closed" && phase !== "opened" && event.key === "Escape") contextSafe(continueOpening)();
      }}>
      <div className={styles.letterHeading}>
        <p>Una carta de</p>
        <h1>{couple}</h1>
        <p>{date}</p>
      </div>
      <div id="apertura" data-scene="apertura" aria-label="Apertura de la carta" role="region"
        className={styles.envelopeSpace}>
        <div ref={envelope} className={`${styles.envelope} ${expanded ? styles.envelopeOpen : ""}`}>
          <div ref={insert} className={styles.letterInsert} aria-hidden={!expanded}>
            <div ref={recipientInk} className={styles.recipientInk}>
              <p className={styles.innerGreeting}>{greeting}</p>
              <p className={styles.innerNote}>{note}</p>
              <span>{couple}</span>
            </div>
            <div ref={upperFold} className={styles.paperUpperFold} aria-hidden="true" />
            <div ref={lowerFold} className={styles.paperLowerFold} aria-hidden="true" />
          </div>
          <div ref={pocket} className={styles.envelopeFace} aria-hidden={phase !== "closed"}>
            <p className={styles.recipient}>Para {recipient}</p>
            <p className={styles.envelopeDate}>Cupos: {seatsLabel}</p>
          </div>
          <div ref={flap} className={styles.flap} aria-hidden="true">
            <span className={styles.flapFront} />
            <span className={styles.flapBack} />
          </div>
          <span ref={seal} className={styles.paperSeal} aria-hidden="true">L &amp; M</span>
        </div>
      </div>
      <div className={styles.openActions}>
        {phase === "opened" ? <a className={styles.button} href="#saludo">Leer la carta</a> : (
          <form method="get" action="#saludo" onSubmit={(event) => { event.preventDefault(); contextSafe(open)(); }}>
            <input type="hidden" name="open" value="1" />
            <button ref={button} className={`${styles.button} ${styles.openButton}`} type="submit">
              {phase === "closed" ? "Abrir la carta" : "Continuar sin animación"}
            </button>
          </form>
        )}
        <p className={styles.beginNote}>{phase === "closed" ? "para comenzar" : phase === "opened" ? "La carta está abierta" : "Abriendo tu carta…"}</p>
      </div>
      <p className={styles.heroFootnote}>{location}</p>
      <p className={styles.srOnly} role="status">{phase === "opened" ? "Carta abierta. El contenido está disponible." : phase !== "closed" ? "Abriendo la carta. Puedes continuar sin animación." : ""}</p>
    </div>
  );
}
