"use client";

import { useRef } from "react";
import styles from "./Experience.module.css";

export default function ChapterNavigation({ chapters }: { chapters: string[][] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  function close() {
    if (menu.current) menu.current.open = false;
  }
  return (
    <details ref={menu} className={styles.chapterMenu} onKeyDown={(event) => {
      if (event.key === "Escape") {
        close();
        menu.current?.querySelector("summary")?.focus();
      }
    }}>
      <summary>Recorrer la carta</summary>
      <nav aria-label="Escenas de la invitación">
        <ol>{chapters.map(([id, title]) => (
          <li key={id}><a href={`#${id}`} onClick={close}>{title}</a></li>
        ))}</ol>
      </nav>
    </details>
  );
}
