import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/priser`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/om-oss`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/hjelp`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/kontakt`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/personvern`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/vilkaar`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
