import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { getCategory, hampersByCategory, type Hamper } from "@/data/hampers";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, items: hampersByCategory(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Occasion not found | A_S Hamper" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.category.name} | A_S Hamper`;
    const description = `${loaderData.category.tagline}. Shop personalised ${loaderData.category.name.toLowerCase()}, hand-packed and delivered on your chosen date.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <Section>
      <h1 className="font-display text-3xl">That occasion doesn't exist</h1>
      <Button asChild className="mt-6">
        <Link to="/shop">Browse all hampers</Link>
      </Button>
    </Section>
  ),
  errorComponent: () => (
    <Section>
      <h1 className="font-display text-3xl">Could not load this occasion</h1>
    </Section>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, items } = Route.useLoaderData();

  return (
    <>
      <PageHeader eyebrow="Occasion" title={category.name} description={category.tagline} />
      <Section>
        {items.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center">
            <p className="font-display text-2xl">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Build a custom hamper for this occasion instead.
            </p>
            <Button asChild variant="gold" className="mt-6">
              <Link to="/customize">Build your own</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((h: Hamper) => (
              <HamperCard key={h.slug} hamper={h} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
