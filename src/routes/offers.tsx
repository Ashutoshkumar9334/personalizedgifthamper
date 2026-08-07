import { createFileRoute } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { hampers } from "@/data/hampers";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals on Gift Hampers | A_S Hamper" },
      {
        name: "description",
        content: "Current discounts on A_S Hamper gift baskets — festive bundles and limited-time price drops.",
      },
      { property: "og:title", content: "Offers & Deals | A_S Hamper" },
      { property: "og:description", content: "Limited-time price drops on hand-packed hampers." },
    ],
  }),
  component: () => {
    const items = hampers.filter((h) => h.tags.includes("offer"));
    return (
      <>
        <PageHeader
          eyebrow="Limited time"
          title="Offers & deals"
          description="Festive bundles and price drops, while stock lasts."
        />
        <Section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((h) => (
              <HamperCard key={h.slug} hamper={h} />
            ))}
          </div>
        </Section>
      </>
    );
  },
});
