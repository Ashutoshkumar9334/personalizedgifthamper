import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/site/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Admin Orders Dashboard | A_S Hamper" },
      {
        name: "description",
        content:
          "Internal order management for the A_S Hamper team: statuses, returns and cancellations.",
      },
      { property: "og:title", content: "Admin Orders Dashboard | A_S Hamper" },
      { property: "og:description", content: "Internal order management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrders,
});

const statuses = [
  "placed",
  "packing",
  "dispatched",
  "delivered",
  "return_requested",
  "returned",
  "refunded",
  "cancelled",
] as const;

type Status = (typeof statuses)[number];

const labels: Record<Status, string> = {
  placed: "Placed",
  packing: "Packing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  return_requested: "Return requested",
  returned: "Returned",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

type OrderItem = { name?: string; slug?: string; qty?: number; price?: number };

function itemsOf(value: unknown): OrderItem[] {
  return Array.isArray(value) ? (value as OrderItem[]) : [];
}

function AdminOrders() {
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Couldn't update that order."),
  });

  const orders = data ?? [];

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!needle) return true;
      return [o.order_number, o.recipient_name, o.city, o.recipient_phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [orders, filter, q]);

  if (checked && !isAdmin) {
    return (
      <Section>
        <p className="text-center text-muted-foreground">
          This area is limited to A_S Hamper staff accounts.
        </p>
      </Section>
    );
  }

  const revenue = orders
    .filter((o) => !["cancelled", "refunded", "returned"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const countOf = (...s: Status[]) => orders.filter((o) => s.includes(o.status as Status)).length;

  return (
    <>
      <PageHeader
        eyebrow="Internal"
        title="Admin orders dashboard"
        description="View every order, move it through fulfilment, and handle returns, refunds and cancellations."
      />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Net revenue" value={inr(revenue)} />
          <Stat label="Awaiting dispatch" value={String(countOf("placed", "packing"))} />
          <Stat
            label="Returns & cancellations"
            value={String(countOf("return_requested", "returned", "refunded", "cancelled"))}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order no, recipient, city…"
            className="max-w-xs"
            aria-label="Search orders"
            maxLength={80}
          />
          <Select value={filter} onValueChange={(v) => setFilter(v as "all" | Status)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {labels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading orders…" : `${visible.length} shown`}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Recipient</th>
                <th className="p-4 font-medium">Placed</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const isOpen = openId === o.id;
                const items = itemsOf(o.items);
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-xs">{o.order_number}</td>
                      <td className="p-4">
                        {o.recipient_name}
                        <span className="block text-xs text-muted-foreground">
                          {o.city} · {o.recipient_phone ?? "no phone"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4">{inr(Number(o.total))}</td>
                      <td className="p-4">
                        <Select
                          value={o.status}
                          onValueChange={(status) => update.mutate({ id: o.id, status })}
                        >
                          <SelectTrigger className="w-[170px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {labels[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpenId(isOpen ? null : o.id)}
                          >
                            {isOpen ? "Hide" : "Details"}
                          </Button>
                          {o.status === "return_requested" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => update.mutate({ id: o.id, status: "returned" })}
                              >
                                Accept return
                              </Button>
                              <Button
                                size="sm"
                                variant="gold"
                                onClick={() => update.mutate({ id: o.id, status: "refunded" })}
                              >
                                Refund
                              </Button>
                            </>
                          )}
                          {!["cancelled", "refunded", "returned", "delivered"].includes(
                            o.status,
                          ) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => update.mutate({ id: o.id, status: "cancelled" })}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-border bg-secondary/40">
                        <td colSpan={6} className="p-6">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div>
                              <p className="eyebrow">Delivery</p>
                              <p className="mt-2 text-sm">
                                {o.address_line1}
                                <br />
                                {o.city} {o.postal_code}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {o.delivery_date ?? "No date"} · {o.delivery_slot ?? "any slot"}
                              </p>
                            </div>
                            <div>
                              <p className="eyebrow">Items</p>
                              <ul className="mt-2 space-y-1 text-sm">
                                {items.length === 0 && (
                                  <li className="text-muted-foreground">No line items stored.</li>
                                )}
                                {items.map((it, i) => (
                                  <li key={`${it.slug ?? it.name ?? "item"}-${i}`}>
                                    {it.qty ?? 1} × {it.name ?? it.slug ?? "Item"}
                                    {typeof it.price === "number" && (
                                      <span className="text-muted-foreground">
                                        {" "}
                                        · {inr(it.price)}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="eyebrow">Personalisation</p>
                              <p className="mt-2 text-sm">
                                {o.wrapping ? `Wrapping: ${o.wrapping}` : "Standard wrapping"}
                              </p>
                              {o.gift_message && (
                                <p className="mt-2 text-sm italic">“{o.gift_message}”</p>
                              )}
                              <Badge variant="secondary" className="mt-3">
                                {labels[o.status as Status] ?? o.status}
                              </Badge>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!isLoading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No orders match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
