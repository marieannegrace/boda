import { test, expect } from "@playwright/test";
import { goToStory } from "./story-navigation";
import path from "node:path";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const route = `${base}/giovanna/lectura/`;

test("welcome prepares real resources, uses a bounded range, and never requires the whole collection", async ({ page }, testInfo) => {
  const ranges: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".mp4")) ranges.push(request.headers()["range"] ?? "full");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Entrar con sonido" }).scrollIntoViewIfNeeded();
  await expect(issue.locator("[data-welcome]")).toContainText("Giovanna");
  await expect.poll(async () => Number(await issue.getAttribute("data-prepared"))).toBe(5);
  expect(await issue.locator("[data-welcome] h3 > span, [data-welcome] p, [data-welcome] button").evaluateAll((elements) =>
    elements.length > 0 && elements.every((element) => {
      const style = getComputedStyle(element);
      return document.fonts.check(`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`);
    }))).toBe(true);
  await page.addScriptTag({ path: path.resolve("node_modules", "axe-core", "axe.min.js") });
  const violations = await page.evaluate(async () => {
    const axe = Reflect.get(window, "axe") as { run: (context: string, options: object) => Promise<{ violations: { id: string }[] }> };
    return (await axe.run("[data-love-issue]", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((item) => item.id);
  });
  expect(violations).toEqual([]);
  await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath("welcome-320.png") });
  await page.setViewportSize({ width: 430, height: 900 });
  await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath("welcome-430.png") });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const phone = await issue.locator('[class*="phone"]').boundingBox();
  const entry = await issue.getByRole("button", { name: "Entrar con sonido" }).boundingBox();
  if (!phone || !entry) throw new Error("Missing zoomed entry");
  expect(entry.y + entry.height).toBeLessThanOrEqual(phone.y + phone.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  expect(ranges).toEqual(["bytes=0-65535"]);
  expect(await issue.locator("video").count()).toBe(0);
  await issue.getByRole("button", { name: "Continuar sin música" }).click();
  await expect(issue).toHaveAttribute("data-started", "true");
  await expect.poll(() => issue.locator("audio").evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await goToStory(issue, 4);
  await expect.poll(() => issue.locator("video").evaluate((v: HTMLVideoElement) => !v.paused && !v.muted)).toBe(true);
  await expect(issue.getByRole("button", { name: "Activar música", exact: true })).toBeVisible();
});

test("music begins at ten seconds, fades in, and session choice does not repeat the welcome", async ({ page }) => {
  await page.addInitScript(() => {
    const make = AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function () {
      const gain = make.call(this);
      Reflect.set(window, "__entryGain", gain);
      const ramps: { value: number; duration: number }[] = [];
      Reflect.set(window, "__entryRamps", ramps);
      const ramp = gain.gain.linearRampToValueAtTime.bind(gain.gain);
      gain.gain.linearRampToValueAtTime = (value, endTime) => {
        ramps.push({ value, duration: endTime - this.currentTime });
        return ramp(value, endTime);
      };
      return gain;
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Entrar con sonido" }).click();
  await expect.poll(() => issue.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThanOrEqual(10);
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, "__entryGain") as GainNode)?.gain.value)).toBeCloseTo(0.16, 3);
  expect(await page.evaluate(() => (Reflect.get(window, "__entryRamps") as { value: number; duration: number }[])
    .some((ramp) => ramp.value === 0.16 && ramp.duration > 1.5 && ramp.duration <= 1.61))).toBe(true);
  const audio = issue.locator("audio");
  const source = await audio.getAttribute("src");
  if (!source) throw new Error("Missing prepared music source");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(issue).toHaveAttribute("data-suspended", "true");
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  const position = await audio.evaluate((element: HTMLAudioElement) => element.currentTime);
  await expect(audio).toHaveAttribute("src", source);
  await issue.locator('[class*="phone"]').scrollIntoViewIfNeeded();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(position);
  await issue.getByRole("slider", { name: "Volumen de música" }).fill("35");
  await issue.getByRole("button", { name: "Silenciar música" }).click();
  await page.reload();
  await expect(issue.locator("[data-welcome]")).toHaveCount(0);
  await expect(issue.getByRole("slider", { name: "Volumen de música" })).toHaveValue("35");
  await expect(issue.getByRole("button", { name: "Activar música" })).toBeVisible();
  await expect.poll(() => issue.locator("audio").evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
});

test("audible autoplay blocked once offers one large action, no muted fallback or repeated attempts", async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let attempts = 0;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLVideoElement) {
        attempts++;
        Reflect.set(window, "__videoAttempts", attempts);
        if (attempts === 1) return Promise.reject(new DOMException("Test policy", "NotAllowedError"));
      }
      return play.call(this);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Entrar con sonido" }).click();
  await goToStory(issue, 4);
  const play = issue.getByRole("button", { name: "Reproducir con sonido", exact: true });
  await expect(play).toBeVisible();
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => Reflect.get(window, "__videoAttempts"))).toBe(1);
  expect(await issue.locator("video").evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
  const box = await play.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await play.click();
  await expect.poll(() => issue.locator("video").evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBe(true);
  await goToStory(issue, 3);
  await expect(issue.locator("video")).toHaveCount(0);
});

test("slow or failed preparation keeps both entry options available and announces the limitation", async ({ page }) => {
  await page.route("**/*.mp4", (route) => route.abort());
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Entrar con sonido" }).scrollIntoViewIfNeeded();
  await expect(issue.locator("[data-welcome]")).toContainText("Puedes entrar.");
  await expect(issue.getByRole("button", { name: "Entrar con sonido" })).toBeEnabled();
  await issue.getByRole("button", { name: "Continuar sin música" }).click();
  await expect(issue).toHaveAttribute("data-started", "true");
  await goToStory(issue, 1);
  await expect(page.locator("[data-history-content]")).toBeHidden();
});

test("rapid scene changes release the previous media and keep exactly one global audio controller", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Entrar con sonido" }).click();
  await goToStory(issue, 4);
  const previous = await issue.locator("video").elementHandle();
  if (!previous) throw new Error("Missing current video");
  await goToStory(issue, 3);
  expect(await previous.evaluate((element) => {
    if (!(element instanceof HTMLVideoElement)) throw new Error("Expected video");
    return { connected: element.isConnected, paused: element.paused, source: element.getAttribute("src") };
  })).toEqual({ connected: false, paused: true, source: null });
  await previous.dispose();
  for (let n = 0; n < 6; n++) {
    await goToStory(issue, 4);
    await expect(issue.locator("video")).toHaveCount(1);
    await goToStory(issue, 3);
    await expect(issue.locator("video")).toHaveCount(0);
  }
  await expect(page.locator("audio")).toHaveCount(1);
  await expect.poll(() => issue.locator("audio").evaluate((audio: HTMLAudioElement) => !audio.paused)).toBe(true);
});
