import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";

const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: [
    { path: "../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Una carta de Luis & Marie",
  description: "Una historia compartida. Un nuevo capítulo. Luis & Marie, 7 de diciembre de 2026.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Una carta de Luis & Marie",
    description: "7 de diciembre de 2026 · Puerto Velero, Atlántico",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
