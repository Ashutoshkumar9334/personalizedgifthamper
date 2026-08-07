import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  [
    "How far in advance should I order?",
    "Two days is comfortable for most cities. Custom photo printing and wooden trunks need three days. Same-day dispatch is available in Pune and Mumbai for orders before 2 PM.",
  ],
  [
    "Can I add my own photo and message?",
    "Yes. In the hamper builder you can upload a photo for a printed card or mug, and write up to 300 characters that we hand-write onto a cotton card.",
  ],
  [
    "Do you deliver on a specific date and time?",
    "You pick both at checkout, including a late-evening surprise slot between 6 and 9 PM.",
  ],
  [
    "What is your return policy?",
    "Anything damaged in transit is replaced or refunded in full within 48 hours of delivery. Personalised items can't be resold, so we don't accept change-of-mind returns on them.",
  ],
  [
    "Do you handle bulk corporate orders?",
    "From 25 units upwards, with custom branded ribbons, GST invoicing and dispatch to multiple addresses.",
  ],
  [
    "Is the delivery free?",
    "Delivery is free above ₹2,499. Below that it's a flat ₹149 anywhere in India.",
  ],
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Ordering, Delivery & Returns | A_S Hamper" },
      {
        name: "description",
        content:
          "Answers on lead times, personalisation, delivery slots, returns and bulk corporate hamper orders.",
      },
      { property: "og:title", content: "A_S Hamper FAQ" },
      { property: "og:description", content: "Lead times, personalisation, delivery and returns." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Help" title="Frequently asked questions" />
      <Section>
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-lg">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  ),
});
