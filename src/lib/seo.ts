/**
 * Shared SEO constants and JSON-LD helpers for KI MUSIKK
 * Used by sitemap.ts, robots.ts, layout metadata, and page-level JSON-LD
 */

import type { FAQCategory } from '@/lib/faq-data'
import type { CreditPackage } from '@/lib/constants'

export const BASE_URL = 'https://kimusikk.no'
export const SITE_NAME = 'KI MUSIKK'
export const DEFAULT_OG_IMAGE = '/ki-musikk.png'

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
    name: 'KI MUSIKK - Kredittpakker',
    description: 'Lag norske sanger med KI',
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
