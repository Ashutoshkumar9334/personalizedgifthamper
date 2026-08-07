import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/data/hampers";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | A_S Hamper" },
      {
        name: "description",
        content: "Review the hampers in your cart before choosing a delivery date and checking out.",
      },
      { property: "og:title", content: "Your Cart | A_S Hamper" },
      { property: "og:description", content: "Review your hampers and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, removeLine, subtotal } = useStore();
  const shipping = subtotal > 2499 || subtotal === 0 ? 0 : 149;

  return (
    <>
      <PageHeader eyebrow="Almost there" title="Your cart" />
      <Section>
        {cart.length === 0 ? (
          <div className="rounded-lg border border-border p-16 text-center">
            <p className="font-display text-2xl">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with a curated basket or build one from scratch.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link to="/shop">Shop hampers</Link>
              </Button>
              <Button asChild variant="gold">
                <Link to="/customize">Build your own</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-5">
              {cart.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-5 rounded-lg border border-border bg-card p-5"
                >
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-24 shrink-0 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="font-display text-xl">{line.name}</h2>
                    {line.custom && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.custom.box} · {line.custom.items.length} items ·{" "}
                        {line.custom.wrapping}
                        {line.custom.message ? ` · “${line.custom.message}”` : ""}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center rounded-md border border-input text-sm">
                        <button
                          type="button"
                          className="px-2.5 py-1.5"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-7 text-center">{line.qty}</span>
                        <button
                          type="button"
                          className="px-2.5 py-1.5"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-display text-xl">{inr(line.price * line.qty)}</p>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-lg border border-border bg-card p-6">
              <p className="eyebrow">Order summary</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <dt>Total</dt>
                  <dd className="font-display text-xl">{inr(subtotal + shipping)}</dd>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full" size="lg">
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </Section>
    </>
  );
}
