/**
 * Shared SEO constants and JSON-LD helpers for AI MUSIKK
 * Used by sitemap.ts, robots.ts, layout metadata, and page-level JSON-LD
 */

import type { FAQCategory } from '@/lib/faq-data'
import type { CreditPackage } from '@/lib/constants'

export const BASE_URL = 'https://kimusikk.no'
export const SITE_NAME = 'AI MUSIKK'
export const DEFAULT_OG_IMAGE = '/opengraph-image'

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/ki-musikk.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hei@kimusikk.no',
      contactType: 'customer service',
    },
  }
}

export function getFaqJsonLd(categories: FAQCategory[]) {
  const items = categories.flatMap(cat => cat.items)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function getProductJsonLd(packages: CreditPackage[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AI MUSIKK - Kredittpakker',
    description: 'Lag norske sanger med AI',
    offers: packages.map(pkg => ({
      '@type': 'Offer',
      name: pkg.name,
      price: String(pkg.priceNOK),
      priceCurrency: 'NOK',
      description: pkg.description,
      availability: 'https://schema.org/InStock',
    })),
  }
}

export function getSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI MUSIKK',
    description: 'Norges eneste AI-sanggenerator med autentisk norsk uttale, Vipps-betaling og engangskjøp uten abonnement.',
    url: BASE_URL,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    availableLanguage: {
      '@type': 'Language',
      name: 'Norwegian Bokmål',
      alternateName: 'nb',
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '99',
      highPrice: '499',
      priceCurrency: 'NOK',
      offerCount: 3,
    },
    featureList: [
      'Autentisk norsk uttale-optimalisering',
      'Vipps-betaling',
      'Engangskjøp uten abonnement',
      'Norsk grensesnitt',
      'AI-generert musikk med vokal',
      'Flere sjangere: pop, rock, vise, rap, EDM, country',
    ],
    creator: {
      '@type': 'Organization',
      name: 'Moen Studio',
      url: BASE_URL,
    },
  }
}

export function getLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Moen Studio',
    url: BASE_URL,
    email: 'hei@kimusikk.no',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Heddalsvegen 11',
      postalCode: '3674',
      addressLocality: 'Notodden',
      addressCountry: 'NO',
    },
    taxID: '931659685',
  }
}
