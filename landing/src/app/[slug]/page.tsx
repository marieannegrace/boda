import { notFound } from "next/navigation";
import Experience from "@/components/Experience";
import { getExactGuest, getGuestSlugs, hasVideo } from "@/lib/guests.server";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGuestSlugs().map((slug) => ({ slug }));
}

export default async function GuestPage({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guest = getExactGuest(slug);
  if (!guest) notFound();
  return <Experience guest={guest} videoAvailable={await hasVideo(guest)} />;
}
