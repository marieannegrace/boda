import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { discoverStoryPhotos } from "../src/lib/story-media.mjs";

const publicRoot = path.join(process.cwd(), "public");
const output = path.join(publicRoot, "images", "stories");
const config = JSON.parse(await readFile("src/data/stories.json", "utf8"));
const settings = { widths: [360, 720, 1280], quality: 80, effort: 6 };
await mkdir(output, { recursive: true });
await mkdir(".cache", { recursive: true });
const catalog = [];
const inventory = [];
for (const { file, edition } of await discoverStoryPhotos(publicRoot)) {
  if (!edition) {
    console.warn(`Story photo has no recognized edition: ${file}`);
    continue;
  }
  const master = await readFile(path.join(publicRoot, "posters", file));
  const originalSha256 = createHash("sha256").update(master).digest("hex");
  const hash = createHash("sha256").update(master).update(JSON.stringify(settings)).digest("hex").slice(0, 16);
  const metadata = await sharp(master).metadata();
  const width = metadata.autoOrient.width;
  const height = metadata.autoOrient.height;
  const override = config.photography.overrides[file];
  const treatment = override?.treatment ?? (width > height ? "memory" : "editorial");
  if (!["hero", "editorial", "memory"].includes(treatment)) throw new Error(`Invalid photo treatment: ${file}`);
  const focalPoint = override?.focalPoint ?? { x: 50, y: 50 };
  if (![focalPoint.x, focalPoint.y].every((n) => Number.isFinite(n) && n >= 0 && n <= 100)) {
    throw new Error(`Invalid photo focal point: ${file}`);
  }
  const variants = [];
  const measurements = [];
  for (const size of [...new Set(settings.widths.map((size) => Math.min(size, width)))]) {
    const name = `${hash}-${size}.webp`;
    const result = await sharp(master).rotate().resize({ width: size, withoutEnlargement: true })
      .webp({ quality: settings.quality, effort: settings.effort }).toFile(path.join(output, name));
    variants.push({ source: `/images/stories/${name}`, width: size });
    measurements.push({ source: `/images/stories/${name}`, width: result.width, height: result.height, bytes: result.size });
  }
  catalog.push({
    file, edition, source: variants.at(-1).source, width, height, variants,
    treatment, focalPoint, alt: override?.alt ?? "",
  });
  if (createHash("sha256").update(await readFile(path.join(publicRoot, "posters", file))).digest("hex") !== originalSha256) {
    throw new Error(`Master changed during processing: ${file}`);
  }
  inventory.push({ file, originalBytes: master.length, originalSha256, width, height, variants: measurements });
}
await writeFile(path.join(".cache", "story-photos.json"), JSON.stringify(catalog, null, 2));
await writeFile(path.join(output, "inventory.json"), JSON.stringify({ settings, photos: inventory }, null, 2));
const current = new Set(catalog.flatMap((photo) => photo.variants.map((variant) => path.basename(variant.source))));
for (const file of await readdir(output)) {
  if (/^[a-f0-9]{16}-\d+\.webp$/.test(file) && !current.has(file)) await unlink(path.join(output, file));
}
console.log(`${catalog.length} story photos prepared, masters unchanged; responsive WebP derivatives only.`);
