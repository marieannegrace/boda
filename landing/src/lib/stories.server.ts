import "server-only";
import config from "@/data/stories.json";
import event from "@/data/event.json";
import type { Guest } from "./guests.server";
import type { StoriesContent, StoryId, StorySlide } from "./stories";
import { availableMedia, resolveStoryVideo } from "./story-media.mjs";
import { getGuestUrl, getSiteUrl } from "./site-url.mjs";

const ids: StoryId[] = ["cover", "history", "family", "moment", "message", "closing"];

export async function getStories(guest: Guest): Promise<StoriesContent> {
  const slides: StorySlide[] = config.slides.map((slide, index) => {
    const id = ids[index];
    if (slide.id !== id || !Number.isFinite(slide.duration) || slide.duration < 3 || slide.duration > 5) {
      throw new Error(`Invalid story sequence or duration: ${slide.id}`);
    }
    return { ...slide, id };
  });
  if (slides.length !== ids.length) throw new Error("The Love Issue requires six stories.");
  const overrides = guest.stories;
  const [video, photo] = await Promise.all([
    resolveStoryVideo(guest, config),
    availableMedia(overrides?.photo, "image").then((personal) => personal ?? availableMedia(config.photo, "image")),
  ]);
  const date = new Date(`${event.date}T12:00:00Z`);
  const dateParts = new Intl.DateTimeFormat("es", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).formatToParts(date);
  const datePart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((part) => part.type === type)?.value ?? "";
  const siteUrl = getSiteUrl();
  return {
    title: config.title, subtitle: config.subtitle, edition: overrides?.edition ?? config.edition,
    volume: config.volume, specialEdition: config.specialEdition,
    personalizationLabel: config.personalizationLabel, hashtag: config.hashtag,
    shareText: config.shareText.replaceAll("{couple}", event.couple).replaceAll("{location}", event.location.name)
      .replaceAll("{date}", `${datePart("day")} ${datePart("month")} ${datePart("year")}`),
    photoAlt: photo && photo === overrides?.photo ? overrides?.photoAlt ?? config.photoAlt : config.photoAlt,
    photoPlaceholder: config.photoPlaceholder, videoPlaceholder: overrides?.message ?? config.videoPlaceholder,
    recipient: guest.displayName,
    seats: String(guest.seats ?? guest.seatsPendingLabel),
    couple: event.couple,
    date: `${datePart("day")} · ${datePart("month").toUpperCase()} · ${datePart("year")}`,
    location: `${event.location.name} · ${event.location.region}`,
    colophon: `${config.volume} · ${event.location.name} · ${datePart("year")}`,
    shareUrl: guest.slug === "default" ? (siteUrl ? `${siteUrl}/` : null) : getGuestUrl(siteUrl, guest.slug),
    video, photo, slides,
  };
}
