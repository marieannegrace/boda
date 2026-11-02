import { test, expect, type Locator } from "@playwright/test";
import { goToStory } from "./story-navigation";

const route = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/giovanna/lectura/`;

async function checkLayer(issue: Locator, scene: string, opacity: number) {
  const layer = issue.locator(`[data-botanical="${scene}"]`);
  await expect(layer).toHaveCount(1);
  await expect(layer).toHaveAttribute("aria-hidden", "true");
  await expect(layer).toHaveCSS("pointer-events", "none");
  await expect(layer).toHaveCSS("opacity", String(opacity));
  expect(await layer.locator("button, a, input, [tabindex], [role]").count()).toBe(0);
  expect(await layer.locator("svg").count()).toBe(2);
  expect(await layer.locator("image, use, filter, animate, animateTransform").count()).toBe(0);
  expect(await layer.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return Array.from(element.children).every((child) => {
      if (getComputedStyle(child).display === "none") return true;
      const motif = child.getBoundingClientRect();
      return motif.right <= bounds.left + bounds.width * 0.3
        || motif.left >= bounds.left + bounds.width * 0.7;
    });
  })).toBe(true);
  return layer;
}

for (const width of [320, 430, 1440]) {
  test(`botanical paper at ${width}px: marginal, scene-specific and absent over video`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(route);
    const issue = page.locator("[data-love-issue]");
    await issue.getByRole("button", { name: "Entrar con sonido" }).scrollIntoViewIfNeeded();
    const welcome = await checkLayer(issue, "welcome", 0.12);
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`botanical-welcome-${width}.png`) });
    await expect(welcome.locator("[data-botanical-motif]").first()).not.toHaveAttribute("style", /opacity|translate/);
    await issue.getByRole("button", { name: "Continuar sin música" }).click();
    await checkLayer(issue, "cover", 0.15);
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`botanical-cover-${width}.png`) });
    await goToStory(issue, 1);
    await checkLayer(issue, "history", 0.07);
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    const photos = await checkLayer(issue, "photos", 0.035);
    await expect(photos.locator("[data-botanical-motif]").nth(1)).toBeHidden();
    await expect(issue.locator('[data-story-id="history"] img').first()).toBeVisible();
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`botanical-photos-${width}.png`) });
    const alternate = await photos.getAttribute("data-alternate");
    await issue.getByRole("button", { name: "Historia siguiente", exact: true }).click();
    expect(await issue.locator("[data-botanical]").getAttribute("data-alternate")).not.toBe(alternate);
    await goToStory(issue, 2);
    await checkLayer(issue, "family", 0.1);
    await goToStory(issue, 3);
    await checkLayer(issue, "moment", 0.045);
    await goToStory(issue, 4);
    await expect(issue.locator("video")).toHaveCount(1);
    await expect(issue.locator("[data-botanical]")).toHaveCount(0);
    await goToStory(issue, 5);
    await checkLayer(issue, "closing", 0.14);
    await expect(issue.getByRole("link", { name: "Ver la invitación", exact: true })).toBeVisible();
    await issue.locator('[class*="phone"]').screenshot({ path: testInfo.outputPath(`botanical-closing-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("botanical motion is finite, pauses with the reader, and reverts on live reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Continuar sin música" }).click();
  await expect(issue).toHaveAttribute("data-automatic", "false");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await goToStory(issue, 1);
  const motif = issue.locator("[data-botanical-motif]").first();
  await issue.getByRole("button", { name: "Pausar stories", exact: true }).click();
  const paused = await motif.getAttribute("style");
  await page.waitForTimeout(300);
  expect(await motif.getAttribute("style")).toBe(paused);
  await issue.getByRole("button", { name: "Continuar stories", exact: true }).click();
  await expect(motif).toHaveCSS("opacity", "1");
  const settled = await motif.getAttribute("style");
  await page.waitForTimeout(300);
  expect(await motif.getAttribute("style")).toBe(settled);
  await goToStory(issue, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(issue.locator("[data-botanical-motif]").first()).not.toHaveAttribute("style", /opacity|translate/);
  await checkLayer(issue, "family", 0.1);
});

test("touch layouts use fade only, without ambient parallax", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Continuar sin música" }).click();
  await expect(issue).toHaveAttribute("data-automatic", "false");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await goToStory(issue, 1);
  expect(await issue.locator("[data-botanical-motif]").evaluateAll((elements) => elements.every((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.abs(matrix.m41) < 0.01 && Math.abs(matrix.m42) < 0.01;
  }))).toBe(true);
});
