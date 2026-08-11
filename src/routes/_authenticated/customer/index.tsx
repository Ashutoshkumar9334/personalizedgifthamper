import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PanelCard, StatCard } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { orderStatusLabels, type OrderStatus } from "@/lib/orders";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer/")({
  head: () => ({
    meta: [
      { title: "My Dashboard | A_S Hamper" },
      { name: "description", content: "Your hamper orders, wishlist and account activity." },
      { property: "og:title", content: "My Dashboard | A_S Hamper" },
      { property: "og:description", content: "Your orders, wishlist and account activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlist } = useStore();

  const { data: orders } = useQuery({
    queryKey: ["customer-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: unread } = useQuery({
    queryKey: ["customer-unread", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const list = orders ?? [];
  const spent = list
    .filter((o) => !["cancelled", "refunded", "returned"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const active = list.filter((o) =>
    ["placed", "packing", "dispatched"].includes(o.status),
  ).length;

  return (
    <>
      <div>
        <p className="eyebrow">Customer dashboard</p>
        <h1 className="mt-2 font-display text-4xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track deliveries, revisit saved hampers and keep your details up to date.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders placed" value={String(list.length)} />
        <StatCard label="In progress" value={String(active)} hint="Being packed or on the way" />
        <StatCard label="Total spent" value={inr(spent)} />
        <StatCard label="Saved hampers" value={String(wishlist.length)} />
      </div>

      <PanelCard
        title="Recent orders"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/customer/orders">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      >
        <ul className="space-y-3">
          {list.slice(0, 4).map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4"
            >
              <div>
                <p className="font-mono text-sm">{o.order_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {orderStatusLabels[o.status as OrderStatus] ?? o.status}
                </Badge>
                <span className="font-display text-lg">{inr(Number(o.total))}</span>
              </div>
            </li>
          ))}
          {list.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No orders yet —{" "}
              <Link to="/shop" className="underline underline-offset-4">
                browse hampers
              </Link>
              .
            </li>
          )}
        </ul>
      </PanelCard>

      <div className="grid gap-6 md:grid-cols-2">
        <PanelCard title="Notifications">
          <p className="text-sm text-muted-foreground">
            {unread ? `${unread} unread update${unread === 1 ? "" : "s"}.` : "You're all caught up."}
          </p>
          <Button asChild variant="ghost" size="sm" className="mt-4 px-0">
            <Link to="/customer/notifications">
              Open notifications <ArrowRight />
            </Link>
          </Button>
        </PanelCard>
        <PanelCard title="Delivery addresses">
          <p className="text-sm text-muted-foreground">
            Save home and office addresses for a faster checkout.
          </p>
          <Button asChild variant="ghost" size="sm" className="mt-4 px-0">
            <Link to="/customer/addresses">
              Manage addresses <ArrowRight />
            </Link>
          </Button>
        </PanelCard>
      </div>
    </>
  );
}
