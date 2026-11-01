import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { getGuestUrl, getSiteUrl } from "../src/lib/site-url.mjs";
import { createQr, qrOptions } from "../src/lib/qr.mjs";
import { verifyQr } from "../scripts/verify-qr.mjs";

const guests = JSON.parse(await readFile(new URL("../src/data/guests.json", import.meta.url), "utf8"));

test("public URL configuration is explicit and rejects local/invalid origins", () => {
  assert.equal(getSiteUrl(""), null);
  for (const value of [
    "http://localhost:3000", "https://127.0.0.1", "https://localhost",
    "https://192.168.1.5", "https://site.local", "https://example.test/path",
    "https://user:password@example.test", "https://example.test?preview=1", "https://example.test/#test",
  ]) assert.throws(() => getSiteUrl(value));
  assert.equal(getSiteUrl("https://example.test/"), "https://example.test");
  assert.equal(getGuestUrl(null, "roberto"), null);
  assert.throws(() => getGuestUrl(null, "../roberto"));
  assert.throws(() => getGuestUrl(null, "default"));
});

for (const guest of Object.values(guests).filter((item) => item.slug !== "default")) {
  test(`QR roundtrip PNG and SVG -> exact route -> ${guest.slug}`, async () => {
    // Reserved test origin, used only in memory. Never emitted as a print deliverable.
    const url = getGuestUrl(getSiteUrl("https://example.test"), guest.slug);
    const { svg, png } = await createQr(url);
    assert.equal(qrOptions.margin, 4);
    assert.doesNotMatch(svg, /<text/);
    assert.equal(await verifyQr(png, url), url);
    assert.equal(await verifyQr(Buffer.from(svg), url), url);
    const metadata = await sharp(png).metadata();
    assert.ok(metadata.width >= 1000);
    assert.equal(metadata.width, metadata.height);
    const decodedSlug = new URL(await verifyQr(png, url)).pathname.slice(1);
    assert.equal(guests[decodedSlug].displayName, guest.displayName);
  });
}
