import Link from "next/link";
import Experience from "@/components/Experience";
import { getGuest } from "@/lib/guests.server";

export default async function NotFound() {
  const guest = getGuest();
  if (!guest) throw new Error("Missing default guest configuration");
  // Resolve async media before rendering Next's static 404 boundary.
  const experience = await Experience({ guest });
  return (
    <>
      {experience}
      <aside className="fallbackNote">
        <p>Puedes volver a la invitación general.</p>
        <Link href="/">Abrir la invitación</Link>
      </aside>
    </>
  );
}
