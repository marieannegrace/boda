import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { availableMedia, resolveStoryVideo, resolveStoryVideos, resolveStoryImages, discoverStoryPhotos, photoEdition, historyPages } from "../src/lib/story-media.mjs";

const config = JSON.parse(await readFile(new URL("../src/data/stories.json", import.meta.url), "utf8"));
const guests = JSON.parse(await readFile(new URL("../src/data/guests.json", import.meta.url), "utf8"));

test("six editorial stories have a 30-second nominal sequence and no fabricated media", () => {
  assert.deepEqual(config.slides.map((item) => item.id), ["cover", "history", "family", "moment", "message", "closing"]);
  assert.ok(config.slides.every((item) => item.duration >= 3 && item.duration <= 5));
  assert.equal(config.slides.reduce((total, item) => total + item.duration, 0), 30);
  if (config.generalVideo) assert.match(config.generalVideo, /^\/videos\/[a-zA-Z0-9_-]+\.mp4$/);
  if (config.photo) assert.match(config.photo, /^\/images\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/);
  assert.ok(!Object.hasOwn(config, "guests"), "Guest identity belongs only to guests.json.");
});

test("all guests receive an editorial edition without fabricated media", async () => {
  for (const guest of Object.values(guests)) {
    const video = await resolveStoryVideo(guest, config);
    if (video) assert.equal(video.source, video.personalized ? guest.video : config.generalVideo);
  }
  assert.equal(config.number, "NO. 001");
  assert.equal(config.messageSignoff, "Con cariño,");
  assert.doesNotMatch(JSON.stringify(config), /placeholder|video pendiente|foto.*pendiente|undefined|NaN/i);
});

test("the data directory contains only one guest source", async () => {
  const sources = [];
  for (const file of await readdir(new URL("../src/data/", import.meta.url))) {
    if (!file.endsWith(".json")) continue;
    const json = JSON.parse(await readFile(new URL(`../src/data/${file}`, import.meta.url), "utf8"));
    if (JSON.stringify(json).includes('"slug":"mariayroberto"')) sources.push(file);
  }
  assert.deepEqual(sources, ["guests.json"]);
});

test("photo classification ignores decorative prefixes and keeps the two Roberto editions separate", () => {
  for (const [file, edition] of [
    ["K luis y marie 2.JPG", "global"], ["R roberto 3.jpg", "roberto"],
    ["& maria y roberto 10.JPG", "mariayroberto"], ["T giovanna 3.jpg", "giovanna"],
    ["F absalon y flor 01.jpg", "florisyabsalon"], ["M amparo y eduardo.JPG", "amparoyeduardo"],
    ["roberto  y maria 10.jpg", "mariayroberto"], ["mercedes 1.jpg", "mercedes"],
    ["not-giovanna-family.jpg", "giovanna"], ["K unknown.jpg", null],
  ]) assert.equal(photoEdition(file), edition);
});

test("every real photo is associated and retained in natural order without any artificial cap", async () => {
  const files = await discoverStoryPhotos();
  assert.ok(files.length >= 45);
  assert.ok(files.every((item) => item.edition));
  assert.equal(files.filter((item) => item.edition === "global").length, 2);
  const selected = files.filter((item) => item.edition === "giovanna");
  assert.ok(selected.findIndex((item) => item.file === "giovanna 3.jpg") < selected.findIndex((item) => item.file === "giovanna 10.jpg"));
  for (const edition of new Set(files.map((item) => item.edition))) {
    const photos = files.filter((item) => item.edition === edition);
    const pages = historyPages(photos);
    assert.equal(pages[0].kind, "intro");
    assert.deepEqual(pages.flatMap((page) => page.photos), photos);
    assert.ok(pages.every((page) => page.photos.length <= 2));
  }
  for (const count of [0, 1, 9, 15, 20]) {
    const photos = Array.from({ length: count }, (_, i) => ({ file: `test-${i}.jpg` }));
    assert.deepEqual(historyPages(photos).flatMap((page) => page.photos), photos);
  }
});

test("audio is optional and restricted to supported local audio paths", async () => {
  assert.equal(await availableMedia("/audio/missing-track.mp3", "audio"), null);
  await assert.rejects(availableMedia("/audio/../private.mp3", "audio"), /Invalid story audio path/);
  assert.equal(await availableMedia("/audio/videoplayback.weba", "audio"), "/audio/videoplayback.weba");
});

test("actual one/two-video filenames resolve consistently with case and spaces, without leaking another edition", async () => {
  for (const [slug, names] of [
    ["giovanna", ["GIOVANNA.mp4", "GIOVANNA 2.mp4"]],
    ["roberto", ["ROBERTO.mp4", "ROBERTO 2.mp4"]],
    ["mariayroberto", ["ROBERTO Y MARIA.mp4"]],
    ["amparoyeduardo", []], ["mercedes", []], ["florisyabsalon", ["florisyabsalon.mp4", "florisyabsalon 2.mp4"]], ["default", []],
  ]) {
    const videos = await resolveStoryVideos(guests[slug], config);
    assert.deepEqual(videos.map((video) => path.basename(video.source)), names);
    assert.deepEqual(videos.map((video) => video.kind), names.map((_, n) => n ? "special" : "invitation"));
    if (slug === "florisyabsalon") {
      assert.deepEqual(videos.map((video) => video.recipient), ["los abuelos Floris y Absalon", "Charlotte"]);
    }
  }
});

test("upload conventions discover only the selected family's photos and poster without editing JSON", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "love-issue-upload-test-"));
  const guest = { ...guests.giovanna };
  try {
    await Promise.all(["videos", "images", "posters"].map((directory) => mkdir(path.join(root, directory))));
    const upload = (file) => writeFile(path.join(root, file), "availability-only test asset");
    const empty = { ...config };
    assert.deepEqual(await resolveStoryImages(guest, empty, root), { photo: null, historyPhoto: null });
    await Promise.all([
      upload("images/cover.jpg"), upload("images/history.jpg"), upload("images/other-family.jpg"),
      upload("posters/other-family.jpg"), upload("videos/other-family.mp4"),
    ]);
    assert.equal(await resolveStoryVideo(guest, empty, root), null);
    assert.deepEqual(await resolveStoryImages(guest, empty, root), { photo: "/images/cover.jpg", historyPhoto: "/images/history.jpg" });
    await upload("images/luis-marie.jpg");
    assert.equal((await resolveStoryImages(guest, empty, root)).photo, "/images/luis-marie.jpg");
    await upload("images/giovanna.jpg");
    assert.equal((await resolveStoryImages(guest, empty, root)).photo, "/images/giovanna.jpg");
    await upload("videos/giovanna.mp4");
    await upload("posters/giovanna.jpg");
    assert.deepEqual(await resolveStoryVideo(guest, empty, root), {
      source: guest.video, poster: "/posters/giovanna.jpg", captions: null, transcript: null, personalized: true,
    });
    guest.poster = "/images/custom.jpg";
    await upload("images/custom.jpg");
    assert.equal((await resolveStoryVideo(guest, empty, root)).poster, "/images/custom.jpg");
    assert.deepEqual(await resolveStoryImages(guests.default, empty, root), {
      photo: "/images/luis-marie.jpg", historyPhoto: "/images/history.jpg",
    });
    await assert.rejects(availableMedia("/posters/../../secret.jpg", "image", root), /Invalid story image path/);
  } finally { await rm(root, { recursive: true }); }
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
