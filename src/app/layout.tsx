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
import { getOrganizationJsonLd, getSoftwareApplicationJsonLd } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kimusikk.no"),
  title: "KI MUSIKK - Lag norske sanger med KI",
  description: "Norges beste AI-sanggenerator. Lag personlige norske sanger med autentisk norsk uttale — perfekt til bursdager, bryllup, russefeiring og fester. Betal enkelt med Vipps, ingen abonnement.",
  keywords: "AI sanggenerator norsk, KI musikk, lag sang med AI, norsk AI musikkgenerator, personlig bursdagssang AI, russelåt AI, kunstig intelligens musikk, suno alternativ norsk, KI sanggenerator, Vipps betaling, ingen abonnement",
  authors: [{ name: "KI MUSIKK" }],
  icons: {
    icon: "/ki-musikk.png",
    apple: "/ki-musikk.png",
  },
  openGraph: {
    title: "KI MUSIKK - Lag norske sanger med KI",
    description: "Lag personlige norske sanger med KI og autentisk norsk uttale. Betal med Vipps — ingen abonnement.",
    siteName: "KI MUSIKK",
    locale: "nb_NO",
    type: "website",
    url: "https://kimusikk.no",
  },
  twitter: {
    card: "summary_large_image",
    title: "KI MUSIKK - Lag norske sanger med KI",
    description: "Lag personlige norske sanger med KI og autentisk norsk uttale. Betal med Vipps — ingen abonnement.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSoftwareApplicationJsonLd()) }}
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
