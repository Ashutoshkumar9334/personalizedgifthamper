import { createFileRoute, Link } from "@tanstack/react-router";
import { HamperCard } from "@/components/site/HamperCard";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { getHamper } from "@/data/hampers";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist | A_S Hamper" },
      {
        name: "description",
        content: "Hampers you've saved for later, ready to move into your cart whenever you are.",
      },
      { property: "og:title", content: "Your Wishlist | A_S Hamper" },
      { property: "og:description", content: "Hampers you've saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const items = wishlist.map(getHamper).filter((h): h is NonNullable<typeof h> => Boolean(h));

  return (
    <>
      <PageHeader eyebrow="Saved" title="Your wishlist" />
      <Section>
        {items.length === 0 ? (
          <div className="rounded-lg border border-border p-16 text-center">
            <p className="font-display text-2xl">Nothing saved yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any hamper to keep it here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/shop">Browse hampers</Link>
            </Button>
          </div>
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
