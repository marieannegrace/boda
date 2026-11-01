import { notFound } from "next/navigation";
import Experience from "@/components/Experience";
import { getGuest, hasVideo } from "@/lib/guests.server";

export const dynamic = "force-dynamic";

export default async function GuestPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ open?: string }>;
}) {
  const { slug } = await params;
  const guest = getGuest(slug);
  if (!guest) notFound();
  const { open } = await searchParams;
  return <Experience guest={guest} videoAvailable={await hasVideo(guest)} initialOpened={open === "1"} />;
}
