import "server-only";
import config from "@/data/stories.json";
import event from "@/data/event.json";
import type { Guest } from "./guests.server";
import type { StoriesContent, StoryId, StorySlide, StoryPhoto } from "./stories";
import { availableMedia, historyPages, loadStoryPhotoCatalog, resolveStoryImages, resolveStoryVideos } from "./story-media.mjs";
import { getGuestUrl, getSiteUrl } from "./site-url.mjs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

type Derivative = { original: string; originalSha256: string; source: string; poster?: string };
async function loadDerivatives(): Promise<{ videos: Derivative[]; music: Derivative | null }> {
  let data: unknown;
  try { data = JSON.parse(await readFile(path.join(process.cwd(), "public", "media", "catalog.json"), "utf8")); }
  catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.warn("No optimized audiovisual catalog; using original media.");
      return { videos: [], music: null };
    }
    throw error;
  }
  const valid = (item: unknown): item is Derivative => typeof item === "object" && item !== null
    && "original" in item && typeof item.original === "string"
    && "originalSha256" in item && typeof item.originalSha256 === "string" && /^[a-f0-9]{64}$/i.test(item.originalSha256)
    && "source" in item && typeof item.source === "string" && /^\/media\/[a-z0-9-]+\.(mp4|m4a|mp3)$/.test(item.source)
    && (!("poster" in item) || typeof item.poster === "string" && /^\/media\/[a-z0-9-]+\.webp$/.test(item.poster));
  if (typeof data !== "object" || data === null || !("videos" in data) || !Array.isArray(data.videos)
    || !data.videos.every(valid) || !("music" in data) || data.music !== null && !valid(data.music)) {
    throw new Error("Invalid optimized audiovisual catalog");
  }
  const videos = data.videos;
  const music = data.music;
  await Promise.all([...videos, ...(music ? [music] : [])].flatMap((item) => [item.source, ...(item.poster ? [item.poster] : [])])
    .map(async (source) => {
      if (!(await stat(path.join(process.cwd(), "public", source))).isFile()) throw new Error(`Missing derivative: ${source}`);
    }));
  return { videos, music };
}

async function matchingDerivative(original: string | null, candidates: Derivative[]) {
  const found = candidates.find((candidate) => candidate.original === original);
  if (!found || !original) return null;
  const master = await readFile(path.join(process.cwd(), "public", original));
  if (createHash("sha256").update(master).digest("hex") !== found.originalSha256.toLowerCase()) {
    console.warn(`Optimized media is stale; using the current original: ${original}`);
    return null;
  }
  return found;
}

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
  const [videos, { photo, historyPhoto }, catalog, music, musicFallback, derivatives] = await Promise.all([
    resolveStoryVideos(guest, config),
    resolveStoryImages(guest, config),
    loadStoryPhotoCatalog(),
    availableMedia(config.music, "audio"),
    availableMedia("/audio/the-love-issue.mp3", "audio"),
    loadDerivatives(),
  ]);
  const selected: StoryPhoto[] = catalog.filter((item: StoryPhoto & { edition: string }) => item.edition === guest.slug);
  const global: StoryPhoto[] = catalog.filter((item: StoryPhoto & { edition: string }) => item.edition === "global");
  const momentPhoto = global[0] ?? null;
  const messagePhoto = global[1] ?? selected[0] ?? null;
  const [optimizedVideos, optimizedMusic] = await Promise.all([
    Promise.all(videos.map((video) => matchingDerivative(video.source, derivatives.videos))),
    matchingDerivative(music, derivatives.music ? [derivatives.music] : []),
  ]);
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
    videos: videos.map((video, index) => {
      const optimized = optimizedVideos[index];
      return { ...video, source: optimized?.source ?? video.source, originalSource: video.source,
        kind: video.kind === "special" ? "special" : "invitation",
        poster: optimized?.poster ?? video.poster ?? messagePhoto?.source ?? photo ?? historyPhoto };
    }),
    historyPages: historyPages(selected.map(safePhoto)), historyReflection: config.photography.historyReflection,
    momentPhoto: momentPhoto ? safePhoto(momentPhoto) : null,
    messagePhoto: messagePhoto ? safePhoto(messagePhoto) : null,
    music: optimizedMusic?.source ?? music ?? musicFallback,
    musicFallback: optimizedMusic ? music : music && music !== musicFallback ? musicFallback : null,
    musicVolume: config.musicVolume,
    photo, historyPhoto, slides,
  };
}
