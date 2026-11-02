import { expect, type Locator } from "@playwright/test";

export async function goToStory(issue: Locator, target: number) {
  const count = Number(await issue.getAttribute("data-history-count"));
  const videos = Number(await issue.getAttribute("data-video-count"));
  for (let step = 0; step < count + 6 + videos * 2; step++) {
    const index = Number(await issue.getAttribute("data-story-index"));
    if (index === target) return;
    await issue.getByRole("button", { name: index < target ? "Historia siguiente" : "Historia anterior", exact: true }).click();
  }
  await expect(issue).toHaveAttribute("data-story-index", String(target));
}
