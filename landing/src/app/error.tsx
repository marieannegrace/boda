"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("The Letter could not render", error); }, [error]);
  return (
    <main className="systemPage">
      <h1>No pudimos preparar la carta.</h1>
      <p>Vuelve a intentarlo para cargar la invitación.</p>
      <button onClick={reset}>Intentar de nuevo</button>
      <Link href="/">Volver a la invitación general</Link>
    </main>
  );
}
