import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getNiche } from '@/lib/niches'
import { NicheLanding } from '@/components/niche-landing'
import { BASE_URL } from '@/lib/seo'

const SLUG = 'rap'

export function generateMetadata(): Metadata {
  const data = getNiche(SLUG)
  if (!data) return {}
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    openGraph: {
      title: data.ogTitle,
      description: data.ogDescription,
      type: 'article',
      locale: 'nb_NO',
      siteName: 'AI MUSIKK',
      url: `${BASE_URL}/ai-${SLUG}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.ogTitle,
      description: data.ogDescription,
    },
  }
}

export default function Page() {
  const data = getNiche(SLUG)
  if (!data) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.h1,
    description: data.metaDescription,
    author: { '@type': 'Organization', name: 'AI MUSIKK', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'AI MUSIKK',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/ki-musikk.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/ai-${SLUG}` },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <NicheLanding data={data} />
    </>
  )
}
