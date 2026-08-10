import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/site/Layout";
import { ProductForm, emptyProduct, type ProductDraft } from "@/components/site/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, category, price, compare_at, image_url, blurb, contents, tags, stock, is_active, vendor_id",
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
        tags: draft.tags ?? [],
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
      setOpen(false);
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
      <PageHeader
        eyebrow="Internal"
        title="Product manager"
        description="Add, edit, remove and manage all products from one place."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl bg-primary p-8 text-primary-foreground">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="mt-6 font-display text-2xl">Admin access</h2>
            <p className="mt-3 text-sm text-primary-foreground/80">
              Use the dashboard to manage products, stock and customer orders.
            </p>
            <Button asChild variant="outline" className="mt-6 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/admin/dashboard">Orders dashboard</Link>
            </Button>
          </aside>

          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ShoppingBag className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl">Admin dashboard</h2>
                  <p className="text-sm text-muted-foreground">Admin · manage products &amp; orders</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/dashboard">Orders</Link>
              </Button>
            </div>

            <div className="p-6">
              <Tabs defaultValue="products">
                <TabsList>
                  <TabsTrigger value="products">Products ({products?.length ?? 0})</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors ({vendors?.length ?? 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="pt-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display text-2xl">Products ({products?.length ?? 0})</h3>
                    <Button
                      onClick={() => {
                        setEditing(null);
                        setOpen(true);
                      }}
                    >
                      <Plus /> Add product
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {(products ?? []).map((p) => (
                      <div
                        key={p.id}
                        className="overflow-hidden rounded-lg border border-border bg-background"
                      >
                        <img
                          src={p.image_url || "/placeholder.svg"}
                          alt={p.name}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-display text-lg leading-tight">{p.name}</p>
                            <span className="shrink-0 text-sm">{inr(Number(p.price))}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {p.category} · {p.stock} in stock
                            {p.vendor_id ? " · vendor" : ""}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={p.is_active ? "gold" : "secondary"}>
                              {p.is_active ? "Published" : "Hidden"}
                            </Badge>
                            {(p.tags ?? []).includes("offer") && (
                              <Badge variant="secondary">In offers</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditing({
                                  id: p.id,
                                  name: p.name,
                                  slug: p.slug,
                                  category: p.category,
                                  price: Number(p.price),
                                  compare_at:
                                    p.compare_at === null ? null : Number(p.compare_at),
                                  image_url: p.image_url,
                                  blurb: p.blurb,
                                  contents: p.contents ?? [],
                                  tags: p.tags ?? [],
                                  stock: p.stock,
                                  is_active: p.is_active,
                                });
                                setOpen(true);
                              }}
                            >
                              <Pencil /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => remove.mutate(p.id)}
                            >
                              <Trash2 /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(products ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No products added yet.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="vendors" className="pt-8">
                  <ul className="space-y-3">
                    {(vendors ?? []).map((v) => (
                      <li
                        key={v.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-5"
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
                      <li className="text-sm text-muted-foreground">No vendor applications yet.</li>
                    )}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editing?.id ? "Edit product" : "Add product"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              key={editing?.id ?? "new"}
              value={editing ?? emptyProduct}
              saving={save.isPending}
              onSubmit={(draft) => save.mutate(draft)}
              onCancel={() => {
                setOpen(false);
                setEditing(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </Section>
    </>
  );
}
