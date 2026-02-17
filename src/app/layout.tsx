import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AudioPlayerProvider } from "@/contexts/audio-player-context";
import { GlobalPlayer } from "@/components/layout/global-player";
import { getOrganizationJsonLd } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kimusikk.no"),
  title: "KI MUSIKK - Lag norske sanger med KI",
  description: "KI-drevet norsk sanggenerator. Lag morsomme og personlige norske sanger med autentisk norsk uttale. Perfekt til fester, bursdager og sosiale medier.",
  keywords: "norsk musikk, KI sanggenerator, norske sanger, festsanger, personlige sanger, norsk uttale",
  authors: [{ name: "KI MUSIKK" }],
  icons: {
    icon: "/ki-musikk.png",
    apple: "/ki-musikk.png",
  },
  openGraph: {
    title: "KI MUSIKK - Lag norske sanger med KI",
    description: "Lag morsomme og personlige norske sanger med KI og autentisk norsk uttale",
    siteName: "KI MUSIKK",
    locale: "nb_NO",
    type: "website",
    url: "https://kimusikk.no",
  },
  twitter: {
    card: "summary_large_image",
    title: "KI MUSIKK - Lag norske sanger med KI",
    description: "Lag morsomme og personlige norske sanger med KI og autentisk norsk uttale",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationJsonLd()) }}
        />
        <TooltipProvider delayDuration={400}>
          <AudioPlayerProvider>
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
            <GlobalPlayer />
            <Toaster />
          </AudioPlayerProvider>
        </TooltipProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
