import { createFileRoute } from "@tanstack/react-router";
import heroHamper from "@/assets/hero-hamper.jpg";
import { PageHeader, Section } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About A_S Hamper — Hand-Packed Personalised Gifting" },
      {
        name: "description",
        content:
          "A_S Hamper started as a two-person packing table in Pune. We still hand-pack every gift hamper and write every card ourselves.",
      },
      { property: "og:title", content: "About A_S Hamper" },
      {
        property: "og:description",
        content: "A two-person packing table in Pune, now gifting across 48 cities.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Gifting that still feels hand-made"
        description="Founded in Pune in 2016. Twelve thousand hampers later, we still tie the ribbons ourselves."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <img
            src={heroHamper}
            alt="A_S Hamper packing table with baskets and ribbons"
            loading="lazy"
            width={1600}
            height={1200}
            className="rounded-lg object-cover"
          />
          <div className="space-y-5 text-muted-foreground">
            <p>
              We began because store-bought gifting felt anonymous — the same shrink-wrapped
              basket, the same printed card. So we built a studio where you choose the basket,
              the contents, the photo and the words.
            </p>
            <p>
              Every hamper is packed to order. Nothing sits in a warehouse. Fresh flowers are
              sourced the morning of dispatch, chocolate comes from two makers we've worked with
              since the first year, and cards are written by hand.
            </p>
            <h2 className="font-display text-2xl text-foreground">What we promise</h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>Hand-packed within 24 hours of your order</li>
              <li>Photographed before dispatch, so you see exactly what shipped</li>
              <li>Replacement or refund on anything damaged in transit</li>
              <li>No plastic filler — shredded kraft and cotton only</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  ),
});
