import { createFileRoute } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { hampers } from "@/data/hampers";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals | A_S Hamper" },
      {
        name: "description",
        content: "The newest hampers in the A_S Hamper collection, fresh from our packing table.",
      },
      { property: "og:title", content: "New Arrivals | A_S Hamper" },
      { property: "og:description", content: "The newest hampers in the collection." },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Just landed" title="New arrivals" />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hampers
            .filter((h) => h.tags.includes("new"))
            .map((h) => (
              <HamperCard key={h.slug} hamper={h} />
            ))}
        </div>
      </Section>
    </>
  ),
});
