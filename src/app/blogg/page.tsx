import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'
import { CalendarDays, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blogg - KI MUSIKK',
  description:
    'Tips, guider og nyheter om AI-musikk på norsk. Lær hvordan du lager personlige sanger med kunstig intelligens — bursdagssanger, russelåter og mer.',
  keywords:
    'AI musikk blogg, KI musikk guide, lage sang med AI, norsk AI sanggenerator, kunstig intelligens musikk',
}

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Blogg</h1>
      <p className="text-xl text-muted-foreground mb-12">
        Tips, guider og inspirasjon for å lage norske sanger med kunstig intelligens.
      </p>

      <div className="grid gap-8">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blogg/${post.slug}`} className="group block">
            <article className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('nb-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-4">{post.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Les mer <ArrowRight className="h-4 w-4" />
              </span>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
