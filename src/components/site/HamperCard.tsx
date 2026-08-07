import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr, type Hamper } from "@/data/hampers";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function HamperCard({ hamper }: { hamper: Hamper }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const saved = wishlist.includes(hamper.slug);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Link
        to="/product/$slug"
        params={{ slug: hamper.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={hamper.image}
          alt={hamper.name}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      <div className="absolute top-3 left-3 flex gap-1.5">
        {hamper.tags.includes("new") && <Badge variant="gold">New</Badge>}
        {hamper.tags.includes("offer") && <Badge>Offer</Badge>}
      </div>

      <button
        type="button"
        onClick={() => toggleWishlist(hamper.slug)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground backdrop-blur transition-colors hover:bg-card"
      >
        <Heart className={cn("size-4", saved && "fill-primary text-primary")} />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{hamper.category.replace("-", " ")}</p>
        <h3 className="mt-1.5 font-display text-xl leading-snug">
          <Link to="/product/$slug" params={{ slug: hamper.slug }}>
            {hamper.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{hamper.blurb}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg">{inr(hamper.price)}</span>
          {hamper.compareAt && (
            <span className="text-sm text-muted-foreground line-through">
              {inr(hamper.compareAt)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            addToCart({
              slug: hamper.slug,
              name: hamper.name,
              price: hamper.price,
              image: hamper.image,
            });
            toast.success(`${hamper.name} added to cart`);
          }}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}
