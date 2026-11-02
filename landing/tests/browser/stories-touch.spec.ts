import { test, expect } from "@playwright/test";

test("Love Issue real touch swipe and long press work without blocking vertical page scrolling", async ({ browser }) => {
  const context = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${test.info().project.use.baseURL}/roberto/lectura/`);
    const issue = page.locator("[data-love-issue]");
    await issue.getByRole("button", { name: "Entrar con sonido" }).tap();
    const surface = issue.locator('[class*="surface"]');
    await surface.scrollIntoViewIfNeeded();
    const bounds = await surface.boundingBox();
    if (!bounds) throw new Error("Missing touch surface");
    const input = await context.newCDPSession(page);
    const y = bounds.y + bounds.height / 2;
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bounds.x + bounds.width * 0.8, y }] });
    await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: bounds.x + bounds.width * 0.2, y }] });
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(issue).toHaveAttribute("data-story-index", "1");
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bounds.x + bounds.width / 2, y }] });
    await expect(issue).toHaveAttribute("data-holding", "true");
    await page.waitForTimeout(400);
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(issue).toHaveAttribute("data-holding", "false");
    await expect(issue).toHaveAttribute("data-story-index", "1");
    const previous = await page.evaluate(() => scrollY);
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bounds.x + bounds.width / 2, y }] });
    await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: bounds.x + bounds.width / 2, y: y - 130 }] });
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(previous);
  } finally { await context.close(); }
});
