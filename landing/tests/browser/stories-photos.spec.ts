import { test, expect } from "@playwright/test";
import guests from "../../src/data/guests.json";
import { discoverStoryPhotos } from "../../src/lib/story-media.mjs";
import { goToStory } from "./story-navigation";
import { readFile } from "node:fs/promises";
import type { StoryPhoto } from "../../src/lib/stories";

let inventory: Awaited<ReturnType<typeof discoverStoryPhotos>>;
let catalog: (StoryPhoto & { edition: string })[];
test.beforeAll(async () => {
  inventory = await discoverStoryPhotos();
  catalog = JSON.parse(await readFile(".cache/story-photos.json", "utf8"));
});
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
for (const guest of Object.values(guests).filter((item) => item.slug !== "default")) {
  test(`real photos: ${guest.slug} keeps every original photograph complete in its own History`, async ({ page }, testInfo) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const expected = inventory.filter((item) => item.edition === guest.slug).map((item) => item.file);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const requested: string[] = [];
      const listener = (request: import("@playwright/test").Request) => {
        if (request.url().includes("/images/stories/")) requested.push(request.url());
      };
      page.on("request", listener);
      await page.goto(`${basePath}/${guest.slug}/lectura/`);
      const issue = page.locator("[data-love-issue]");
      await issue.locator('[class*="startButton"]').click();
      await expect(issue.getByRole("button", { name: "Activar música", exact: true })).toHaveCount(0);
      await goToStory(issue, 1);
      const count = Number(await issue.getAttribute("data-history-count"));
      const seen: string[] = [];
      for (let i = 0; i < count; i++) {
        await expect(issue).toHaveAttribute("data-history-index", String(i));
        const photos = issue.locator('[data-story-id="history"] [data-photo-file]');
        expect(await photos.count()).toBeLessThanOrEqual(2);
        for (const photo of await photos.all()) {
          seen.push((await photo.getAttribute("data-photo-file"))!);
          const image = photo.locator("img");
          await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
          const geometry = await image.evaluate((img) => {
            const style = getComputedStyle(img);
            return { fit: style.objectFit, transform: style.transform, width: img.clientWidth, height: img.clientHeight };
          });
          expect(geometry.fit).toBe("contain");
          expect(geometry.transform).toBe("none");
          expect(geometry.width).toBeGreaterThan(90);
          expect(geometry.height).toBeGreaterThan(90);
          await expect(photo).toBeInViewport();
        }
        if (width === 390 && (i === 1 || i === count - 1)) {
          await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`history-${guest.slug}-${i}.png`) });
        }
        if (i < count - 1) await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
      }
      expect(seen).toEqual(expected);
      await goToStory(issue, 3);
      await expect(issue.locator('[data-story-id="moment"] [data-photo-file]')).toHaveAttribute("data-photo-file", "luis y marie.jpg");
      await goToStory(issue, 4);
      await expect(issue.locator('[data-story-id="message"] [data-photo-file]')).toHaveAttribute("data-photo-file", "luis y marie 2.JPG");
      await expect(issue.locator('[data-story-id="message"]')).not.toContainText("Con cariño,");
      await goToStory(issue, 5);
      if (width >= 390) {
        expect(await issue.locator('[data-story-id="closing"]').evaluate((slide) => slide.scrollHeight - slide.clientHeight)).toBeLessThanOrEqual(1);
      }
      expect(await page.locator("[data-scene]").count()).toBe(15);
      const allowed = catalog.filter((photo: { edition: string }) => photo.edition === guest.slug || photo.edition === "global")
        .flatMap((photo: { variants: { source: string }[] }) => photo.variants.map((variant) => variant.source));
      expect(requested.every((url) => allowed.some((source: string) => new URL(url).pathname === `${basePath}${source}`))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      page.off("request", listener);
    }
  });
}

test("History progress and backward navigation include photo pages, and a hold pauses a photo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${basePath}/giovanna/lectura/`);
  const issue = page.locator("[data-love-issue]");
  await issue.locator('[class*="startButton"]').click();
  await goToStory(issue, 1);
  await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
  await expect(issue).toHaveAttribute("data-history-index", "1");
  const surface = issue.locator('[class*="surface"]');
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error("Missing photo surface");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  const progress = () => issue.locator("ol span").nth(1).evaluate((bar) => getComputedStyle(bar).transform);
  await expect(issue).toHaveAttribute("data-holding", "true");
  const held = await progress();
  await page.waitForTimeout(500);
  expect(await progress()).toBe(held);
  await page.mouse.up();
  await expect(issue).toHaveAttribute("data-history-index", "2", { timeout: 6500 });
  await issue.getByRole("button", { name: "Historia anterior", exact: true }).click();
  await expect(issue).toHaveAttribute("data-history-index", "1");
});
