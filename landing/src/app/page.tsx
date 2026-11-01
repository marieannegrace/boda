import Experience from "@/components/Experience";
import { getGuest, hasVideo } from "@/lib/guests.server";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const guest = getGuest();
  if (!guest) throw new Error("Missing default guest configuration");
  const { open } = await searchParams;
  return <Experience guest={guest} videoAvailable={await hasVideo(guest)} initialOpened={open === "1"} />;
}
