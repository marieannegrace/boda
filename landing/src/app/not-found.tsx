import Link from "next/link";

export default function NotFound() {
  return (
    <main className="systemPage">
      <h1>Esta página no está en la carta.</h1>
      <p>Puedes volver a la invitación general.</p>
      <Link href="/">Abrir la invitación</Link>
    </main>
  );
}
