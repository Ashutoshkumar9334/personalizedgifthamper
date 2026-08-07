import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HamperCard } from "@/components/site/HamperCard";
import { Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getHamper, hampers, inr } from "@/data/hampers";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const hamper = getHamper(params.slug);
    if (!hamper) throw notFound();
    return { hamper };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Hamper not found | A_S Hamper" }, { name: "robots", content: "noindex" }],
      };
    }
    const { hamper } = loaderData;
    const title = `${hamper.name} | A_S Hamper`;
    return {
      meta: [
        { title },
        { name: "description", content: hamper.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: hamper.blurb },
      ],
    };
  },
  notFoundComponent: () => (
    <Section>
      <h1 className="font-display text-3xl">We couldn't find that hamper</h1>
      <Button asChild className="mt-6">
        <Link to="/shop">Browse all hampers</Link>
      </Button>
    </Section>
  ),
  errorComponent: () => (
    <Section>
      <h1 className="font-display text-3xl">Could not load this hamper</h1>
    </Section>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { hamper } = Route.useLoaderData();
  const { addToCart, wishlist, toggleWishlist, markViewed } = useStore();
  const [qty, setQty] = useState(1);
  const saved = wishlist.includes(hamper.slug);

  useEffect(() => {
    markViewed(hamper.slug);
  }, [hamper.slug, markViewed]);

  const related = hampers.filter((h) => h.slug !== hamper.slug).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <nav className="eyebrow flex gap-2">
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span>/</span>
          <Link
            to="/category/$slug"
            params={{ slug: hamper.category }}
            className="hover:text-foreground"
          >
            {hamper.category.replace("-", " ")}
          </Link>
        </nav>
      </div>

      <Section className="!pt-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <img
            src={hamper.image}
            alt={hamper.name}
            width={800}
            height={800}
            className="w-full rounded-lg object-cover"
          />

          <div>
            <p className="eyebrow">{hamper.category.replace("-", " ")}</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{hamper.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4 fill-gold text-gold" />
              {hamper.rating} · {hamper.reviews} reviews
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl">{inr(hamper.price)}</span>
              {hamper.compareAt && (
                <span className="text-muted-foreground line-through">
                  {inr(hamper.compareAt)}
                </span>
              )}
            </div>
            <p className="mt-5 text-muted-foreground">{hamper.blurb}</p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-input">
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  addToCart({
                    slug: hamper.slug,
                    name: hamper.name,
                    price: hamper.price,
                    image: hamper.image,
                    qty,
                  });
                  toast.success("Added to cart");
                }}
              >
                Add to cart
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-10"
                onClick={() => toggleWishlist(hamper.slug)}
                aria-label="Save to wishlist"
              >
                <Heart className={cn(saved && "fill-primary text-primary")} />
              </Button>
            </div>

            <Button asChild variant="gold" className="mt-3 w-full sm:w-auto">
              <Link to="/customize">Personalise this hamper instead</Link>
            </Button>

            <Separator className="my-8" />

            <p className="eyebrow">What's inside</p>
            <ul className="mt-3 space-y-2 text-sm">
              {hamper.contents.map((c: string) => (
                <li key={c} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-start gap-3 rounded-lg bg-secondary/70 p-4 text-sm">
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-muted-foreground">
                Dispatched within 24 hours. Choose your delivery date and slot at checkout —
                including our late-evening surprise slot.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <h2 className="font-display text-3xl">You may also like</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((h) => (
            <HamperCard key={h.slug} hamper={h} />
          ))}
        </div>
      </Section>
    </>
  );
}
