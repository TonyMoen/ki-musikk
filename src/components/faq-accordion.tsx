'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQCategory } from '@/lib/faq-data'

interface FAQAccordionProps {
  categories: FAQCategory[]
}

export function FAQAccordion({ categories }: FAQAccordionProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Ingen resultater funnet</p>
        <p className="text-sm mt-1">Prøv et annet søkeord</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`category-${category.id}`}>
          <h2
            id={`category-${category.id}`}
            className="text-lg font-semibold mb-4 text-foreground"
          >
            {category.title}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {category.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left min-h-[48px] py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  )
}
