import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, hampers } from "@/data/hampers";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Gift Hampers | A_S Hamper" },
      {
        name: "description",
        content:
          "Browse every A_S Hamper gift basket — birthday, anniversary, wedding, festival, corporate and luxury hampers, sorted by price or popularity.",
      },
      { property: "og:title", content: "Shop All Gift Hampers | A_S Hamper" },
      {
        property: "og:description",
        content: "Every curated hamper in one place. Filter by occasion and price.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");

  const list = useMemo(() => {
    const filtered =
      category === "all" ? hampers : hampers.filter((h) => h.category === category);
    const sorted = [...filtered];
    if (sort === "low") sorted.sort((a, b) => a.price - b.price);
    if (sort === "high") sorted.sort((a, b) => b.price - a.price);
    if (sort === "popular") sorted.sort((a, b) => b.reviews - a.reviews);
    return sorted;
  }, [category, sort]);

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title="All hampers"
        description="Curated baskets, hand-packed to order. Or start from scratch with our builder."
      />
      <Section>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All occasions</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="low">Price: low to high</SelectItem>
              <SelectItem value="high">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild variant="gold" className="ml-auto">
            <Link to="/customize">Build your own</Link>
          </Button>
        </div>

        <p className="eyebrow mt-8">{list.length} hampers</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((h) => (
            <HamperCard key={h.slug} hamper={h} />
          ))}
        </div>
      </Section>
    </>
  );
}
