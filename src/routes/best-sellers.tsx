import { createFileRoute } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { hampers } from "@/data/hampers";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Selling Gift Hampers | A_S Hamper" },
      {
        name: "description",
        content: "The hampers our customers reorder most, ranked by reviews and repeat gifting.",
      },
      { property: "og:title", content: "Best Sellers | A_S Hamper" },
      { property: "og:description", content: "The hampers our customers reorder most." },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Loved most" title="Best sellers" />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hampers
            .filter((h) => h.tags.includes("bestseller"))
            .sort((a, b) => b.reviews - a.reviews)
            .map((h) => (
              <HamperCard key={h.slug} hamper={h} />
            ))}
        </div>
      </Section>
    </>
  ),
});
