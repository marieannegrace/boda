import sharp from "sharp";
import jsQR from "jsqr";

/** @param {Buffer} image @param {string} expectedUrl */
export async function verifyQr(image, expectedUrl) {
  const { data, info } = await sharp(image).resize({ width: 1000 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (decoded?.data !== expectedUrl) throw new Error(`QR decoding failed or URL mismatch: ${expectedUrl}`);
  return decoded.data;
}
