import sharp from "sharp";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const output = path.join(publicRoot, "media");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";
const settings = {
  revision: 1, maxEdge: 960, crf: 22, preset: "slow",
  videoAudioBitrate: "128k", musicBitrate: "96k",
  posterQuality: 82, posterTime: 1,
};

function run(executable, args) {
  const result = spawnSync(executable, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, windowsHide: true });
  if (result.error) {
    throw new Error(`Cannot run ${executable}. Install local FFmpeg tooling or set FFMPEG_PATH and FFPROBE_PATH.`, { cause: result.error });
  }
  if (result.status !== 0) throw new Error(`${executable} exited ${result.status}:\n${result.stderr}`);
  return result.stdout;
}

function probe(file) {
  return JSON.parse(run(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
}

async function checksum(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function exists(file) {
  try { return (await stat(file)).isFile(); }
  catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function nameFor(originalSha256, recipe) {
  return createHash("sha256").update(originalSha256).update(JSON.stringify(recipe)).digest("hex").slice(0, 24);
}

const ffmpegVersion = run(ffmpeg, ["-version"]).split(/\r?\n/)[0];
const ffprobeVersion = run(ffprobe, ["-version"]).split(/\r?\n/)[0];
await mkdir(output, { recursive: true });
const catalog = { videos: [], music: null };
const inventory = { settings, ffmpegVersion, ffprobeVersion, sharpVersion: sharp.versions.sharp, videos: [], music: null };
for (const file of (await readdir(path.join(publicRoot, "videos"))).filter((file) => /\.mp4$/i.test(file)).sort()) {
  const original = `/videos/${file}`;
  const input = path.join(publicRoot, "videos", file);
  const originalSha256 = await checksum(input);
  const before = probe(input);
  const originalVideo = before.streams.find((stream) => stream.codec_type === "video");
  if (!originalVideo) throw new Error(`No video stream: ${file}`);
  const duration = Number(before.format.duration);
  if (!(duration > 0)) throw new Error(`Invalid duration: ${file}`);
  const hash = nameFor(originalSha256, { kind: "video", ...settings });
  const source = `/media/${hash}.mp4`;
  const target = path.join(output, `${hash}.mp4`);
  if (!(await exists(target))) {
    const pending = path.join(output, `${hash}.pending.mp4`);
    try {
      run(ffmpeg, [
        "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", input,
        "-map", "0:v:0", "-map", "0:a:0?", "-map_metadata", "-1", "-map_chapters", "-1",
        "-vf", `scale=w='min(iw,${settings.maxEdge})':h='min(ih,${settings.maxEdge})':force_original_aspect_ratio=decrease:force_divisible_by=2:reset_sar=1`,
        "-c:v", "libx264", "-preset", settings.preset, "-crf", String(settings.crf),
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level:v", "3.1", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", settings.videoAudioBitrate, "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart", pending,
      ]);
      await rename(pending, target);
    } finally {
      if (await exists(pending)) await unlink(pending);
    }
  }
  const after = probe(target);
  const video = after.streams.find((stream) => stream.codec_type === "video");
  const audio = after.streams.find((stream) => stream.codec_type === "audio");
  if (video?.codec_name !== "h264" || video.pix_fmt !== "yuv420p" ||
      (before.streams.some((stream) => stream.codec_type === "audio") && audio?.codec_name !== "aac") ||
      Math.max(video.width, video.height) > settings.maxEdge ||
      Math.abs(Number(after.format.duration) - duration) > 0.15) {
    throw new Error(`Unexpected derivative codec/dimensions/duration: ${file}`);
  }
  const posterHash = nameFor(originalSha256, { kind: "poster", ...settings });
  const poster = `/media/${posterHash}.webp`;
  const posterPath = path.join(output, `${posterHash}.webp`);
  if (!(await exists(posterPath))) {
    const frame = spawnSync(ffmpeg, [
      "-hide_banner", "-loglevel", "error", "-nostdin",
      "-ss", String(Math.min(settings.posterTime, duration / 2)), "-i", input,
      "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1",
    ], { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
    if (frame.error || frame.status !== 0) throw new Error(`Poster extraction failed: ${file}`, { cause: frame.error });
    await sharp(frame.stdout).resize({ width: video.width, height: video.height, fit: "inside", withoutEnlargement: true })
      .webp({ quality: settings.posterQuality, effort: 6 }).toFile(posterPath);
  }
  if (await checksum(input) !== originalSha256) throw new Error(`Master changed during processing: ${file}`);
  const record = {
    original, originalSha256, source, poster, originalBytes: (await stat(input)).size, bytes: (await stat(target)).size,
    duration: Number(after.format.duration), width: video.width, height: video.height,
  };
  catalog.videos.push(record);
  const posterMetadata = await sharp(posterPath).metadata();
  inventory.videos.push({
    ...record, originalSha256, originalDuration: duration, originalWidth: originalVideo.width, originalHeight: originalVideo.height,
    sha256: await checksum(target), posterBytes: (await stat(posterPath)).size,
    posterWidth: posterMetadata.width, posterHeight: posterMetadata.height,
  });
  console.log(`${file}: ${record.originalBytes} -> ${record.bytes} bytes; ${video.width}x${video.height}, matching poster ${poster}`);
}

const musicOriginal = "/audio/videoplayback.weba";
const musicInput = path.join(publicRoot, "audio", "videoplayback.weba");
const originalSha256 = await checksum(musicInput);
const musicBefore = probe(musicInput);
const musicHash = nameFor(originalSha256, { kind: "music", ...settings });
const musicTarget = path.join(output, `${musicHash}.m4a`);
if (!(await exists(musicTarget))) {
  const pending = path.join(output, `${musicHash}.pending.m4a`);
  try {
    run(ffmpeg, [
      "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", musicInput,
      "-map", "0:a:0", "-vn", "-map_metadata", "-1", "-map_chapters", "-1",
      "-c:a", "aac", "-b:a", settings.musicBitrate, "-ar", "48000", "-ac", "2",
      "-movflags", "+faststart", pending,
    ]);
    await rename(pending, musicTarget);
  } finally {
    if (await exists(pending)) await unlink(pending);
  }
}
const musicAfter = probe(musicTarget);
if (musicAfter.streams.find((stream) => stream.codec_type === "audio")?.codec_name !== "aac" ||
    Math.abs(Number(musicAfter.format.duration) - Number(musicBefore.format.duration)) > 0.15) {
  throw new Error("Unexpected music derivative codec/duration");
}
if (await checksum(musicInput) !== originalSha256) throw new Error("Music master changed during processing");
catalog.music = {
  original: musicOriginal, originalSha256, source: `/media/${musicHash}.m4a`,
  originalBytes: (await stat(musicInput)).size, bytes: (await stat(musicTarget)).size,
  duration: Number(musicAfter.format.duration),
};
inventory.music = { ...catalog.music, originalSha256, sha256: await checksum(musicTarget) };
await writeFile(path.join(output, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(path.join(output, "inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`Prepared ${catalog.videos.length} video/poster pairs and compatible AAC music; all masters unchanged.`);
