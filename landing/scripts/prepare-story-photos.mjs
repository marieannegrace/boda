import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { discoverStoryPhotos } from "../src/lib/story-media.mjs";

const publicRoot = path.join(process.cwd(), "public");
const output = path.join(publicRoot, "images", "stories");
const config = JSON.parse(await readFile("src/data/stories.json", "utf8"));
await mkdir(output, { recursive: true });
await mkdir(".cache", { recursive: true });
const catalog = [];
for (const { file, edition } of await discoverStoryPhotos(publicRoot)) {
  if (!edition) {
    console.warn(`Story photo has no recognized edition: ${file}`);
    continue;
  }
  const master = await readFile(path.join(publicRoot, "posters", file));
  const hash = createHash("sha256").update(master).digest("hex").slice(0, 16);
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
  for (const size of [...new Set([Math.min(480, width), Math.min(960, width), Math.min(1440, width)])]) {
    const name = `${hash}-${size}.webp`;
    await sharp(master).rotate().resize({ width: size, withoutEnlargement: true })
      .webp({ quality: 84 }).toFile(path.join(output, name));
    variants.push({ source: `/images/stories/${name}`, width: size });
  }
  catalog.push({
    file, edition, source: variants.at(-1).source, width, height, variants,
    treatment, focalPoint, alt: override?.alt ?? "",
  });
}
await writeFile(path.join(".cache", "story-photos.json"), JSON.stringify(catalog, null, 2));
console.log(`${catalog.length} story photos prepared, masters unchanged; responsive WebP derivatives only.`);
