import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BETA_URL ?? "http://127.0.0.1:3002/boda";
const slug = process.env.MEASUREMENT_SLUG ?? "giovanna";
const output = process.env.MEASUREMENT_OUTPUT ?? path.resolve("test-results", "loading-measurements.json");
const profiles = [
  { name: "fast", latency: 20, downloadThroughput: 1250000, uploadThroughput: 625000, cpu: 1 },
  { name: "4g-moderate", latency: 150, downloadThroughput: 200000, uploadThroughput: 93750, cpu: 4 },
  { name: "slow", latency: 400, downloadThroughput: 50000, uploadThroughput: 25000, cpu: 4 },
].filter((profile) => !process.env.MEASUREMENT_PROFILES || process.env.MEASUREMENT_PROFILES.split(",").includes(profile.name));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const rows = [];
try {
  for (const profile of profiles) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, ...Object.fromEntries(
        Object.entries(profile).filter(([key]) => !["name", "cpu"].includes(key))) });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
      await cdp.send("Performance.enable");
      const row = { slug, profile: profile.name, run, viewport: "390x844", cache: "disabled", cpu: profile.cpu, videos: [] };
      let transferred = 0;
      cdp.on("Network.loadingFinished", ({ encodedDataLength }) => { transferred += encodedDataLength; });
      try {
        const start = Date.now();
        await page.goto(`${base}/${slug}/lectura/`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const issue = page.locator("[data-love-issue]");
        await issue.locator('[data-welcome], [data-story-id="cover"]:not([hidden])').first().waitFor({ state: "visible", timeout: 30000 });
        row.coverMs = Date.now() - start;
        const enter = issue.getByRole("button", { name: "Entrar con sonido", exact: true });
        const entry = await enter.count() ? enter : issue.getByRole("button", { name: "Abrir mi edición", exact: true });
        await entry.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector("[data-love-issue]")?.getAttribute("data-suspended") === "false");
        await entry.click();
        const musicReady = page.waitForFunction(() => {
          const a = document.querySelector("[data-love-issue] audio");
          return a && a.readyState >= 2 && a.currentTime > 0;
        }, null, { timeout: 20000 }).then(() => { row.musicMs = Date.now() - start; }, () => { row.musicMs = null; });
        await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
        await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
        await page.waitForFunction(() => {
          const img = document.querySelector('[data-story-id="history"] img');
          return img && img.complete && img.naturalWidth > 0;
        }, null, { timeout: 20000 }).then(() => { row.firstPhotoMs = Date.now() - start; }, () => { row.firstPhotoMs = null; });
        await musicReady;
        const before = (await cdp.send("Performance.getMetrics")).metrics;
        row.heapBefore = before.find((m) => m.name === "JSHeapUsedSize")?.value;
        for (let n = 0; n < 30 && await issue.getAttribute("data-story-index") !== "4"; n++) {
          await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
        }
        const videoCount = Number(await issue.getAttribute("data-video-count"));
        for (let v = 0; v < videoCount; v++) {
          if (v) {
            await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
            const second = issue.getByRole("button", { name: "Reproducir segundo mensaje", exact: true });
            if (await second.count()) await second.click();
          }
          const began = Date.now();
          const play = issue.getByRole("button", { name: /^(Reproducir video|Reproducir con sonido)$/ }).first();
          if (await play.count()) await play.click();
          const video = issue.locator("video");
          const ready = await video.evaluate((el) => new Promise((resolve) => {
            if (el.readyState >= 3) return resolve(true);
            const timer = setTimeout(() => { el.removeEventListener("canplay", loaded); resolve(false); }, 20000);
            function loaded() { clearTimeout(timer); resolve(true); }
            el.addEventListener("canplay", loaded, { once: true });
          }));
          row.videos.push({ index: v, ready, waitMs: Date.now() - began });
        }
        for (let n = 0; n < 5; n++) {
          await issue.getByRole("button", { name: "Historia anterior", exact: true }).click();
          await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
        }
        const after = (await cdp.send("Performance.getMetrics")).metrics;
        row.heapAfter = after.find((m) => m.name === "JSHeapUsedSize")?.value;
        row.mediaElements = await issue.locator("video,audio").count();
        row.totalMs = Date.now() - start;
      } catch (error) {
        row.error = error.message;
      }
      row.transferredBytes = transferred;
      rows.push(row);
      await context.close();
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, JSON.stringify({ base, browser: browser.version(), kind: "synthetic lab; not field CWV or total process memory", profiles, rows }, null, 2));
      console.log(JSON.stringify(row));
    }
  }
} finally {
  await browser.close();
}
