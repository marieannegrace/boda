"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "./Experience.module.css";

export default function InvitationImage() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    dialog.current?.close();
    trigger.current?.focus();
  }
  return (
    <>
      <figure className={styles.facsimile} data-facsimile>
        <Image src="/invitation/invitation.webp" alt="Invitación original de Luis y Marie con composición botánica, fecha del 7 de diciembre y Puerto Velero."
          width={1600} height={2523} sizes="(min-width: 960px) 480px, (min-width: 640px) 480px, calc(100vw - 64px)" />
        <figcaption>La invitación original, conservada como una pieza completa.</figcaption>
      </figure>
      <button ref={trigger} className={styles.quietButton} onClick={() => dialog.current?.showModal()}>Ampliar invitación</button>
      <dialog ref={dialog} className={styles.imageDialog} aria-labelledby="invitation-dialog-title"
        onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); close(); } }}
        onClose={() => trigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className={styles.dialogToolbar}>
          <h2 id="invitation-dialog-title">La invitación</h2>
          <button onClick={close}>Cerrar</button>
        </div>
        <Image src="/invitation/invitation.webp" alt="Facsímil ampliado de la invitación de Luis y Marie."
          width={1600} height={2523} sizes="(min-width: 960px) 900px, 100vw" />
      </dialog>
    </>
  );
}
