import { test, expect } from "@playwright/test";
import { goToStory } from "./story-navigation";

test.skip(!process.env.STORIES_MEDIA_FIXTURE, "Requires a local-only synthetic fixture build, never production media.");
const route = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/lectura/`;

async function videoState(video: import("@playwright/test").Locator) {
  return video.evaluate((element) => {
    if (!(element instanceof HTMLVideoElement)) throw new Error("Expected a story video");
    return {
      currentTime: element.currentTime, ratio: element.videoWidth / element.videoHeight,
      muted: element.muted, controls: element.controls, paused: element.paused, ended: element.ended,
    };
  });
}

async function message(page: import("@playwright/test").Page, reduced = false) {
  await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Abrir mi edición" }).click();
  await goToStory(issue, 4);
  await expect(issue).toHaveAttribute("data-story-index", "4");
  return issue;
}

test("Love Issue video fixture: lazy muted vertical playback uses real duration and advances on ended", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => { if (/\.mp4/.test(request.url())) requests.push(request.url()); });
  await page.goto(route);
  await expect(page.locator("video")).toHaveCount(0);
  expect(requests).toEqual([]);
  const issue = await message(page);
  const video = issue.locator("video");
  await expect.poll(async () => (await videoState(video)).currentTime).toBeGreaterThan(0.1);
  expect((await videoState(video)).ratio).toBeCloseTo(9 / 16, 1);
  expect((await videoState(video)).muted).toBe(true);
  expect((await videoState(video)).controls).toBe(false);
  await expect(video).toHaveAttribute("poster", /\/boda\/images\/story-fixture.png/);
  await issue.getByRole("button", { name: "Escuchar video" }).click();
  expect((await videoState(video)).muted).toBe(false);
  await page.waitForTimeout(4800);
  await expect(issue).toHaveAttribute("data-story-index", "4");
  await expect(issue).toHaveAttribute("data-story-index", "5", { timeout: 5000 });
  await expect(video).toHaveCount(0);
  expect(requests.every((url) => url.endsWith("/boda/videos/story-fixture.mp4"))).toBe(true);
});

test("Love Issue video fixture: reduced motion requires play, pause works, and progress survives a hold", async ({ page }) => {
  const issue = await message(page, true);
  const video = issue.locator("video");
  expect((await videoState(video)).paused).toBe(true);
  await issue.getByRole("button", { name: "Reproducir video", exact: true }).first().click();
  await expect.poll(async () => (await videoState(video)).currentTime).toBeGreaterThan(0.1);
  await issue.getByRole("button", { name: "Pausar video", exact: true }).click();
  const pausedAt = (await videoState(video)).currentTime;
  await page.waitForTimeout(500);
  expect((await videoState(video)).currentTime).toBeCloseTo(pausedAt, 1);
  await issue.getByRole("button", { name: "Reproducir video", exact: true }).first().click();
  const surface = issue.locator('[class*="surface"]');
  await surface.scrollIntoViewIfNeeded();
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error("Missing surface");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 3);
  await page.mouse.down();
  await expect(issue).toHaveAttribute("data-holding", "true");
  await expect.poll(async () => (await videoState(video)).paused).toBe(true);
  const heldAt = (await videoState(video)).currentTime;
  await page.waitForTimeout(400);
  expect((await videoState(video)).currentTime).toBeCloseTo(heldAt, 1);
  await page.mouse.up();
  await expect.poll(async () => (await videoState(video)).currentTime).toBeGreaterThan(heldAt);
  await expect.poll(async () => (await videoState(video)).ended, { timeout: 10000 }).toBe(true);
  await expect(issue).toHaveAttribute("data-story-index", "4");
});

test("Love Issue video fixture: failed media offers retry and does not trap the invitation", async ({ page }) => {
  await page.route("**/story-fixture.mp4", (request) => request.abort());
  const issue = await message(page);
  await expect(issue).toContainText("El mensaje no pudo cargarse");
  await expect(issue.getByRole("button", { name: "Reintentar mensaje" })).toBeVisible();
  await expect(issue.locator("video")).toHaveCount(0);
  await expect(issue.locator('[data-story-id="message"]')).toContainText("DE NUESTRA VOZ A USTEDES");
  await issue.getByRole("button", { name: "Historia siguiente" }).click();
  await expect(issue.getByRole("link", { name: "Ver la invitación", exact: true })).toBeVisible();
});

test("Love Issue video fixture: failed story photo leaves an editorial composition, never a broken image", async ({ page }) => {
  await page.route("**/images/stories/**", (request) => request.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Abrir mi edición" }).click();
  await goToStory(issue, 3);
  const moment = issue.locator('[data-story-id="moment"]');
  await expect(moment).toContainText("Ahora queremos escribir una nueva página juntos.");
  await expect(moment.locator("img")).toHaveCount(0);
  await expect(moment).not.toContainText(/pendiente|placeholder|no pudo cargarse/i);
});

test("Love Issue video fixture: captions can be toggled and transcript opens only when provided", async ({ page }) => {
  const issue = await message(page, true);
  const cc = issue.getByRole("button", { name: "Subtítulos", exact: true });
  await expect(cc).toHaveAttribute("aria-pressed", "false");
  await cc.click();
  await expect(cc).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => issue.locator("video").evaluate((element: HTMLVideoElement) => element.textTracks[0]?.mode)).toBe("showing");
  await cc.click();
  await expect.poll(() => issue.locator("video").evaluate((element: HTMLVideoElement) => element.textTracks[0]?.mode)).toBe("hidden");
  await issue.getByText("Leer el mensaje", { exact: true }).click();
  await expect(issue.locator("details")).toContainText("Synthetic media transcript");
});

test("Love Issue music starts under gesture, remains continuous, ducks without pausing and restores without restarting", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  const audioRequests: string[] = [];
  page.on("request", (request) => { if (request.url().endsWith(".mp3")) audioRequests.push(request.url()); });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  const audio = issue.locator("audio");
  await expect(audio).not.toHaveAttribute("src");
  expect(audioRequests).toEqual([]);
  await issue.getByRole("button", { name: "Abrir mi edición", exact: true }).click();
  const time = () => audio.evaluate((el: HTMLAudioElement) => el.currentTime);
  const paused = () => audio.evaluate((el: HTMLAudioElement) => el.paused);
  await expect.poll(time).toBeGreaterThan(0.1);
  expect(await audio.evaluate((el: HTMLAudioElement) => ({ loop: el.loop, volume: el.volume })))
    .toEqual({ loop: true, volume: 1 });
  const begun = await time();
  await goToStory(issue, 1);
  await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
  await expect.poll(time).toBeGreaterThan(begun);
  await issue.getByRole("button", { name: "Silenciar música", exact: true }).click();
  await expect.poll(paused).toBe(true);
  const mutedAt = await time();
  await issue.getByRole("button", { name: "Activar música", exact: true }).click();
  await expect.poll(time).toBeGreaterThan(mutedAt);
  await goToStory(issue, 4);
  await issue.getByRole("button", { name: "Reproducir video", exact: true }).first().click();
  await expect.poll(() => videoState(issue.locator("video"))).toMatchObject({ paused: false, muted: true });
  await expect.poll(paused).toBe(false);
  await issue.getByRole("button", { name: "Escuchar video", exact: true }).click();
  await expect(issue).toHaveAttribute("data-music-effective-volume", "0.0032");
  await expect.poll(paused).toBe(false);
  const duckedAt = await time();
  await expect.poll(() => videoState(issue.locator("video")), { timeout: 10000 }).toMatchObject({ ended: true });
  await expect(issue).toHaveAttribute("data-music-effective-volume", "0.16");
  await expect(issue).toHaveAttribute("data-story-index", "4");
  await expect.poll(time).toBeGreaterThan(duckedAt);
  const resumedAt = await time();
  await goToStory(issue, 5);
  await expect.poll(time).toBeGreaterThan(resumedAt);
  await issue.getByRole("link", { name: "Ver la invitación", exact: true }).click();
  await expect.poll(paused).toBe(true);
});

test("Love Issue music load failure removes the broken control and preserves the edition", async ({ page }) => {
  await page.route("**/the-love-issue.mp3", (request) => request.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Abrir mi edición", exact: true }).click();
  await expect(issue.locator("audio")).toHaveCount(0);
  await expect(issue).toContainText("No se pudo cargar la música");
  await goToStory(issue, 5);
  await expect(issue.getByRole("link", { name: "Ver la invitación", exact: true })).toBeVisible();
});

test("Love Issue blocked audio keeps an explicit retry and does not pretend music is playing", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let blocked = true;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLAudioElement && blocked) {
        blocked = false;
        return Promise.reject(new DOMException("Test autoplay policy", "NotAllowedError"));
      }
      return original.call(this);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Abrir mi edición", exact: true }).click();
  await expect(issue).toContainText("Pulsa Activar música");
  await expect(issue.getByRole("button", { name: "Activar música", exact: true })).toHaveAttribute("aria-pressed", "false");
  await issue.getByRole("button", { name: "Activar música", exact: true }).click();
  await expect.poll(() => issue.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(0.1);
});
