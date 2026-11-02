import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getGuestUrl, getSiteUrl } from "../src/lib/site-url.mjs";
import { verifyQr } from "../scripts/verify-qr.mjs";

const base = process.env.BETA_URL ?? "http://127.0.0.1:3000";
const guests = JSON.parse(await readFile(new URL("../src/data/guests.json", import.meta.url), "utf8"));
const event = JSON.parse(await readFile(new URL("../src/data/event.json", import.meta.url), "utf8"));

test("only the six approved guests and public default are configured", () => {
  assert.deepEqual(Object.keys(guests).sort(), ["amparoyeduardo", "default", "florisyabsalon", "giovanna", "mariayroberto", "mercedes", "roberto"]);
  assert.equal(guests.roberto.displayName, "Roberto y familia");
  assert.equal(guests.roberto.video, "/videos/roberto.mp4");
  assert.equal(guests.roberto.postWeddingAccess, null);
  assert.equal(guests.default.video, null);
  assert.deepEqual(Object.values(guests).filter((guest) => guest.slug !== "default").map((guest) => guest.seats), [null, 2, 2, 2, null, 3]);
  assert.ok(Object.values(guests).every((guest) => guest.postWeddingAccess !== true));
});

test("chronology and provisional agendas preserve approved facts", () => {
  assert.deepEqual(event.story.map((item) => item.year), ["2008", "2022", "2026"]);
  assert.deepEqual(event.agenda.map((item) => item.time), ["3:45 PM", "4:00 PM", "4:40 PM", "7:00 PM", "8:00 PM", null]);
  assert.deepEqual(event.postWedding.agenda.map((item) => item.time), ["8:00 AM", "8:45 AM", "8:55 AM", "11:00 AM"]);
  assert.equal(event.location.exactMapUrl, null);
});

test("Roberto receives all 15 scenes in server HTML without a mounted video source", async () => {
  const response = await fetch(`${base}/roberto`);
  assert.equal(response.status, 200);
  const html = await response.text();
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.doesNotMatch(markup, /<div hidden id="S:/, "Content must not depend on streaming scripts to become visible");
  assert.deepEqual([...markup.matchAll(/data-scene="([^"]+)"/g)].map((match) => match[1]), [
    "carta", "apertura", "saludo", "video", "historia", "2008", "2022", "2026",
    "invitacion", "ceremonia", "dress-code", "puerto-velero", "postboda", "confirmacion", "cierre",
  ]);
  assert.match(markup, /Queridos Roberto y familia/);
  assert.match(markup, /El acceso de esta invitación está pendiente de asignación/);
  assert.match(markup, /Con cariño,/);
  assert.match(markup, /data-entry-state="locked"/);
  assert.match(markup, /hidden="" inert="" data-letter-content/);
  assert.doesNotMatch(markup, /Desayuno junto a la piscina/);
  assert.doesNotMatch(markup, /<video[^>]*src=/);
  assert.doesNotMatch(markup, /12:00 (AM|PM)/);
  assert.match(markup, /wa\.me\/573052951053/);
  assert.match(markup, /Búsqueda general, no es el pin del evento/);
  assert.match(markup, /<title>Una carta de Luis &amp; Marie<\/title>/);
});

for (const guest of Object.values(guests).filter((item) => item.slug !== "default")) {
  test(`direct route, personalization, seats, fallback video and WhatsApp: ${guest.slug}`, async () => {
    const response = await fetch(`${base}/${guest.slug}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const seats = guest.seats ?? guest.seatsPendingLabel;
    assert.ok(markup.includes(guest.displayName));
    assert.ok(markup.includes(guest.greeting));
    assert.ok(markup.replaceAll("<!-- -->", "").includes(`Cupos: ${seats}`));
    assert.equal([...markup.matchAll(/data-scene="/g)].length, 15);
    assert.match(markup, /data-entry-state="locked"/);
    assert.match(markup, /Con cariño,/);
    const rsvp = markup.match(/href="(https:\/\/wa\.me\/[^"]+)"/)?.[1];
    assert.ok(rsvp);
    assert.ok(new URL(rsvp.replaceAll("&amp;", "&")).searchParams.get("text").includes(guest.displayName));
    for (const other of Object.values(guests).filter((item) => item.slug !== guest.slug && item.video)) {
      assert.ok(!html.includes(other.video), `No other guest video should be serialized: ${other.slug}`);
    }
    const qr = await fetch(`${base}/qr/qr-${guest.slug}.svg`);
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      assert.equal(qr.status, 404);
    } else {
      assert.equal(qr.status, 200);
      assert.match(qr.headers.get("content-type"), /image\/svg/);
      const url = getGuestUrl(getSiteUrl(), guest.slug);
      assert.equal(await verifyQr(Buffer.from(await qr.arrayBuffer()), url), url);
      const png = await fetch(`${base}/qr/qr-${guest.slug}.png`);
      assert.equal(png.status, 200);
      assert.equal(await verifyQr(Buffer.from(await png.arrayBuffer()), url), url);
    }
  });
}

test("explicit no-JS form submission opens the content without a script dependency", async () => {
  const html = await (await fetch(`${base}/roberto/lectura/`)).text();
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.match(markup, /data-entry-state="opened"/);
  assert.doesNotMatch(markup, /hidden="" inert="" data-letter-content/);
});

test("QR files never use the general guest fallback", async () => {
  assert.equal((await fetch(`${base}/qr/qr-sin-asignar.svg`)).status, 404);
  assert.equal((await fetch(`${base}/qr/qr-roberto.pdf`)).status, 404);
});

test("general invitation contains no guest media and unknown slugs return the general 404", async () => {
  for (const route of ["/"]) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Querida familia/);
    assert.doesNotMatch(html, /\/videos\/roberto\.mp4/);
  }
  const response = await fetch(`${base}/sin-asignar/`);
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /Querida familia/);
  assert.match(html, /Con cariño,/);
  assert.doesNotMatch(html, /\/videos\/roberto\.mp4/);
});

test("unsupported nested routes are 404, and the facsimile derivative is served", async () => {
  assert.equal((await fetch(`${base}/roberto/no-existe`)).status, 404);
  const image = await fetch(`${base}/invitation/invitation.webp`);
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type"), /image\/webp/);
});
