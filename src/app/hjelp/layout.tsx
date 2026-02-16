import type { Metadata } from 'next'
import { FAQ_DATA } from '@/lib/faq-data'
import { getFaqJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Hjelp og FAQ - KI MUSIKK',
  description: 'Finn svar på vanlige spørsmål om KI MUSIKK. Lær hvordan du lager sanger, kjøper kreditter, og får mest ut av tjenesten.',
}

export default function HjelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqJsonLd(FAQ_DATA)) }}
      />
      {children}
    </>
  )
}
