import { stat } from "node:fs/promises";
import path from "node:path";

/**
 * @param {string | null | undefined} source
 * @param {"video" | "image" | "captions"} kind
 * @param {string} [publicRoot]
 */
export async function availableMedia(source, kind, publicRoot = path.join(process.cwd(), "public")) {
  if (source == null) return null;
  const patterns = {
    video: /^\/videos\/[a-zA-Z0-9_-]+\.mp4$/,
    image: /^\/(?:images|posters)\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/,
    captions: /^\/videos\/[a-zA-Z0-9_-]+\.vtt$/,
  };
  if (!patterns[kind].test(source)) throw new Error(`Invalid story ${kind} path: ${source}`);
  try {
    if (!(await stat(path.join(publicRoot, source))).isFile()) throw new Error(`Story ${kind} is not a file: ${source}`);
    return source;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

/**
 * @param {(string | null | undefined)[]} candidates
 * @param {"video" | "image" | "captions"} kind
 * @param {string} [publicRoot]
 */
export async function firstAvailableMedia(candidates, kind, publicRoot) {
  for (const candidate of candidates) {
    const source = await availableMedia(candidate, kind, publicRoot);
    if (source) return source;
  }
  return null;
}

/**
 * @param {{slug: string, stories?: {photo?: string | null}}} guest
 * @param {{photo: string | null}} config
 * @param {string} [publicRoot]
 */
export async function resolveStoryImages(guest, config, publicRoot) {
  const [photo, historyPhoto] = await Promise.all([
    firstAvailableMedia([
      guest.stories?.photo,
      guest.slug === "default" ? null : `/images/${guest.slug}.jpg`,
      config.photo, "/images/luis-marie.jpg", "/images/cover.jpg",
    ], "image", publicRoot),
    availableMedia("/images/history.jpg", "image", publicRoot),
  ]);
  return { photo, historyPhoto };
}

/**
 * @param {{slug?: string, video: string | null, poster: string | null, captions: string | null, transcript: string | null}} guest
 * @param {{generalVideo: string | null, generalPoster: string | null, generalCaptions: string | null, generalTranscript: string | null}} config
 * @param {string} [publicRoot]
 */
export async function resolveStoryVideo(guest, config, publicRoot) {
  const personal = await availableMedia(guest.video, "video", publicRoot);
  const source = personal ?? await availableMedia(config.generalVideo, "video", publicRoot);
  if (!source) return null;
  const [poster, captions] = await Promise.all([
    firstAvailableMedia(personal ? [
      guest.poster, guest.slug && guest.slug !== "default" ? `/posters/${guest.slug}.jpg` : null,
    ] : [config.generalPoster], "image", publicRoot),
    availableMedia(personal ? guest.captions : config.generalCaptions, "captions", publicRoot),
  ]);
  return {
    source, poster, captions,
    transcript: personal ? guest.transcript : config.generalTranscript,
    personalized: Boolean(personal),
  };
}
