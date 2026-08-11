import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PanelCard } from "@/components/site/DashboardShell";
import { HamperCard } from "@/components/site/HamperCard";
import { Button } from "@/components/ui/button";
import { hampers } from "@/data/hampers";
import { listStoreProducts } from "@/lib/catalog.functions";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/customer/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist | A_S Hamper" },
      { name: "description", content: "Hampers you've saved for later." },
      { property: "og:title", content: "My Wishlist | A_S Hamper" },
      { property: "og:description", content: "Hampers you've saved for later." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerWishlist,
});

function CustomerWishlist() {
  const { wishlist } = useStore();

  const { data: dbProducts } = useQuery({
    queryKey: ["store-products"],
    queryFn: () => listStoreProducts(),
  });

  const all = [...(dbProducts ?? []), ...hampers];
  const saved = wishlist
    .map((slug) => all.find((h) => h.slug === slug))
    .filter((h): h is NonNullable<typeof h> => Boolean(h));

  return (
    <PanelCard
      title={`Wishlist (${saved.length})`}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/shop">Browse hampers</Link>
        </Button>
      }
    >
      {saved.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing saved yet. Tap the heart on any hamper to keep it here.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((h) => (
            <HamperCard key={h.slug} hamper={h} />
          ))}
        </div>
      )}
    </PanelCard>
  );
}
