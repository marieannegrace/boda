import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { availableMedia, resolveStoryVideo } from "../src/lib/story-media.mjs";

const config = JSON.parse(await readFile(new URL("../src/data/stories.json", import.meta.url), "utf8"));
const guests = JSON.parse(await readFile(new URL("../src/data/guests.json", import.meta.url), "utf8"));

test("six editorial stories have a 30-second nominal sequence and no fabricated media", () => {
  assert.deepEqual(config.slides.map((item) => item.id), ["cover", "history", "family", "moment", "message", "closing"]);
  assert.ok(config.slides.every((item) => item.duration >= 3 && item.duration <= 5));
  assert.equal(config.slides.reduce((total, item) => total + item.duration, 0), 30);
  assert.equal(config.generalVideo, null);
  assert.equal(config.photo, null);
  assert.ok(!Object.hasOwn(config, "guests"), "Guest identity belongs only to guests.json.");
});

test("all six initial guests have an honest message placeholder until real media exists", async () => {
  for (const guest of Object.values(guests)) assert.equal(await resolveStoryVideo(guest, config), null);
});

test("media selection: personalized -> general -> absent; never mix other families or captions", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "love-issue-test-"));
  try {
    await Promise.all(["videos", "images"].map((directory) => mkdir(path.join(root, directory))));
    for (const name of ["general.mp4", "other-family.mp4", "general.vtt"]) {
      await writeFile(path.join(root, "videos", name), "test-only file availability fixture");
    }
    await writeFile(path.join(root, "images", "general.webp"), "test-only poster availability fixture");
    const guest = { video: "/videos/selected.mp4", poster: "/images/selected.webp", captions: "/videos/selected.vtt", transcript: "Selected transcript" };
    const general = { generalVideo: "/videos/general.mp4", generalPoster: "/images/general.webp", generalCaptions: "/videos/general.vtt", generalTranscript: "General transcript" };
    assert.deepEqual(await resolveStoryVideo(guest, general, root), {
      source: "/videos/general.mp4", poster: "/images/general.webp", captions: "/videos/general.vtt",
      transcript: "General transcript", personalized: false,
    });
    await writeFile(path.join(root, "videos", "selected.mp4"), "test-only file availability fixture");
    assert.deepEqual(await resolveStoryVideo(guest, general, root), {
      source: "/videos/selected.mp4", poster: null, captions: null, transcript: "Selected transcript", personalized: true,
    });
    await rm(path.join(root, "videos", "selected.mp4"));
    await rm(path.join(root, "videos", "general.mp4"));
    assert.equal(await resolveStoryVideo(guest, general, root), null);
    await assert.rejects(availableMedia("/videos/../private.mp4", "video", root), /Invalid story video path/);
    await assert.rejects(availableMedia("https://third-party.test/file.mp4", "video", root), /Invalid story video path/);
    await assert.rejects(availableMedia("/images/private.svg", "image", root), /Invalid story image path/);
    await mkdir(path.join(root, "videos", "directory.mp4"));
    await assert.rejects(availableMedia("/videos/directory.mp4", "video", root), /not a file/);
    await assert.rejects(availableMedia("/videos/general.mp4", "video", 42), TypeError);
  } finally {
    await rm(root, { recursive: true });
  }
});
