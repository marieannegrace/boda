import { test, expect } from "@playwright/test";
import guests from "../../src/data/guests.json";
import { goToStory } from "./story-navigation";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const route = (slug: string) => `${basePath}/${slug}/lectura/`;

async function start(page: import("@playwright/test").Page, slug = "mariayroberto", reduced = true) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
  await page.goto(route(slug));
  const issue = page.locator("[data-love-issue]");
  await issue.getByRole("button", { name: "Abrir mi edición" }).click();
  await expect(issue).toHaveAttribute("data-started", "true");
  return issue;
}

for (const guest of Object.values(guests).filter((item) => item.slug !== "default")) {
  test(`Love Issue: ${guest.slug} has six personalized pages without early media requests`, async ({ page }) => {
    const errors: string[] = [];
    const videos: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (/\.mp4/.test(request.url())) videos.push(request.url()); });
    const issue = await start(page, guest.slug);
    expect(await issue.locator("[data-story-id]").count()).toBe(6);
    await expect(issue).toHaveAttribute("data-automatic", "false");
    await page.waitForTimeout(600);
    await expect(issue).toHaveAttribute("data-story-index", "0");
    await issue.getByRole("button", { name: "Historia siguiente" }).click();
    await expect(issue.locator('[data-story-id="history"]')).toBeVisible();
    await goToStory(issue, 2);
    const family = issue.locator('[data-story-id="family"]');
    await expect(family).toContainText(guest.displayName);
    await expect(family).toContainText(guest.seats === null ? guest.seatsPendingLabel : `${guest.seats} INVITADOS`);
    await expect(family).toContainText("VOL. 01");
    await expect(family).toContainText("NO. 001");
    await issue.getByRole("button", { name: "Historia siguiente" }).click();
    await expect(issue.locator('[data-story-id="moment"]')).toContainText("Ahora queremos escribir");
    await issue.getByRole("button", { name: "Historia siguiente" }).click();
    const hasVideo = Number(await issue.getAttribute("data-video-count")) > 0;
    if (hasVideo) {
      await expect(issue.locator("video")).toBeVisible();
    } else {
      await expect(issue.locator('[data-story-id="message"]')).toContainText("DE NUESTRA VOZ A USTEDES");
      await expect(issue.locator('[data-story-id="message"]')).toContainText("Luis & Marie");
    }
    const editorialText = await issue.innerText();
    expect(editorialText).not.toMatch(/placeholder|video pendiente|fotografía pendiente|undefined|\bnull\b|\bNaN\b|pendiente de incorporar/i);
    await expect(issue.getByRole("button", { name: "Subtítulos", exact: true })).toHaveCount(0);
    await expect(issue.getByText("Leer el mensaje", { exact: true })).toHaveCount(0);
    await goToStory(issue, 5);
    await expect(issue.locator('[data-story-id="closing"]')).toBeVisible();
    await issue.getByRole("link", { name: "Ver la invitación", exact: true }).click();
    await expect(page.locator("#invitacion-heading")).toBeFocused();
    await expect(page.locator("#invitacion")).toBeInViewport();
    expect(await page.locator("[data-scene]").count()).toBe(15);
    if (!hasVideo) expect(videos).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("Love Issue automatic clock pauses on hold, resumes, and stops offscreen", async ({ page }) => {
  const issue = await start(page, "roberto", false);
  await expect(issue).toHaveAttribute("data-suspended", "false");
  const surface = issue.locator('[class*="surface"]');
  await page.waitForTimeout(700);
  await surface.scrollIntoViewIfNeeded();
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error("Story surface missing");
  const progress = () => issue.locator("ol span").first().evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height * 0.8);
  await page.mouse.down();
  await expect(issue).toHaveAttribute("data-holding", "true");
  const held = await progress();
  await page.waitForTimeout(600);
  expect(await progress()).toBe(held);
  await page.mouse.up();
  await expect(issue).toHaveAttribute("data-story-index", "0");
  await expect.poll(progress).not.toBe(held);
  await expect(issue).toHaveAttribute("data-story-index", "1", { timeout: 6500 });
  await issue.getByRole("button", { name: "Pausar stories" }).click();
  await page.waitForTimeout(600);
  await expect(issue).toHaveAttribute("data-suspended", "true");
  await issue.getByRole("button", { name: "Continuar stories" }).click();
  await page.locator("#saludo").scrollIntoViewIfNeeded();
  await expect(issue).toHaveAttribute("data-suspended", "true");
  await page.waitForTimeout(600);
  await expect(issue).toHaveAttribute("data-story-index", "1");
});

test("Love Issue tap, swipe, keyboard and canceled pointer preserve natural navigation", async ({ page }) => {
  const issue = await start(page);
  const surface = issue.locator('[class*="surface"]');
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error("Missing story surface");
  await page.mouse.click(bounds.x + bounds.width * 0.8, bounds.y + bounds.height / 2);
  await expect(issue).toHaveAttribute("data-story-index", "1");
  await page.mouse.move(bounds.x + bounds.width * 0.25, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(issue).toHaveAttribute("data-story-index", "0");
  const screen = issue.getByRole("region", { name: /THE LOVE ISSUE, edición/ });
  await screen.focus();
  await page.keyboard.press("ArrowRight");
  await expect(issue).toHaveAttribute("data-story-index", "1");
  await page.keyboard.press("ArrowLeft");
  await expect(issue).toHaveAttribute("data-story-index", "0");
  await page.mouse.move(bounds.x + 30, bounds.y + 30);
  await page.mouse.down();
  await surface.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await expect(issue).toHaveAttribute("data-holding", "false");
  await screen.focus();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BUTTON");
});

test("Love Issue native fullscreen includes navigation and closing invitation action", async ({ page }) => {
  const issue = await start(page);
  await issue.getByRole("button", { name: "Ver stories en pantalla completa" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await goToStory(issue, 5);
  await expect(issue.getByRole("link", { name: "Ver la invitación", exact: true })).toBeVisible();
  await issue.getByRole("link", { name: "Ver la invitación", exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await expect(page.locator("#invitacion-heading")).toBeFocused();
});

test("Love Issue share fallback copies the same personalized Pages URL", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async (value: string) => { document.documentElement.dataset.copied = value; },
    } });
  });
  const issue = await start(page, "giovanna");
  await goToStory(issue, 5);
  await issue.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(issue).toContainText("Enlace copiado.");
  expect(await page.evaluate(() => document.documentElement.dataset.copied)).toBe("https://marieannegrace.github.io/boda/giovanna/");
});

test("Love Issue clipboard failure exposes a selectable personalized link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async () => { throw new DOMException("Test clipboard denied", "NotAllowedError"); },
    } });
  });
  const issue = await start(page, "giovanna");
  await goToStory(issue, 5);
  await issue.getByRole("button", { name: "Copiar enlace", exact: true }).click();
  await expect(issue).toContainText("No se pudo copiar automáticamente");
  await expect(issue.getByRole("textbox", { name: "Enlace de tu carta" })).toHaveValue("https://marieannegrace.github.io/boda/giovanna/");
});

test("Love Issue Web Share receives selected guest URL, and failed sharing offers alternatives", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
      document.documentElement.dataset.shared = JSON.stringify(data);
      throw new DOMException("Test sharing unavailable", "NotAllowedError");
    } });
  });
  const issue = await start(page, "mercedes");
  await goToStory(issue, 5);
  await issue.getByRole("button", { name: "Compartir", exact: true }).click();
  const data = JSON.parse(await page.evaluate(() => document.documentElement.dataset.shared ?? "{}"));
  expect(data.url).toBe("https://marieannegrace.github.io/boda/mercedes/");
  expect(data.title).toBe("THE LOVE ISSUE");
  await expect(issue).toContainText("No se pudo abrir el menú");
  await expect(issue.getByRole("button", { name: "Copiar enlace" })).toBeVisible();
});

test("Love Issue is readable without JavaScript and fits 320px through desktop", async ({ browser, page }) => {
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route("florisyabsalon"));
    await page.locator("[data-love-issue]").scrollIntoViewIfNeeded();
    const size = await page.locator('[data-love-issue] [class*="phone"]').boundingBox();
    if (!size) throw new Error("Story screen missing");
    expect(size.width / size.height).toBeCloseTo(9 / 16, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto(`${test.info().project.use.baseURL}/mariayroberto/lectura/`);
    await expect(staticPage.locator("noscript > div")).toContainText("María y Roberto");
    await expect(staticPage.locator("noscript > div")).toContainText("Gracias por acompañarnos en este camino.");
    await expect(staticPage.locator("noscript").getByRole("link", { name: "Ver la invitación" })).toBeVisible();
  } finally { await context.close(); }
});

test("Love Issue full automatic recap retains six segments and stops on the invitation cover", async ({ page }) => {
  test.setTimeout(45000);
  const issue = await start(page, "mercedes", false);
  const begun = Date.now();
  for (let i = 1; i < 6; i++) await expect(issue).toHaveAttribute("data-story-index", String(i), { timeout: 6500 });
  const closingAt = Date.now() - begun;
  expect(closingAt).toBeGreaterThan(24000);
  expect(closingAt).toBeLessThan(30000);
  await page.waitForTimeout(5200);
  await expect(issue).toHaveAttribute("data-story-index", "5");
  await expect(issue.getByRole("link", { name: "Ver la invitación", exact: true })).toBeVisible();
});

test("Love Issue 200-percent text remains readable inside the story without horizontal overflow", async ({ page }) => {
  const issue = await start(page, "florisyabsalon");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await goToStory(issue, 2);
  const family = issue.locator('[data-story-id="family"]');
  expect(await issue.getByRole("region", { name: /THE LOVE ISSUE, edición/ }).evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await family.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await family.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(family.getByText("NO. 001", { exact: true })).toBeInViewport();
  await family.evaluate((element) => { element.scrollTop = 0; });
  await family.scrollIntoViewIfNeeded();
  await expect(family.locator("p").first()).toBeInViewport();
});
