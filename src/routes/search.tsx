import { createFileRoute } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { hampers } from "@/data/hampers";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Search Hampers | A_S Hamper" },
      {
        name: "description",
        content: "Search the A_S Hamper collection by name, occasion or what's inside.",
      },
      { property: "og:title", content: "Search Hampers | A_S Hamper" },
      { property: "og:description", content: "Find the right hamper fast." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = q.trim().toLowerCase();
  const results = query
    ? hampers.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.category.includes(query) ||
          h.blurb.toLowerCase().includes(query) ||
          h.contents.some((c) => c.toLowerCase().includes(query)),
      )
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Search results"
        title={query ? `“${q}”` : "Search hampers"}
        description={
          query ? `${results.length} matching hampers` : "Use the search box in the header."
        }
      />
      <Section>
        {results.length === 0 ? (
          <p className="text-muted-foreground">
            {query ? "No hampers matched. Try “diwali”, “birthday” or “chocolate”." : ""}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((h) => (
              <HamperCard key={h.slug} hamper={h} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
