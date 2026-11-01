import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const master = path.resolve(root, "..", "Dorado Ilustrado Boda Invitación (20.5 x 13 cm).png");
const output = path.join(root, "public", "invitation");
await mkdir(output, { recursive: true });

// Only the reading orientation and resolution change; the original remains intact.
await sharp(master)
  .rotate(90)
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ lossless: true, effort: 6 })
  .toFile(path.join(output, "invitation.webp"));
console.log(await sharp(path.join(output, "invitation.webp")).metadata());
