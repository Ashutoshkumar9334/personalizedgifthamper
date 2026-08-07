import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | A_S Hamper" },
      { name: "description", content: "Your A_S Hamper order history and delivery status." },
      { property: "og:title", content: "My Orders | A_S Hamper" },
      { property: "og:description", content: "Order history and delivery status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, recipient_name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHeader eyebrow="Order history" title="My orders" />
      <Section>
        {isLoading ? (
          <p className="text-muted-foreground">Loading your orders…</p>
        ) : !data || data.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Button asChild className="mt-5">
              <Link to="/shop">Browse hampers</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {data.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-6"
              >
                <div>
                  <p className="font-mono text-sm">{o.order_number}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    For {o.recipient_name} · {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{o.status}</Badge>
                  <span className="font-display text-lg">{inr(Number(o.total))}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/track" search={{ order: o.order_number }}>
                      Track
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
