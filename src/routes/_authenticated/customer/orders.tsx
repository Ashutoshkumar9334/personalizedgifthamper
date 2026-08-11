import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { PanelCard } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { orderItemsOf, orderStatusLabels, type OrderStatus } from "@/lib/orders";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | A_S Hamper" },
      { name: "description", content: "Track your hamper orders, cancellations and returns." },
      { property: "og:title", content: "My Orders | A_S Hamper" },
      { property: "og:description", content: "Track your hamper orders and returns." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerOrders,
});

function CustomerOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-orders-full", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_r, vars) => {
      toast.success(
        vars.status === "cancelled" ? "Order cancelled." : "Return request sent to our team.",
      );
      void queryClient.invalidateQueries({ queryKey: ["customer-orders-full"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: () => toast.error("That order can no longer be changed. Contact support for help."),
  });

  const orders = data ?? [];

  return (
    <PanelCard title="My orders">
      {isLoading && <p className="text-sm text-muted-foreground">Loading your orders…</p>}
      <ul className="space-y-4">
        {orders.map((o) => {
          const isOpen = openId === o.id;
          const items = orderItemsOf(o.items);
          const status = o.status as OrderStatus;
          return (
            <Fragment key={o.id}>
              <li className="rounded-lg border border-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm">{o.order_number}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Placed {new Date(o.created_at).toLocaleDateString("en-IN")} · delivery{" "}
                      {o.delivery_date ?? "to be scheduled"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={status === "delivered" ? "gold" : "secondary"}>
                      {orderStatusLabels[status] ?? o.status}
                    </Badge>
                    <span className="font-display text-lg">{inr(Number(o.total))}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpenId(isOpen ? null : o.id)}
                    >
                      {isOpen ? "Hide" : "Details"}
                    </Button>
                    {(status === "placed" || status === "packing") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setStatus.mutate({ id: o.id, status: "cancelled" })}
                      >
                        Cancel order
                      </Button>
                    )}
                    {status === "delivered" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setStatus.mutate({ id: o.id, status: "return_requested" })}
                      >
                        Request return
                      </Button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-5 grid gap-6 border-t border-border pt-5 md:grid-cols-3">
                    <div>
                      <p className="eyebrow">Delivering to</p>
                      <p className="mt-2 text-sm">
                        {o.recipient_name}
                        <br />
                        {o.address_line1}
                        <br />
                        {o.city} {o.postal_code}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">Items</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {items.map((it, i) => (
                          <li key={`${it.slug ?? it.name ?? "item"}-${i}`}>
                            {it.qty ?? 1} × {it.name ?? it.slug ?? "Item"}
                          </li>
                        ))}
                        {items.length === 0 && (
                          <li className="text-muted-foreground">No line items stored.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="eyebrow">Personalisation</p>
                      <p className="mt-2 text-sm">
                        {o.wrapping ? `Wrapping: ${o.wrapping}` : "Standard wrapping"}
                      </p>
                      {o.gift_message && <p className="mt-2 text-sm italic">“{o.gift_message}”</p>}
                    </div>
                  </div>
                )}
              </li>
            </Fragment>
          );
        })}
        {!isLoading && orders.length === 0 && (
          <li className="text-sm text-muted-foreground">
            You haven't ordered yet —{" "}
            <Link to="/shop" className="underline underline-offset-4">
              start with our bestsellers
            </Link>
            .
          </li>
        )}
      </ul>
    </PanelCard>
  );
}
