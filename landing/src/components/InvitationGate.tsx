"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import LetterOpening from "./LetterOpening";
import ScrollMotion from "./ScrollMotion";
import styles from "./Experience.module.css";

const HistoryContext = createContext({ complete: false, finish: () => {} });
export const useHistoryJourney = () => useContext(HistoryContext);

export function HistoryGate({ children }: { children: React.ReactNode }) {
  const { complete } = useHistoryJourney();
  return <>
    {!complete ? <div className={styles.historyGate} data-history-reminder>
      <p>Primero, recorramos nuestros recuerdos contigo.</p>
      <a href="#video">Continuar mi edición</a>
    </div> : null}
    <div hidden={!complete} data-history-content>{children}</div>
    <noscript><style>{'[data-history-content][hidden] { display: block; } [data-history-reminder] { display: none; }'}</style></noscript>
  </>;
}

export interface EntryLetter {
  couple: string;
  date: string;
  recipient: string;
  greeting: string;
  seatsLabel: string;
  note: string;
  location: string;
}

export default function InvitationGate({ letter, initialOpened, readingUrl, children }: {
  letter: EntryLetter; initialOpened: boolean; readingUrl: string; children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(initialOpened);
  const [historyComplete, setHistoryComplete] = useState(false);
  const [historyNotice, setHistoryNotice] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!opened || historyComplete) return;
    const redirect = () => {
      if (!location.hash || ["#carta", "#apertura", "#saludo", "#video"].includes(location.hash)) return;
      history.replaceState(null, "", "#video");
      root.current?.querySelector<HTMLElement>("#video")?.scrollIntoView({ behavior: "instant" });
      setHistoryNotice("Antes de continuar, recorre las fotografías con el botón Siguiente.");
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, [opened, historyComplete]);

  useLayoutEffect(() => {
    if (opened) return;
    const body = document.body;
    const html = document.documentElement;
    const original = {
      position: body.style.position, top: body.style.top, width: body.style.width,
      overflow: body.style.overflow, htmlOverflow: html.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.width = original.width;
      body.style.overflow = original.overflow;
      html.style.overflow = original.htmlOverflow;
    };
  }, [opened]);

  useLayoutEffect(() => {
    if (!opened || initialOpened) return;
    const greeting = root.current?.querySelector<HTMLElement>("#saludo-heading");
    greeting?.focus({ preventScroll: true });
    greeting?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [opened, initialOpened]);

  return (
    <HistoryContext.Provider value={{ complete: historyComplete, finish: () => setHistoryComplete(true) }}>
    <div ref={root} role={opened ? undefined : "main"} className={opened ? undefined : styles.lockedGate}
      data-entry-state={opened ? "opened" : "locked"} data-history-complete={historyComplete}
      onClickCapture={(event) => {
        const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
        const hash = link?.getAttribute("href");
        if (!opened || historyComplete || !hash || ["#carta", "#apertura", "#saludo", "#video"].includes(hash)) return;
        event.preventDefault();
        setHistoryNotice("Antes de continuar, recorre las fotografías con el botón Siguiente.");
        root.current?.querySelector<HTMLElement>("#video")?.scrollIntoView({ behavior: "instant" });
        root.current?.querySelector<HTMLElement>("[data-love-issue] [role=region]")?.focus({ preventScroll: true });
      }}>
      <section id="carta" data-scene="carta" className={`${styles.hero} ${styles.entryHero}`} aria-label="Carta cerrada">
        <LetterOpening {...letter} initialOpened={initialOpened} readingUrl={readingUrl} onOpened={() => setOpened(true)} />
      </section>
      <ScrollMotion active={opened} layoutVersion={historyComplete}>
        {!historyComplete ? <p className={styles.historyNotice} role="status">{historyNotice}</p> : null}
        <div hidden={!opened} inert={!opened} data-letter-content>{children}</div>
      </ScrollMotion>
    </div>
    </HistoryContext.Provider>
  );
}
