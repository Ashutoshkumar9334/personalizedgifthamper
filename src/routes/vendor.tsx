import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  FileText,
  Hash,
  Lock,
  Mail,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Portal — Sell Hampers | A_S Hamper" },
      {
        name: "description",
        content:
          "Create your A_S Hamper vendor account with your email, phone, shop number and GST number to list and manage hampers.",
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

const signupSchema = z.object({
  shop_name: z.string().trim().min(2, "Add your business name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  shop_no: z.string().trim().min(1, "Add your shop number").max(40),
  gst_no: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{2}$/, "Enter a valid 15-character GST number"),
  phone: z.string().trim().min(6, "Add a contact phone number").max(15),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

const perks = [
  "Reach gifting customers across India",
  "List products and manage your stock",
  "Receive orders in one dashboard",
  "GST-ready business details and payouts",
];

function VendorPortal() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"up" | "in">("up");
  const [busy, setBusy] = useState(false);

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

  const saveShop = async (
    userId: string,
    values: { shop_name: string; shop_no: string; gst_no: string; phone: string },
  ) => {
    const { error } = await supabase.from("vendors").insert({
      user_id: userId,
      shop_name: values.shop_name,
      shop_no: values.shop_no,
      gst_no: values.gst_no,
      phone: values.phone,
    });
    if (error) throw error;
    void queryClient.invalidateQueries({ queryKey: ["vendor"] });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (mode === "in") {
      const parsed = loginSchema.safeParse({
        email: form.get("email"),
        password: form.get("password"),
      });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]!.message);
        return;
      }
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (error) toast.error("Those details didn't match. Please try again.");
      return;
    }

    const parsed = signupSchema.safeParse({
      shop_name: form.get("shop_name"),
      email: form.get("email"),
      password: form.get("password"),
      shop_no: form.get("shop_no"),
      gst_no: form.get("gst_no"),
      phone: form.get("phone"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setBusy(true);
    try {
      let userId = user?.id ?? null;
      if (!userId) {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/vendor`,
            data: { full_name: parsed.data.shop_name, phone: parsed.data.phone },
          },
        });
        if (error) throw new Error(error.message);
        userId = data.user?.id ?? null;
      }
      if (!userId) throw new Error("Couldn't create your vendor account.");
      await saveShop(userId, parsed.data);
      toast.success("Vendor account created. Your shop is under review.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create your vendor account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Partner with A_S Hamper"
        title="Vendor Zone"
        description="Create your vendor account and start selling memorable gift hampers."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-primary p-10 text-primary-foreground">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Store className="size-5" />
            </span>
            <h2 className="mt-8 font-display text-3xl">Grow your gifting business with us</h2>
            <p className="mt-4 text-primary-foreground/80">
              Sign up with your business information. Your vendor profile uses your email, phone
              number, shop number and GST number.
            </p>
            <ul className="mt-8 space-y-4">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-8">
            {loading || (user && vendorLoading) ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : vendor ? (
              <div className="space-y-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Store className="size-5" />
                </span>
                <h2 className="font-display text-2xl">{vendor.shop_name}</h2>
                <p className="text-sm text-muted-foreground">
                  Shop no {vendor.shop_no} · GST {vendor.gst_no}
                </p>
                <p className="text-sm">
                  Status: <span className="font-medium">{vendor.status}</span>
                </p>
                <Button asChild>
                  <Link to="/vendor-dashboard">
                    Open vendor dashboard <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Store className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl">Vendor portal</h2>
                    <p className="text-sm text-muted-foreground">
                      {mode === "up"
                        ? "Open a shop and start selling hampers"
                        : "Welcome back, vendor"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
                  {(["up", "in"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-full px-4 py-2.5 text-sm transition-colors ${
                        mode === m
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "up" ? "Sign Up" : "Log In"}
                    </button>
                  ))}
                </div>

                <form className="mt-6 space-y-5" onSubmit={submit}>
                  {mode === "up" && (
                    <div>
                      <Label htmlFor="shop_name" className="eyebrow flex items-center gap-2">
                        <UserRound className="size-4" /> Business name
                      </Label>
                      <Input
                        id="shop_name"
                        name="shop_name"
                        className="mt-2"
                        placeholder="A_S Hamper Co."
                        maxLength={120}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="v-email" className="eyebrow flex items-center gap-2">
                      <Mail className="size-4" /> Email
                    </Label>
                    <Input
                      id="v-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="mt-2"
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-password" className="eyebrow flex items-center gap-2">
                      <Lock className="size-4" /> Password
                    </Label>
                    <Input
                      id="v-password"
                      name="password"
                      type="password"
                      autoComplete={mode === "in" ? "current-password" : "new-password"}
                      className="mt-2"
                      maxLength={72}
                    />
                  </div>
                  {mode === "up" && (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="shop_no" className="eyebrow flex items-center gap-2">
                            <Hash className="size-4" /> Shop no.
                          </Label>
                          <Input
                            id="shop_no"
                            name="shop_no"
                            className="mt-2"
                            placeholder="SHOP-0142"
                            maxLength={40}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gst_no" className="eyebrow flex items-center gap-2">
                            <FileText className="size-4" /> GST no.
                          </Label>
                          <Input
                            id="gst_no"
                            name="gst_no"
                            className="mt-2 uppercase"
                            placeholder="29ABCDE1234F1Z5"
                            maxLength={15}
                          />
                        </div>
                      </div>
                      <div className="sm:w-1/2">
                        <Label htmlFor="v-phone" className="eyebrow flex items-center gap-2">
                          <Phone className="size-4" /> Phone
                        </Label>
                        <Input
                          id="v-phone"
                          name="phone"
                          className="mt-2"
                          placeholder="+91 98765 43210"
                          maxLength={15}
                        />
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full" size="lg" disabled={busy}>
                    {mode === "up" ? "Create vendor account" : "Sign in"}
                    <ArrowRight />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
