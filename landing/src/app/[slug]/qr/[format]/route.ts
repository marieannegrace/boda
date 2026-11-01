import { getExactGuest } from "@/lib/guests.server";
import { getSiteUrl, getGuestUrl } from "@/lib/site-url.mjs";
import { createQr } from "@/lib/qr.mjs";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; format: string }> }) {
  const { slug, format } = await params;
  const guest = getExactGuest(slug);
  if (!guest || !["svg", "png"].includes(format)) {
    return Response.json({ error: "QR no disponible para esta ruta o formato." }, { status: 404 });
  }
  const url = getGuestUrl(getSiteUrl(), guest.slug);
  if (!url) {
    return Response.json({ error: "URL pública pendiente. Configura NEXT_PUBLIC_SITE_URL antes de generar el QR." }, { status: 503 });
  }
  const qr = await createQr(url);
  const content = format === "svg" ? qr.svg : new Uint8Array(qr.png);
  return new Response(content, {
    headers: {
      "Content-Type": format === "svg" ? "image/svg+xml" : "image/png",
      "Content-Disposition": `inline; filename="qr-${guest.slug}.${format}"`,
      "Cache-Control": "no-store",
    },
  });
}
