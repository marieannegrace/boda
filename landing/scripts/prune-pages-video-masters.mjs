import { createHash } from "node:crypto";
import { readdir, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const outputRoot = path.join(root, "out");
const videoPattern = /^\/videos\/[a-zA-Z0-9_ -]+\.mp4$/i;
const derivativePattern = /^\/media\/[a-z0-9-]+\.mp4$/;

async function checksum(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function totalBytes(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    total += entry.isDirectory() ? await totalBytes(file) : (await stat(file)).size;
  }
  return total;
}

const catalog = JSON.parse(await readFile(path.join(publicRoot, "media", "catalog.json"), "utf8"));
const inventory = JSON.parse(await readFile(path.join(publicRoot, "media", "inventory.json"), "utf8"));
if (!Array.isArray(catalog.videos) || !Array.isArray(inventory.videos)) {
  throw new Error("Invalid video catalog or inventory.");
}

const sourceNames = (await readdir(path.join(publicRoot, "videos")))
  .filter((name) => /\.mp4$/i.test(name)).sort();
const catalogNames = catalog.videos.map((video) => {
  if (!video || typeof video.original !== "string" || !videoPattern.test(video.original)
    || typeof video.source !== "string" || !derivativePattern.test(video.source)) {
    throw new Error(`Invalid video catalog entry: ${JSON.stringify(video)}`);
  }
  return video.original.slice("/videos/".length);
}).sort();
if (JSON.stringify(sourceNames) !== JSON.stringify(catalogNames)) {
  throw new Error("Every public video master must have exactly one optimized catalog entry.");
}

const inventoryByOriginal = new Map(inventory.videos.map((video) => [video.original, video]));
const outputVideos = [];
for (const video of catalog.videos) {
  const master = path.join(publicRoot, video.original.slice(1));
  const derivative = path.join(publicRoot, video.source.slice(1));
  const exportedDerivative = path.join(outputRoot, video.source.slice(1));
  const record = inventoryByOriginal.get(video.original);
  if (!record || record.originalSha256 !== video.originalSha256
    || await checksum(master) !== video.originalSha256) {
    throw new Error(`Video master checksum does not match the optimized inventory: ${video.original}`);
  }
  if (!(await stat(derivative)).isFile() || !(await stat(exportedDerivative)).isFile()) {
    throw new Error(`Optimized video is missing from public assets or export: ${video.source}`);
  }
  outputVideos.push({ source: path.join(outputRoot, video.original.slice(1)), bytes: video.originalBytes });
}

const beforeBytes = await totalBytes(outputRoot);
for (const video of outputVideos) await unlink(video.source);
const remaining = await readdir(path.join(outputRoot, "videos"), { withFileTypes: true }).catch((error) => {
  if (error.code === "ENOENT") return [];
  throw error;
});
if (remaining.some((entry) => entry.isFile() && /\.mp4$/i.test(entry.name))) {
  throw new Error("An original MP4 master is still present in the Pages export.");
}

const afterBytes = await totalBytes(outputRoot);
console.log(`Removed ${outputVideos.length} source MP4 copies from the Pages export only.`);
console.log(`Original masters in public/videos remain unchanged; optimized catalog media remains in public/media.`);
console.log(`Export size: ${beforeBytes} -> ${afterBytes} bytes (${beforeBytes - afterBytes} bytes removed).`);