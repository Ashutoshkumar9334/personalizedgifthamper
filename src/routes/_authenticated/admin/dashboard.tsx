import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/site/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | A_S Hamper" },
      { name: "description", content: "Internal order management for the A_S Hamper team." },
      { property: "og:title", content: "Admin Dashboard | A_S Hamper" },
      { property: "og:description", content: "Internal order management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const statuses = ["placed", "packing", "dispatched", "delivered", "cancelled"] as const;

function AdminDashboard() {
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, recipient_name, city, created_at")
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
      toast.success("Status updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Couldn't update that order."),
  });

  if (isAdmin === false) {
    return (
      <Section>
        <p className="text-center text-muted-foreground">
          This area is limited to A_S Hamper staff accounts.
        </p>
      </Section>
    );
  }

  const revenue = (data ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <>
      <PageHeader eyebrow="Internal" title="Admin dashboard" />
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Orders" value={String(data?.length ?? 0)} />
          <Stat label="Revenue" value={inr(revenue)} />
          <Stat
            label="Awaiting dispatch"
            value={String(
              (data ?? []).filter((o) => o.status === "placed" || o.status === "packing").length,
            )}
          />
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Recipient</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{o.order_number}</td>
                  <td className="p-4">
                    {o.recipient_name}
                    <span className="block text-xs text-muted-foreground">{o.city}</span>
                  </td>
                  <td className="p-4">{inr(Number(o.total))}</td>
                  <td className="p-4">
                    <Select
                      value={o.status}
                      onValueChange={(status) => update.mutate({ id: o.id, status })}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
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
