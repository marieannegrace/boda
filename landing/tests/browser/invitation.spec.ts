import { test, expect } from "@playwright/test";
import guests from "../../src/data/guests.json";

const recipients = Object.values(guests).filter((guest) => guest.slug !== "default");
const widths = [320, 390, 768, 1440];
const route = (pathname: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${pathname}`;

for (const guest of recipients) {
  for (const width of widths) {
    test(`${guest.slug} at ${width}px: closed gate -> physical opening -> complete letter`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
      const errors: string[] = [];
      const media: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("request", (request) => { if (/\.mp4(?:$|\?)/.test(request.url())) media.push(request.url()); });
      await page.goto(route(`/${guest.slug}/#confirmacion`));
      const gate = page.locator("[data-entry-state]");
      const button = page.getByRole("button", { name: "Abrir la carta", exact: true });
      await expect(gate).toHaveAttribute("data-entry-state", "locked");
      await expect(button).toBeInViewport();
      await expect(page.getByText(`Para ${guest.displayName}`, { exact: true })).toBeVisible();
      await expect(page.locator("[data-seats]")).toHaveText(`Cupos: ${guest.seats ?? guest.seatsPendingLabel}`);
      await expect(page.locator("[data-letter-content]")).toHaveAttribute("inert", "");
      await expect(page.locator("#saludo")).not.toBeVisible();
      await page.mouse.wheel(0, 1800);
      await page.keyboard.press("PageDown");
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      expect(await page.evaluate(() => scrollY)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
      const started = Date.now();
      await button.click();
      await expect(gate).toHaveAttribute("data-entry-state", "locked");
      await expect(page.getByRole("button", { name: "Continuar sin animación" })).toBeVisible();
      await expect(gate).toHaveAttribute("data-entry-state", "opened", { timeout: 10000 });
      const duration = Date.now() - started;
      expect(duration).toBeGreaterThan(2500);
      expect(duration).toBeLessThan(6500);
      await expect(page.locator("#saludo-heading")).toHaveText(guest.greeting);
      await expect(page.locator("#saludo-heading")).toBeFocused();
      await expect(page.locator("#saludo-heading")).toBeInViewport();
      expect(await page.evaluate(() => getComputedStyle(document.body).position)).not.toBe("fixed");
      expect(await page.locator("[data-scene]").count()).toBe(15);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 400);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
      if (width < 960) expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
      expect(await page.getByRole("link", { name: /Confirmar por WhatsApp/ }).getAttribute("href")).toContain(encodeURIComponent(guest.displayName));
      await expect(page.locator("#postboda")).not.toContainText("Desayuno junto a la piscina");
      await expect(page.locator("#video")).toContainText("Mensaje en video pendiente");
      expect(media).toEqual([]);
      expect(errors).toEqual([]);
      await page.reload();
      await expect(gate).toHaveAttribute("data-entry-state", "locked");
      await expect(button).toBeInViewport();
    });
  }
}

test("reduced motion opens immediately and a live preference change releases the gate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route("/mariayroberto/"));
  const start = Date.now();
  await page.getByRole("button", { name: "Abrir la carta" }).click();
  await expect(page.locator("[data-entry-state]")).toHaveAttribute("data-entry-state", "opened", { timeout: 1000 });
  expect(Date.now() - start).toBeLessThan(1000);
  expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(route("/roberto/"));
  await page.getByRole("button", { name: "Abrir la carta" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-entry-state]")).toHaveAttribute("data-entry-state", "opened", { timeout: 1500 });
});

test("Escape and the skip control release the complete opening, not just its first stage", async ({ page }) => {
  for (const viaButton of [false, true]) {
    await page.goto(route("/florisyabsalon/"));
    await page.getByRole("button", { name: "Abrir la carta" }).click();
    if (viaButton) await page.getByRole("button", { name: "Continuar sin animación" }).click();
    else await page.keyboard.press("Escape");
    await expect(page.locator("[data-entry-state]")).toHaveAttribute("data-entry-state", "opened", { timeout: 1000 });
    await expect(page.locator("#saludo-heading")).toBeFocused();
  }
});

test("no JavaScript still requires an explicit opening gesture and reveals the letter", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  try {
    await page.goto(`${test.info().project.use.baseURL}/giovanna`);
    await expect(page.locator("#saludo")).not.toBeVisible();
    await page.getByRole("button", { name: "Abrir la carta" }).click();
    await expect(page).toHaveURL(/giovanna\/lectura\/(?:\?)?#saludo$/);
    await expect(page.locator("#saludo")).toBeVisible();
    await expect(page.locator("#saludo-heading")).toHaveText("Queridos Giovanna y Noah,");
  } finally {
    await context.close();
  }
});

test("360/430px and short landscape keep the CTA accessible; expanded invitation returns focus", async ({ page }) => {
  for (const [width, height] of [[360, 640], [430, 932], [740, 360]]) {
    await page.setViewportSize({ width, height });
    await page.goto(route("/florisyabsalon/"));
    const button = page.getByRole("button", { name: "Abrir la carta" });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await button.click();
    await expect(page.locator("[data-entry-state]")).toHaveAttribute("data-entry-state", "opened");
  }
  const enlarge = page.getByRole("button", { name: "Ampliar invitación" });
  await enlarge.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(enlarge).toBeFocused();
});

test("unknown slug offers general fallback; unsupported route is 404", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const missing = await page.goto(route("/sin-asignar/"));
  expect(missing?.status()).toBe(404);
  await page.getByRole("link", { name: "Abrir la invitación", exact: true }).click();
  await page.getByRole("button", { name: "Abrir la carta" }).click();
  await expect(page.locator("#saludo-heading")).toHaveText("Querida familia,");
  const response = await page.goto(route("/roberto/no-existe"));
  expect(response?.status()).toBe(404);
});

test("visual review of closed paper, unfolding and personalized greeting", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route("/florisyabsalon/"));
  await page.screenshot({ path: testInfo.outputPath("entry-390.png") });
  await page.getByRole("button", { name: "Abrir la carta" }).click();
  await expect(page.locator("[data-opening-phase]")).toHaveAttribute("data-opening-phase", "unfolding");
  await page.screenshot({ path: testInfo.outputPath("unfolding-390.png") });
  await expect(page.locator("[data-entry-state]")).toHaveAttribute("data-entry-state", "opened");
  await page.screenshot({ path: testInfo.outputPath("greeting-390.png") });
});

test("touch entry blocks the document and restores native mobile scrolling", async ({ browser }) => {
  const context = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  const input = await context.newCDPSession(page);
  async function swipe() {
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 600 }] });
    await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y: 250 }] });
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${test.info().project.use.baseURL}/mercedes`);
    await swipe();
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.getByRole("button", { name: "Abrir la carta" }).tap();
    await expect(page.locator("[data-entry-state]")).toHaveAttribute("data-entry-state", "opened");
    const previous = await page.evaluate(() => scrollY);
    await swipe();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(previous);
    expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
  } finally {
    await context.close();
  }
});

test("desktop smooth scrolling starts only after entry and is removed on live reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route("/amparoyeduardo/"));
  expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
  await page.getByRole("button", { name: "Abrir la carta" }).click();
  await page.getByRole("button", { name: "Continuar sin animación" }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
  expect(await page.locator("[data-ink]").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).transform === "none"))).toBe(true);
});
