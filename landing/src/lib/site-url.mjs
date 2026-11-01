/**
 * @param {string | undefined} value
 * @returns {string | null}
 */
export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL) {
  if (!value?.trim()) return null;
  const url = new URL(value.trim());
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
    url.port || url.pathname !== "/" || !host.includes(".") ||
    host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
    /^[\d.]+$/.test(host) || host.includes(":")
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTPS origin, without paths, credentials, query, fragment, port or local/IP hosts.");
  }
  return url.origin;
}

/**
 * @param {string | null} siteUrl
 * @param {string} slug
 * @returns {string | null}
 */
export function getGuestUrl(siteUrl, slug) {
  if (!/^[a-z0-9-]{1,64}$/.test(slug) || slug === "default") {
    throw new Error("A QR requires an explicit configured guest slug.");
  }
  return siteUrl ? `${siteUrl}/${slug}` : null;
}
