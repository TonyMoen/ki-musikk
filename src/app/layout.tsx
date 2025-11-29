import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "AIMusikk - Lag norske sanger med AI",
  description: "AI-drevet norsk sanggenerator. Lag morsomme og personlige norske sanger med autentisk norsk uttale. Perfekt til fester, bursdager og sosiale medier.",
  keywords: "norsk musikk, AI sanggenerator, norske sanger, festsanger, personlige sanger, norsk uttale",
  authors: [{ name: "AIMusikk" }],
  icons: {
    icon: "/55-558640_free-png-ios-emoji-musical-note-png-images.png",
    apple: "/55-558640_free-png-ios-emoji-musical-note-png-images.png",
  },
  openGraph: {
    title: "AIMusikk - Lag norske sanger med AI",
    description: "Lag morsomme og personlige norske sanger med AI og autentisk norsk uttale",
    locale: "nb_NO",
    type: "website",
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
        <TooltipProvider delayDuration={400}>
          <Header />
          <main className="flex-1 pt-16 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNavigation />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
