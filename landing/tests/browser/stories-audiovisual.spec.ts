import { test, expect, type Page } from "@playwright/test";
import guests from "../../src/data/guests.json";
import { goToStory } from "./story-navigation";
import path from "node:path";
import { readFileSync } from "node:fs";

const optimized: { videos: { original: string; source: string }[] } = JSON.parse(readFileSync("public/media/catalog.json", "utf8"));

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
async function open(page: Page, slug = "giovanna") {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/${slug}/lectura/`);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Entrar con sonido", exact: true }).click();
  return issue;
}

for (const guest of Object.values(guests).filter((guest) => guest.slug !== "default")) {
  test(`real audiovisual edition: ${guest.slug}, video order, lazy resources and required History`, async ({ page }) => {
    test.setTimeout(60000);
    const requests: string[] = [];
    page.on("request", (request) => { if (/\.mp4/i.test(request.url())) requests.push(decodeURIComponent(request.url())); });
    const issue = await open(page, guest.slug);
    expect(requests.length).toBeLessThanOrEqual(1);
    await expect(page.locator("[data-history-content]")).toBeHidden();
    await page.getByRole("link", { name: "Confirmar", exact: true }).click();
    await expect(page.locator("[data-history-content]")).toBeHidden();
    await goToStory(issue, 1);
    const count = Number(await issue.getAttribute("data-history-count"));
    for (let n = 0; n < count - 1; n++) {
      await expect(page.locator("[data-history-content]")).toBeHidden();
      await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    }
    await expect(page.locator("[data-history-content]")).toBeHidden();
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    await expect(page.locator("[data-history-content]")).not.toHaveAttribute("hidden");
    const expected = guest.slug === "giovanna" ? ["GIOVANNA.mp4", "GIOVANNA 2.mp4"]
      : guest.slug === "roberto" ? ["ROBERTO.mp4", "ROBERTO 2.mp4"]
      : guest.slug === "mariayroberto" ? ["ROBERTO Y MARIA.mp4"]
      : guest.slug === "florisyabsalon" ? ["florisyabsalon.mp4", "florisyabsalon 2.mp4"] : [];
    await expect(issue).toHaveAttribute("data-video-count", String(expected.length));
    await goToStory(issue, 4);
    for (let n = 0; n < expected.length; n++) {
      if (n) {
        await expect(issue).toContainText(guest.slug === "florisyabsalon"
          ? "Un momento más, solo para Charlotte"
          : "Hay algo más que queremos compartir contigo.");
        await expect(issue.locator("video")).toHaveCount(0);
        await expect(issue).not.toContainText(/padrin|madrin/i);
        await issue.getByRole("button", { name: "Reproducir segundo mensaje", exact: true }).click();
      }
      const video = issue.locator("video");
      await expect(video).toHaveAttribute("data-original-video", `/videos/${expected[n]}`);
      if (guest.slug === "florisyabsalon") {
        await expect(issue).toContainText(n === 0 ? "Para los abuelos Floris y Absalon" : "Para Charlotte");
      }
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.1);
      expect(await video.evaluate((v) => getComputedStyle(v).objectFit)).toBe("contain");
      await video.evaluate((v: HTMLVideoElement) => { v.currentTime = v.duration - 0.3; });
      if (n < expected.length - 1) {
        await expect(issue).toHaveAttribute("data-video-index", String(n + 1), { timeout: 10000 });
      } else {
        await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.ended), { timeout: 10000 }).toBe(true);
      }
    }
    const sources = expected.map((name) => optimized.videos.find((item) => item.original === `/videos/${name}`)?.source ?? `/videos/${name}`);
    expect(requests.every((url) => sources.some((source) => url.endsWith(source)))).toBe(true);
    expect(await page.locator("audio").count()).toBe(1);
    await goToStory(issue, 5);
    await issue.getByRole("link", { name: "Ver la invitación", exact: true }).click();
    await expect(page.locator("#invitacion-heading")).toBeFocused();
  });
}

test("global WEBA audio: actual gain reaches 2%, ramps back, preserves user volume and mute", async ({ page }) => {
  test.setTimeout(45000);
  await page.addInitScript(() => {
    const createGain = AudioContext.prototype.createGain;
    const gains: GainNode[] = [];
    Object.defineProperty(window, "__musicGains", { value: gains });
    AudioContext.prototype.createGain = function () {
      const node = createGain.call(this); gains.push(node); return node;
    };
  });
  const issue = await open(page, "mariayroberto");
  const audio = issue.locator("audio");
  const gain = () => page.evaluate(() => {
    const nodes = Reflect.get(window, "__musicGains") as GainNode[];
    return nodes[0]?.gain.value;
  });
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThan(0.1);
  expect(await audio.evaluate((a: HTMLAudioElement) => ({ loop: a.loop, paused: a.paused }))).toEqual({ loop: true, paused: false });
  await issue.getByRole("slider", { name: "Volumen de música" }).fill("40");
  await expect.poll(gain).toBeCloseTo(0.4, 4);
  const time = await audio.evaluate((a: HTMLAudioElement) => a.currentTime);
  await goToStory(issue, 4);
  await expect.poll(gain).toBeCloseTo(0.008, 4);
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(false);
  await issue.getByRole("button", { name: "Silenciar video", exact: true }).click();
  await expect.poll(gain).toBeCloseTo(0.008, 4);
  await issue.getByRole("button", { name: "Pausar video", exact: true }).click();
  await expect.poll(gain).toBeCloseTo(0.4, 4);
  await issue.getByRole("button", { name: "Reproducir video", exact: true }).first().click();
  await expect.poll(gain).toBeCloseTo(0.008, 4);
  await issue.locator("video").evaluate((v: HTMLVideoElement) => { v.currentTime = v.duration - 0.3; });
  await expect.poll(() => issue.locator("video").evaluate((v: HTMLVideoElement) => v.ended), { timeout: 10000 }).toBe(true);
  await expect.poll(gain).toBeCloseTo(0.4, 4);
  expect(await audio.evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThan(time);
  await issue.getByRole("button", { name: "Silenciar música", exact: true }).click();
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await goToStory(issue, 5);
  await expect(issue.getByRole("button", { name: "Activar música", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  expect(await issue.getByRole("slider", { name: "Volumen de música" }).inputValue()).toBe("40");
  const pausedAt = await audio.evaluate((a: HTMLAudioElement) => a.currentTime);
  await issue.getByRole("button", { name: "Activar música", exact: true }).click();
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThan(pausedAt);
  await expect.poll(gain).toBeCloseTo(0.4, 4);
  expect(await page.locator("audio").count()).toBe(1);
  expect(await page.evaluate(() => (Reflect.get(window, "__musicGains") as GainNode[]).length)).toBe(1);
});

for (const width of [320, 430]) {
  test(`guided novice journey at ${width}px: visible labels, delayed help, pause, return and finish`, async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}/amparoyeduardo/lectura/`);
    const issue = page.locator("[data-love-issue]");
    await issue.scrollIntoViewIfNeeded();
    await expect(issue.locator("[data-context-help]")).toContainText("Entrar con sonido", { timeout: 7000 });
    await issue.getByRole("button", { name: "Entrar con sonido", exact: true }).click();
    for (const name of ["Historia siguiente", "Historia anterior", "Pausar stories"]) {
      const rect = await issue.getByRole("button", { name, exact: true }).boundingBox();
      expect(rect?.height).toBeGreaterThanOrEqual(44);
      expect(rect?.width).toBeGreaterThanOrEqual(44);
    }
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    await expect(issue.locator("[data-context-help]")).toContainText("Siguiente", { timeout: 7000 });
    await issue.getByRole("button", { name: "Pausar stories", exact: true }).click();
    await expect(issue.getByRole("button", { name: "Continuar stories", exact: true })).toHaveText("Reanudar");
    await issue.getByRole("button", { name: "Continuar stories", exact: true }).click();
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    await expect(issue.locator("[data-story-id=history] [data-photo-file]")).toHaveCount(1);
    await issue.getByRole("button", { name: "Historia anterior", exact: true }).click();
    await expect(issue).toHaveAttribute("data-history-index", "0");
    await goToStory(issue, 5);
    await expect(issue.locator("[data-context-help]")).toContainText("Terminaste", { timeout: 7000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("autoplay restriction retains a simple music retry; unsupported WEBA reports the limitation", async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let blocked = true;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLAudioElement && blocked) { blocked = false; return Promise.reject(new DOMException("Policy test", "NotAllowedError")); }
      return play.call(this);
    };
  });
  const issue = await open(page);
  await expect(issue.getByRole("button", { name: "Activar música", exact: true })).toBeVisible();
  await issue.getByRole("button", { name: "Activar música", exact: true }).click();
  await expect.poll(() => issue.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThan(0.1);
  await page.addInitScript(() => { sessionStorage.clear(); HTMLMediaElement.prototype.canPlayType = () => ""; });
  await page.reload();
  await issue.getByRole("button", { name: "Entrar con sonido", exact: true }).click();
  await expect(issue).toContainText("no admite el formato de la música");
  await expect(issue.locator("audio")).toHaveCount(0);
});

test("rendered accessibility audit, keyboard-only occasional user and visual checkpoints", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const issue = await open(page);
  for (const width of [320, 430, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await goToStory(issue, 0);
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`cover-${width}.png`) });
    await goToStory(issue, 1);
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`history-intro-${width}.png`) });
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`history-photo-${width}.png`) });
    await goToStory(issue, 4);
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`video-${width}.png`) });
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`special-intro-${width}.png`) });
    await goToStory(issue, 5);
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`closing-${width}.png`) });
  }
  await page.addScriptTag({ path: path.resolve("node_modules", "axe-core", "axe.min.js") });
  const violations = await page.evaluate(async () => {
    const axe = Reflect.get(window, "axe") as { run: (context: string, options: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> };
    const result = await axe.run("[data-love-issue]", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
    return result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }));
  });
  expect(violations).toEqual([]);
  await goToStory(issue, 0);
  const screen = issue.getByRole("region", { name: /THE LOVE ISSUE, edición/ });
  await screen.focus();
  await page.keyboard.press("ArrowRight");
  await expect(issue).toHaveAttribute("data-story-index", "1");
  await page.keyboard.press("ArrowLeft");
  await expect(issue).toHaveAttribute("data-story-index", "0");
  await page.keyboard.press("Tab");
  await expect(issue.getByRole("button", { name: "Silenciar música", exact: true })).toBeFocused();
});
