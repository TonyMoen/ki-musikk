import type { Metadata } from "next";
import "./globals.css";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

export const metadata: Metadata = {
  title: "Musikkfabrikken - Lag norske sanger med AI",
  description: "AI-drevet norsk sanggenerator. Lag morsomme og personlige norske sanger med autentisk norsk uttale. Perfekt til fester, bursdager og sosiale medier.",
  keywords: "norsk musikk, AI sanggenerator, norske sanger, festsanger, personlige sanger, norsk uttale",
  authors: [{ name: "Musikkfabrikken" }],
  openGraph: {
    title: "Musikkfabrikken - Lag norske sanger med AI",
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
      <body>
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}
