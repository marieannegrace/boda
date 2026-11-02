import "server-only";
import config from "@/data/stories.json";
import event from "@/data/event.json";
import type { Guest } from "./guests.server";
import type { StoriesContent, StoryId, StorySlide, StoryPhoto } from "./stories";
import { availableMedia, historyPages, loadStoryPhotoCatalog, resolveStoryImages, resolveStoryVideo } from "./story-media.mjs";
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
  const [video, { photo, historyPhoto }, catalog, music] = await Promise.all([
    resolveStoryVideo(guest, config),
    resolveStoryImages(guest, config),
    loadStoryPhotoCatalog(),
    availableMedia(config.music, "audio"),
  ]);
  const selected: StoryPhoto[] = catalog.filter((item: StoryPhoto & { edition: string }) => item.edition === guest.slug);
  const global: StoryPhoto[] = catalog.filter((item: StoryPhoto & { edition: string }) => item.edition === "global");
  const momentPhoto = global[0] ?? null;
  const messagePhoto = global[1] ?? selected[0] ?? null;
  if (!Number.isFinite(config.musicVolume) || config.musicVolume < 0 || config.musicVolume > 0.3) {
    throw new Error("Story music volume must be between 0 and 0.3");
  }
  const safePhoto = (item: StoryPhoto): StoryPhoto => ({
    file: item.file, source: item.source, width: item.width, height: item.height,
    variants: item.variants, treatment: item.treatment, focalPoint: item.focalPoint,
    alt: item.alt || (global.includes(item) ? "Luis y Marie, una memoria compartida." : `Un recuerdo de la edición de ${guest.displayName}.`),
  });
  const date = new Date(`${event.date}T12:00:00Z`);
  const dateParts = new Intl.DateTimeFormat("es", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).formatToParts(date);
  const datePart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((part) => part.type === type)?.value ?? "";
  const siteUrl = getSiteUrl();
  const seats = guest.seats === null ? guest.seatsPendingLabel : `${guest.seats} ${guest.seats === 1 ? "INVITADO" : "INVITADOS"}`;
  if (!seats) throw new Error("Missing guest seats label");
  return {
    title: config.title, subtitle: config.subtitle, edition: overrides?.edition ?? config.edition,
    volume: config.volume, number: config.number, specialEdition: config.specialEdition,
    personalizationLabel: config.personalizationLabel, hashtag: config.hashtag,
    shareText: config.shareText.replaceAll("{couple}", event.couple).replaceAll("{location}", event.location.name)
      .replaceAll("{date}", `${datePart("day")} ${datePart("month")} ${datePart("year")}`),
    photoAlt: photo && photo === overrides?.photo ? overrides?.photoAlt ?? config.photoAlt
      : photo === `/images/${guest.slug}.jpg` ? `Fotografía de la edición de ${guest.displayName}.` : config.photoAlt,
    messageHeading: config.messageHeading, messageSignoff: overrides?.message ?? config.messageSignoff,
    recipient: guest.displayName,
    seats,
    couple: event.couple,
    date: `${datePart("day")} · ${datePart("month").toUpperCase()} · ${datePart("year")}`,
    location: `${event.location.name} · ${event.location.region.split(",")[0]}`,
    colophon: `${event.location.name} · ${datePart("year")}`,
    shareUrl: guest.slug === "default" ? (siteUrl ? `${siteUrl}/` : null) : getGuestUrl(siteUrl, guest.slug),
    video: video ? { ...video, poster: video.poster ?? messagePhoto?.source ?? photo ?? historyPhoto } : null,
    historyPages: historyPages(selected.map(safePhoto)), historyReflection: config.photography.historyReflection,
    momentPhoto: momentPhoto ? safePhoto(momentPhoto) : null,
    messagePhoto: messagePhoto ? safePhoto(messagePhoto) : null,
    music, musicVolume: config.musicVolume,
    photo, historyPhoto, slides,
  };
}
