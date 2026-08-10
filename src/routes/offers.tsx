import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { hampers } from "@/data/hampers";
import { listStoreProducts } from "@/lib/catalog.functions";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals on Gift Hampers | A_S Hamper" },
      {
        name: "description",
        content:
          "Current discounts on A_S Hamper gift baskets — festive bundles and limited-time price drops.",
      },
      { property: "og:title", content: "Offers & Deals | A_S Hamper" },
      { property: "og:description", content: "Limited-time price drops on hand-packed hampers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { data: dbProducts } = useQuery({
    queryKey: ["store-products"],
    queryFn: () => listStoreProducts(),
  });

  const seen = new Set<string>();
  const items = [...(dbProducts ?? []), ...hampers].filter((h) => {
    if (!h.tags.includes("offer") || seen.has(h.slug)) return false;
    seen.add(h.slug);
    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="Limited time"
        title="Offers & deals"
        description="Festive bundles and price drops, while stock lasts."
      />
      <Section>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No offers running right now — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((h) => (
              <HamperCard key={h.slug} hamper={h} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
