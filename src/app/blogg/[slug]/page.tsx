import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, getAllBlogSlugs } from '@/lib/blog-data'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import { BASE_URL } from '@/lib/seo'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  return {
    title: `${post.title} - KI MUSIKK`,
    description: post.description,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      locale: 'nb_NO',
      siteName: 'KI MUSIKK',
      url: `${BASE_URL}/blogg/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'KI MUSIKK',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KI MUSIKK',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/ki-musikk.png`,
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <Link
          href="/blogg"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake til bloggen
        </Link>

        <article>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('nb-NO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

          <div className="space-y-8">
            {post.content.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
                )}
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-muted-foreground mb-4 leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-2 mb-4">
                    {section.list.map((item, k) => (
                      <li
                        key={k}
                        className="flex gap-3 text-muted-foreground"
                      >
                        <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl bg-primary/10 border border-primary/20 p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              Klar for å lage din egen sang?
            </h2>
            <p className="text-muted-foreground mb-6">
              Prøv KI MUSIKK — lag norske sanger med autentisk uttale på under 2 minutter. Betal med Vipps, ingen abonnement.
            </p>
            <Link
              href="/auth/logg-inn"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Kom i gang nå
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}
