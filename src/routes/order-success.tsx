import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search["order"] === "string" ? search["order"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed | A_S Hamper" },
      { name: "description", content: "Your hamper order is confirmed and being hand-packed." },
      { property: "og:title", content: "Order Confirmed | A_S Hamper" },
      { property: "og:description", content: "Your hamper is being hand-packed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { order } = Route.useSearch();

  return (
    <Section>
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-12 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h1 className="mt-6 font-display text-4xl">Order confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you — we're already choosing the ribbon. You'll get a WhatsApp update when your
          hamper is dispatched.
        </p>
        {order && (
          <p className="mt-6 rounded-md bg-secondary px-4 py-3 font-mono text-sm">{order}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/orders">View my orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/track" search={{ order }}>
              Track this order
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/shop">Keep shopping</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
