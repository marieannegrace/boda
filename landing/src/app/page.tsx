import Experience from "@/components/Experience";
import { getGuest } from "@/lib/guests.server";

export default async function Home() {
  const guest = getGuest();
  if (!guest) throw new Error("Missing default guest configuration");
  return <Experience guest={guest} />;
}
