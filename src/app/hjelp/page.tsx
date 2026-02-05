'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FAQAccordion } from '@/components/faq-accordion'
import { FAQ_DATA } from '@/lib/faq-data'
import { Search, Mail } from 'lucide-react'

export default function HjelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce the search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    // Clear any existing timeout
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [])

  // Filter FAQ items based on search query
  const filteredFAQ = useMemo(() => {
    if (!debouncedQuery.trim()) return FAQ_DATA

    const query = debouncedQuery.toLowerCase()
    return FAQ_DATA.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      ),
    })).filter((category) => category.items.length > 0)
  }, [debouncedQuery])

  return (
    <div className="container mx-auto p-6 pb-24">
      <div className="max-w-[640px] mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-foreground">
          Hjelp og ofte stilte spørsmål
        </h1>

        {/* Search Input */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Søk i ofte stilte spørsmål..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 min-h-[48px]"
            aria-label="Søk i ofte stilte spørsmål"
          />
        </div>

        {/* FAQ Accordion */}
        <FAQAccordion categories={filteredFAQ} />

        {/* Contact Section */}
        <Card className="mt-8 border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2 text-foreground">
                Trenger du fortsatt hjelp?
              </h2>
              <p className="text-muted-foreground mb-4">
                Sjekk gjerne spørsmålene over først. Finner du ikke svar, ta
                kontakt med oss.
              </p>
              <a
                href="mailto:groftefyllband@gmail.com"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium min-h-[48px] px-4"
              >
                <Mail className="h-5 w-5" />
                groftefyllband@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
