import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/site/Layout";
import { ProductForm, emptyProduct, type ProductDraft } from "@/components/site/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Product Manager | A_S Hamper Admin" },
      { name: "description", content: "Add, edit and remove hampers, and approve vendor shops." },
      { property: "og:title", content: "Product Manager | A_S Hamper Admin" },
      { property: "og:description", content: "Add, edit and remove hampers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ProductDraft | null>(null);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, category, price, compare_at, image_url, blurb, contents, stock, is_active, vendor_id",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["admin-vendors"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, shop_name, shop_no, gst_no, city, status, created_at")
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
      };
      const { error } = draft.id
        ? await supabase.from("products").update(row).eq("id", draft.id)
        : await supabase.from("products").insert({ ...row, created_by: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product saved.");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("Couldn't save that product."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product removed.");
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("Couldn't remove that product."),
  });

  const setVendorStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("vendors").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vendor updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    },
    onError: () => toast.error("Couldn't update that vendor."),
  });

  if (checked && !isAdmin) {
    return (
      <Section>
        <p className="text-center text-muted-foreground">
          This area is limited to A_S Hamper staff accounts.
        </p>
      </Section>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Internal" title="Product manager" />
      <Section>
        <div className="mb-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/dashboard">Orders dashboard</Link>
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products ({products?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="vendors">Vendors ({vendors?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-10 pt-8">
            <div className="rounded-lg border border-border bg-card p-7">
              <h2 className="font-display text-2xl">
                {editing?.id ? "Edit product" : "Add a product"}
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

            <ul className="space-y-3">
              {(products ?? []).map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.category} · {inr(Number(p.price))} · stock {p.stock}
                      {p.vendor_id ? " · vendor listing" : ""}
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
                  No products added yet.
                </li>
              )}
            </ul>
          </TabsContent>

          <TabsContent value="vendors" className="pt-8">
            <ul className="space-y-3">
              {(vendors ?? []).map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"
                >
                  <div>
                    <p className="font-medium">{v.shop_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shop no {v.shop_no} · GST {v.gst_no}
                      {v.city ? ` · ${v.city}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={v.status === "approved" ? "gold" : "secondary"}>
                      {v.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setVendorStatus.mutate({ id: v.id, status: "approved" })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setVendorStatus.mutate({ id: v.id, status: "suspended" })}
                    >
                      Suspend
                    </Button>
                  </div>
                </li>
              ))}
              {(vendors ?? []).length === 0 && (
                <li className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  No vendor applications yet.
                </li>
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
