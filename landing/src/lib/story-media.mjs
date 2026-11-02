import { stat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * @param {string | null | undefined} source
 * @param {"video" | "image" | "captions" | "audio"} kind
 * @param {string} [publicRoot]
 */
export async function availableMedia(source, kind, publicRoot = path.join(process.cwd(), "public")) {
  if (source == null) return null;
  const patterns = {
    video: /^\/videos\/[a-zA-Z0-9_ -]+\.mp4$/i,
    image: /^\/(?:images|posters)\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/,
    captions: /^\/videos\/[a-zA-Z0-9_ -]+\.vtt$/i,
    audio: /^\/audio\/[a-zA-Z0-9_ -]+\.(mp3|weba|m4a)$/i,
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

export function photoEdition(file) {
  const words = path.parse(file).name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const has = (word) => words.includes(word);
  if (has("luis") && has("marie")) return "global";
  if (has("mariayroberto") || (has("maria") && has("roberto"))) return "mariayroberto";
  if (has("roberto")) return "roberto";
  if (has("giovanna")) return "giovanna";
  if (has("amparoyeduardo") || (has("amparo") && has("eduardo"))) return "amparoyeduardo";
  if (has("florisyabsalon") || ((has("floris") || has("flor")) && has("absalon"))) return "florisyabsalon";
  if (has("mercedes")) return "mercedes";
  return null;
}

export async function discoverStoryPhotos(publicRoot = path.join(process.cwd(), "public")) {
  let files;
  try { files = await readdir(path.join(publicRoot, "posters")); }
  catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
  const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });
  const sortName = (file) => path.parse(file).name.replace(/\s+/g, " ").trim();
  return files.filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((a, b) => collator.compare(sortName(a), sortName(b)) || (a < b ? -1 : a > b ? 1 : 0))
    .map((file) => ({ file, edition: photoEdition(file) }));
}

export async function loadStoryPhotoCatalog() {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), ".cache", "story-photos.json"), "utf8"));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error("Missing story photo catalog. Run npm run photos:prepare before starting Next.");
    }
    throw error;
  }
}

/** @param {import("./stories").StoryPhoto[]} photos */
export function historyPages(photos) {
  /** @type {import("./stories").HistoryPage[]} */
  const pages = [{ kind: "intro", photos: [] }];
  for (let i = 0; i < photos.length;) {
    const count = i === 0 ? 1 : Math.min(2, photos.length - i);
    pages.push({ kind: "photos", photos: photos.slice(i, i + count) });
    i += count;
    if (i >= 5 && i < photos.length && pages.every((page) => page.kind !== "reflection")) {
      pages.push({ kind: "reflection", photos: [] });
    }
  }
  return pages;
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

export async function resolveStoryVideos(guest, config, publicRoot = path.join(process.cwd(), "public")) {
  const first = await resolveStoryVideo(guest, config, publicRoot);
  let files;
  try { files = await readdir(path.join(publicRoot, "videos")); }
  catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") files = [];
    else throw error;
  }
  const matches = guest.slug && guest.slug !== "default" ? files
    .filter((file) => /\.mp4$/i.test(file) && photoEdition(file) === guest.slug)
    .sort((a, b) => new Intl.Collator("es", { numeric: true, sensitivity: "base" })
      .compare(path.parse(a).name, path.parse(b).name) || a.localeCompare(b)) : [];
  const discovered = matches.map((file) => `/videos/${file}`);
  const configured = first?.personalized
    ? discovered.find((source) => source.toLowerCase() === first.source.toLowerCase()) ?? first.source : null;
  const sources = [...new Set([...(configured ? [configured] : []), ...discovered])];
  if (sources.length > 2) throw new Error(`More than two story videos for ${guest.slug}; review the video inventory.`);
  if (!sources.length) return first ? [{ ...first, kind: "invitation" }] : [];
  return Promise.all(sources.map(async (source, index) => {
    await availableMedia(source, "video", publicRoot);
    if (configured === source && first) return { ...first, source, kind: index ? "special" : "invitation" };
    const stem = path.parse(source).name;
    const captions = await availableMedia(`/videos/${stem}.vtt`, "captions", publicRoot);
    return {
      source, poster: index === 0 ? await firstAvailableMedia([
        guest.poster, `/posters/${guest.slug}.jpg`,
      ], "image", publicRoot) : null,
      captions, transcript: index === 0 ? guest.transcript : null,
      personalized: true, kind: index ? "special" : "invitation",
    };
  }));
}
