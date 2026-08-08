import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Portal — Sell Hampers | A_S Hamper" },
      {
        name: "description",
        content:
          "Register your shop with A_S Hamper. Sign up with your shop number and GST number to list and manage hampers.",
      },
      { property: "og:title", content: "Vendor Portal | A_S Hamper" },
      {
        property: "og:description",
        content: "Sign up with your shop and GST number to sell hampers on A_S Hamper.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorPortal,
});

const creds = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

const shop = z.object({
  shop_name: z.string().trim().min(2, "Add your shop name").max(120),
  shop_no: z.string().trim().min(1, "Add your shop / registration number").max(40),
  gst_no: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{2}$/, "Enter a valid 15-character GST number"),
  phone: z.string().trim().max(15).optional(),
  city: z.string().trim().max(80).optional(),
});

function VendorPortal() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
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

  const register = useMutation({
    mutationFn: async (form: FormData) => {
      const parsed = shop.safeParse({
        shop_name: form.get("shop_name"),
        shop_no: form.get("shop_no"),
        gst_no: form.get("gst_no"),
        phone: form.get("phone") || undefined,
        city: form.get("city") || undefined,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase.from("vendors").insert({
        user_id: user!.id,
        shop_name: parsed.data.shop_name,
        shop_no: parsed.data.shop_no,
        gst_no: parsed.data.gst_no,
        phone: parsed.data.phone ?? null,
        city: parsed.data.city ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Shop submitted for review.");
      void queryClient.invalidateQueries({ queryKey: ["vendor"] });
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't register your shop."),
  });

  const auth = async (mode: "in" | "up", e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = creds.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (error) toast.error("Those details didn't match. Please try again.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: { emailRedirectTo: `${window.location.origin}/vendor` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) setSent(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Vendor portal"
        title="Sell your hampers with A_S Hamper"
        description="Register your shop with its shop number and GST number. Once our team approves you, list hampers and manage stock from your vendor dashboard."
      />
      <Section>
        <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-8">
          {loading || (user && vendorLoading) ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !user ? (
            sent ? (
              <p className="text-center text-sm text-muted-foreground">
                Check your email to confirm your account, then come back here to add your shop
                details.
              </p>
            ) : (
              <Tabs defaultValue="up">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="up">Create vendor account</TabsTrigger>
                  <TabsTrigger value="in">Vendor sign in</TabsTrigger>
                </TabsList>
                {(["up", "in"] as const).map((mode) => (
                  <TabsContent key={mode} value={mode}>
                    <form className="space-y-4 pt-5" onSubmit={(e) => auth(mode, e)}>
                      <div>
                        <Label htmlFor={`v-${mode}-email`}>Business email</Label>
                        <Input
                          id={`v-${mode}-email`}
                          name="email"
                          type="email"
                          className="mt-2"
                          maxLength={255}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`v-${mode}-password`}>Password</Label>
                        <Input
                          id={`v-${mode}-password`}
                          name="password"
                          type="password"
                          className="mt-2"
                          maxLength={72}
                        />
                      </div>
                      <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                        {mode === "up" ? "Continue" : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>
                ))}
              </Tabs>
            )
          ) : vendor ? (
            <div className="space-y-4 text-center">
              <Store className="mx-auto size-8 text-primary" />
              <h2 className="font-display text-2xl">{vendor.shop_name}</h2>
              <p className="text-sm text-muted-foreground">
                Shop no {vendor.shop_no} · GST {vendor.gst_no}
              </p>
              <p className="text-sm">
                Status: <span className="font-medium">{vendor.status}</span>
              </p>
              <Button asChild variant="gold">
                <Link to="/vendor-dashboard">Open vendor dashboard</Link>
              </Button>
            </div>
          ) : (
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                register.mutate(new FormData(e.currentTarget));
              }}
            >
              <div className="sm:col-span-2">
                <Label htmlFor="shop_name">Shop name</Label>
                <Input id="shop_name" name="shop_name" className="mt-2" maxLength={120} />
              </div>
              <div>
                <Label htmlFor="shop_no">Shop number</Label>
                <Input id="shop_no" name="shop_no" className="mt-2" maxLength={40} />
              </div>
              <div>
                <Label htmlFor="gst_no">GST number</Label>
                <Input
                  id="gst_no"
                  name="gst_no"
                  className="mt-2 uppercase"
                  maxLength={15}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div>
                <Label htmlFor="v-phone">Phone</Label>
                <Input id="v-phone" name="phone" className="mt-2" maxLength={15} />
              </div>
              <div>
                <Label htmlFor="v-city">City</Label>
                <Input id="v-city" name="city" className="mt-2" maxLength={80} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="gold" disabled={register.isPending}>
                  Submit shop for review
                </Button>
              </div>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
