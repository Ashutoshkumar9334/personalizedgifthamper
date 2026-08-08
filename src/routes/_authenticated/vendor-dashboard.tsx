import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/site/Layout";
import { ProductForm, emptyProduct, type ProductDraft } from "@/components/site/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/vendor-dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard | A_S Hamper" },
      { name: "description", content: "Manage your shop's hamper listings and stock." },
      { property: "og:title", content: "Vendor Dashboard | A_S Hamper" },
      { property: "og:description", content: "Manage your hamper listings and stock." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VendorDashboard,
});

function VendorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ProductDraft | null>(null);

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, shop_name, shop_no, gst_no, status")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["vendor-products", vendor?.id],
    enabled: Boolean(vendor?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, category, price, compare_at, image_url, blurb, contents, stock, is_active",
        )
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (draft: ProductDraft) => {
      const row = {
        name: draft.name,
        slug: draft.slug,
        category: draft.category,
        price: draft.price,
        compare_at: draft.compare_at,
        image_url: draft.image_url || null,
        blurb: draft.blurb || null,
        contents: draft.contents,
        stock: draft.stock,
        is_active: draft.is_active,
        vendor_id: vendor!.id,
      };
      const { error } = draft.id
        ? await supabase.from("products").update(row).eq("id", draft.id)
        : await supabase.from("products").insert({ ...row, created_by: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing saved.");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
    onError: () => toast.error("Couldn't save that listing."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing removed.");
      void queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
    onError: () => toast.error("Couldn't remove that listing."),
  });

  if (isLoading) {
    return (
      <Section>
        <p className="text-muted-foreground">Loading your shop…</p>
      </Section>
    );
  }

  if (!vendor) {
    return (
      <Section>
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">You don't have a vendor shop yet.</p>
          <Button asChild variant="gold" className="mt-5">
            <Link to="/vendor">Register your shop</Link>
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title={vendor.shop_name}
        description={`Shop no ${vendor.shop_no} · GST ${vendor.gst_no}`}
      />
      <Section>
        {vendor.status !== "approved" ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Badge variant="secondary">{vendor.status}</Badge>
            <p className="mt-4 text-sm text-muted-foreground">
              Our team is reviewing your shop details. You'll be able to add listings as soon as
              you're approved.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="rounded-lg border border-border bg-card p-7">
              <h2 className="font-display text-2xl">
                {editing?.id ? "Edit listing" : "Add a listing"}
              </h2>
              <div className="mt-6">
                <ProductForm
                  key={editing?.id ?? "new"}
                  value={editing ?? emptyProduct}
                  saving={save.isPending}
                  onSubmit={(draft) => save.mutate(draft)}
                  {...(editing?.id ? { onCancel: () => setEditing(null) } : {})}
                />
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl">Your listings</h2>
              <ul className="mt-5 space-y-3">
                {(products ?? []).map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.category} · {inr(Number(p.price))} · stock {p.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={p.is_active ? "gold" : "secondary"}>
                        {p.is_active ? "Published" : "Hidden"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            category: p.category,
                            price: Number(p.price),
                            compare_at: p.compare_at === null ? null : Number(p.compare_at),
                            image_url: p.image_url,
                            blurb: p.blurb,
                            contents: p.contents ?? [],
                            stock: p.stock,
                            is_active: p.is_active,
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
                {(products ?? []).length === 0 && (
                  <li className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No listings yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
