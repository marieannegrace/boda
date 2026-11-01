"use client";

import { useLayoutEffect, useRef, useState } from "react";
import LetterOpening from "./LetterOpening";
import ScrollMotion from "./ScrollMotion";
import styles from "./Experience.module.css";

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
  const root = useRef<HTMLDivElement>(null);

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
    <div ref={root} role={opened ? undefined : "main"} className={opened ? undefined : styles.lockedGate} data-entry-state={opened ? "opened" : "locked"}>
      <section id="carta" data-scene="carta" className={`${styles.hero} ${styles.entryHero}`} aria-label="Carta cerrada">
        <LetterOpening {...letter} initialOpened={initialOpened} readingUrl={readingUrl} onOpened={() => setOpened(true)} />
      </section>
      <ScrollMotion active={opened}>
        <div hidden={!opened} inert={!opened} data-letter-content>{children}</div>
      </ScrollMotion>
    </div>
  );
}
