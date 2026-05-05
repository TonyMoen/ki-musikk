import type { Metadata } from 'next'
import { CREDIT_PACKAGES } from '@/lib/constants'
import { getProductJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Priser - AI MUSIKK',
  description: 'Se priser og kredittpakker for AI MUSIKK. Fra 99 kr for 20 norske sanger — du får 2 versjoner per generering. Betal enkelt med Vipps, ingen abonnement.',
}

export default function PriserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductJsonLd(CREDIT_PACKAGES)) }}
      />
      {children}
    </>
  )
}
