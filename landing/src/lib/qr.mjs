import QRCode from "qrcode";

export const qrOptions = {
  errorCorrectionLevel: /** @type {const} */ ("M"),
  margin: 4,
  color: { dark: "#000000ff", light: "#ffffffff" },
};

/** @param {string} url */
export async function createQr(url) {
  const svg = await QRCode.toString(url, { ...qrOptions, type: "svg" });
  const png = await QRCode.toBuffer(url, { ...qrOptions, type: "png", scale: 32 });
  return { svg, png };
}
