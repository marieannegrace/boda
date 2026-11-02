import { assetPath } from "./asset-path";
import type { StoryPhoto } from "./stories";

export const photoSizes = "(min-width: 480px) 400px, calc(100vw - 80px)";
export function photoSrcSet(photo: StoryPhoto) {
  return photo.variants.map((variant) => `${assetPath(variant.source)} ${variant.width}w`).join(", ");
}

export function prepareImage(source: string, signal: AbortSignal, photo?: StoryPhoto): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.fetchPriority = photo ? "high" : "low";
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", abort);
    };
    const abort = () => { cleanup(); image.src = ""; reject(new DOMException("Image preparation cancelled", "AbortError")); };
    image.onload = () => {
      image.decode().then(() => { cleanup(); resolve(); }, (error: unknown) => { cleanup(); reject(error); });
    };
    image.onerror = () => { cleanup(); reject(new Error(`Image preparation failed: ${source}`)); };
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) { abort(); return; }
    if (photo) { image.sizes = photoSizes; image.srcset = photoSrcSet(photo); }
    image.src = assetPath(source);
  });
}

export async function prepareVideoStart(source: string, signal: AbortSignal) {
  const response = await fetch(assetPath(source), { headers: { Range: "bytes=0-65535" }, priority: "low", signal });
  if (!response.ok) throw new Error(`Video preparation failed: ${response.status}`);
  // A host without range support must not turn a hint into a full-video download.
  if (response.status !== 206 || Number(response.headers.get("content-length")) > 65536) {
    await response.body?.cancel();
    return false;
  }
  await response.arrayBuffer();
  return true;
}
