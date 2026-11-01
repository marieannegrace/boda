import nextEnv from "@next/env";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSiteUrl, getGuestUrl } from "../src/lib/site-url.mjs";
import { createQr } from "../src/lib/qr.mjs";
import { verifyQr } from "./verify-qr.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);
const guests = JSON.parse(await readFile(path.join(root, "src", "data", "guests.json"), "utf8"));
const siteUrl = getSiteUrl();
const entries = Object.entries(guests).filter(([key]) => key !== "default").map(([key, guest]) => {
  if (key !== guest.slug) throw new Error(`Guest key and slug differ: ${key}`);
  return {
    slug: guest.slug,
    url: getGuestUrl(siteUrl, guest.slug),
    svg: `qr-${guest.slug}.svg`,
    png: `qr-${guest.slug}.png`,
  };
});
const output = path.join(root, "print", "qr");
await mkdir(output, { recursive: true });
const manifestPath = path.join(output, "manifest.json");
await writeFile(manifestPath, JSON.stringify({ status: "pending", siteUrl, entries }, null, 2) + "\n");
if (!siteUrl) {
  console.error("QR files NOT generated: NEXT_PUBLIC_SITE_URL is pending. Configure the real public HTTPS origin and rerun npm.cmd run qr:generate. The manifest is a plan, not an approval for print.");
  process.exitCode = 1;
} else {
  const generated = await Promise.all(entries.map(async (entry) => {
    const qr = await createQr(entry.url);
    await verifyQr(qr.png, entry.url);
    await verifyQr(Buffer.from(qr.svg), entry.url);
    return { entry, qr };
  }));
  for (const { entry, qr } of generated) {
    await writeFile(path.join(output, entry.svg), qr.svg);
    await writeFile(path.join(output, entry.png), qr.png);
  }
  await writeFile(manifestPath, JSON.stringify({ status: "decoded-and-verified", siteUrl, entries }, null, 2) + "\n");
  console.log(`${generated.length} SVG and ${generated.length} PNG files generated and decoded successfully in ${output}. Verify the deployed routes and a physical print before distribution.`);
}
