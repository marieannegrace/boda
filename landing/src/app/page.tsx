import Experience from "@/components/Experience";
import { getGuest, hasVideo } from "@/lib/guests.server";

export default async function Home() {
  const guest = getGuest();
  if (!guest) throw new Error("Missing default guest configuration");
  return <Experience guest={guest} videoAvailable={await hasVideo(guest)} />;
}
