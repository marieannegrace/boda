import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Test-only artwork and MP4. Never commit these public files or ship a fixture build.
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage();
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 426;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    const type = "video/mp4;codecs=avc1.42001E";
    if (!MediaRecorder.isTypeSupported(type)) throw new Error("MP4 recording unavailable");
    const stream = canvas.captureStream(12);
    const recorder = new MediaRecorder(stream, { mimeType: type });
    const chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const done = new Promise((resolve) => { recorder.onstop = resolve; });
    recorder.start();
    let tick = 0;
    const draw = setInterval(() => {
      context.fillStyle = tick++ % 2 ? "#3d493c" : "#4c382e";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";
      context.font = "16px sans-serif";
      context.fillText("TEST FIXTURE", 50, 215);
    }, 80);
    await new Promise((resolve) => setTimeout(resolve, 7200));
    clearInterval(draw);
    recorder.stop();
    await done;
    stream.getTracks().forEach((track) => track.stop());
    return Array.from(new Uint8Array(await new Blob(chunks, { type }).arrayBuffer()));
  });
  await mkdir(path.join("public", "videos"), { recursive: true });
  await mkdir(path.join("public", "images"), { recursive: true });
  await writeFile(path.join("public", "videos", "story-fixture.mp4"), Buffer.from(bytes), { flag: "wx" });
  const poster = await sharp({ create: { width: 240, height: 426, channels: 3, background: "#3d493c" } }).png().toBuffer();
  await writeFile(path.join("public", "images", "story-fixture.png"), poster, { flag: "wx" });
  await writeFile(path.join("public", "videos", "story-fixture.vtt"), "WEBVTT\n\n00:00.000 --> 00:07.000\nSynthetic media caption\n", { flag: "wx" });
  await mkdir(path.join("public", "audio"), { recursive: true });
  const silentFrame = Buffer.alloc(417);
  silentFrame.set([0xff, 0xfb, 0x90, 0x00]);
  await writeFile(path.join("public", "audio", "the-love-issue.mp3"),
    Buffer.concat(Array.from({ length: 1200 }, () => silentFrame)), { flag: "wx" });
  console.log("Synthetic MP4, poster, VTT and silent MP3 created. Delete all four files and restore stories.json before publishing.");
} finally { await browser.close(); }
