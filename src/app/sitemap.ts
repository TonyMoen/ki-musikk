import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'
import { blogPosts } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blogg/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/priser`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blogg`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/ki-musikk`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/om-oss`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/hjelp`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/kontakt`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/personvern`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/vilkaar`, changeFrequency: 'yearly', priority: 0.3 },
    ...blogEntries,
  ]
}
