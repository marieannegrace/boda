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
    image: /^\/images\/[a-zA-Z0-9_-]+\.(webp|png|jpg)$/,
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
 * @param {{video: string | null, poster: string | null, captions: string | null, transcript: string | null}} guest
 * @param {{generalVideo: string | null, generalPoster: string | null, generalCaptions: string | null, generalTranscript: string | null}} config
 * @param {string} [publicRoot]
 */
export async function resolveStoryVideo(guest, config, publicRoot) {
  const personal = await availableMedia(guest.video, "video", publicRoot);
  const source = personal ?? await availableMedia(config.generalVideo, "video", publicRoot);
  if (!source) return null;
  const [poster, captions] = await Promise.all([
    availableMedia(personal ? guest.poster : config.generalPoster, "image", publicRoot),
    availableMedia(personal ? guest.captions : config.generalCaptions, "captions", publicRoot),
  ]);
  return {
    source, poster, captions,
    transcript: personal ? guest.transcript : config.generalTranscript,
    personalized: Boolean(personal),
  };
}
