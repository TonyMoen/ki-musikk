import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
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
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
