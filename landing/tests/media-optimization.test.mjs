import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";

const root = path.resolve("public");
const catalog = JSON.parse(await readFile(path.join(root, "media", "catalog.json"), "utf8"));
const bytes = (source) => readFile(path.join(root, source));
function atomsOf(buffer) {
  const atoms = [];
  for (let offset = 0; offset + 8 <= buffer.length;) {
    const size = buffer.readUInt32BE(offset);
    assert.ok(size >= 8, "expected standard-sized MP4 atoms");
    atoms.push(buffer.toString("ascii", offset + 4, offset + 8));
    offset += size;
  }
  return atoms;
}

test("all seven real videos have distinct progressive H264/AAC derivatives and per-video posters", async () => {
  assert.equal(catalog.videos.length, 7);
  assert.equal(new Set(catalog.videos.map((video) => video.original)).size, 7);
  assert.equal(new Set(catalog.videos.map((video) => video.poster)).size, 7);
  assert.ok(catalog.videos.some((video) => video.original === "/videos/florisyabsalon.mp4"));
  assert.ok(catalog.videos.some((video) => video.original === "/videos/florisyabsalon 2.mp4"));
  for (const video of catalog.videos) {
    assert.match(video.source, /^\/media\/[a-z0-9-]+\.mp4$/);
    const [original, optimized, poster] = await Promise.all([bytes(video.original), bytes(video.source), bytes(video.poster)]);
    assert.ok(optimized.length < original.length, video.original);
    assert.equal(video.originalBytes, original.length);
    assert.equal(video.originalSha256, createHash("sha256").update(original).digest("hex"));
    assert.equal(video.bytes, optimized.length);
    const atoms = atomsOf(optimized);
    assert.ok(atoms.indexOf("moov") >= 0 && atoms.indexOf("moov") < atoms.indexOf("mdat"), "fast-start moov before mdat");
    assert.ok(optimized.includes(Buffer.from("avc1")), "H264 video");
    assert.ok(optimized.includes(Buffer.from("mp4a")), "AAC audio");
    const metadata = await sharp(poster).metadata();
    assert.equal(metadata.format, "webp");
    assert.ok(Math.max(metadata.width, metadata.height) <= 1440);
    assert.ok(poster.length < 250000);
  }
});

test("compatible music copy is smaller and leaves the original WEBA present", async () => {
  assert.equal(catalog.music.original, "/audio/videoplayback.weba");
  assert.match(catalog.music.source, /^\/media\/[a-z0-9-]+\.(m4a|mp3)$/);
  const [original, optimized] = await Promise.all([bytes(catalog.music.original), bytes(catalog.music.source)]);
  assert.equal(original.length, catalog.music.originalBytes);
  assert.equal(catalog.music.originalSha256, createHash("sha256").update(original).digest("hex"));
  assert.equal(optimized.length, catalog.music.bytes);
  assert.ok(optimized.length < original.length);
  assert.ok(catalog.music.duration > 10);
  if (catalog.music.source.endsWith(".m4a")) {
    const atoms = atomsOf(optimized);
    assert.ok(atoms.indexOf("moov") >= 0 && atoms.indexOf("moov") < atoms.indexOf("mdat"), "music fast-start");
  }
});

test("every responsive photograph keeps its ratio, frame and small-screen candidates", async () => {
  const photos = JSON.parse(await readFile(".cache/story-photos.json", "utf8"));
  assert.equal(photos.length, 45);
  for (const photo of photos) {
    assert.ok(photo.variants[0].width <= 480);
    assert.ok(photo.variants.at(-1).width <= 1440);
    assert.ok(photo.focalPoint.x >= 0 && photo.focalPoint.x <= 100);
    assert.ok(photo.focalPoint.y >= 0 && photo.focalPoint.y <= 100);
    for (const variant of photo.variants) {
      const file = path.join(root, variant.source);
      const [metadata, info] = await Promise.all([sharp(file).metadata(), stat(file)]);
      assert.equal(metadata.width, variant.width);
      assert.ok(Math.abs(metadata.width / metadata.height - photo.width / photo.height) < 0.02);
      assert.ok(info.size < 400000, `${photo.file} exceeds the reviewed 400KB derivative budget`);
    }
  }
});
