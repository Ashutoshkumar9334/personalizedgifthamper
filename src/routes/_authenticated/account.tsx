import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Package, ShieldCheck, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { useAuth, useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account | A_S Hamper" },
      { name: "description", content: "Manage your A_S Hamper profile and contact details." },
      { property: "og:title", content: "My Account | A_S Hamper" },
      { property: "og:description", content: "Manage your profile and contact details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

const profileSchema = z.object({
  full_name: z.string().trim().max(120),
  phone: z
    .string()
    .trim()
    .max(15)
    .refine((v) => v === "" || /^[0-9+\-\s]{6,15}$/.test(v), "Enter a valid phone number"),
});

function Account() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);
  const { wishlist } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, created_at")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["account-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });




  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = profileSchema.safeParse({ full_name: fullName, phone });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: parsed.data.full_name, phone: parsed.data.phone })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save changes."),
  });

  const initials =
    (profile?.full_name ?? user?.email ?? "?")
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?";

  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-7 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary font-display text-2xl text-primary-foreground">
                {initials}
              </div>
              <p className="mt-4 font-display text-xl">{profile?.full_name || "Welcome back"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isAdmin && <Badge variant="gold">Staff</Badge>}
                {vendor && <Badge variant="secondary">Vendor · {vendor.status}</Badge>}
                {profile?.created_at && (
                  <Badge variant="secondary">
                    Since {new Date(profile.created_at).getFullYear()}
                  </Badge>
                )}
              </div>
            </div>

            <nav className="grid gap-2">
              <AccountLink to="/orders" icon={Package} label="My orders" />
              <AccountLink
                to="/wishlist"
                icon={Heart}
                label={`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`}
              />
              <AccountLink
                to={vendor ? "/vendor-dashboard" : "/vendor"}
                icon={Store}
                label={vendor ? "Vendor dashboard" : "Become a vendor"}
              />
              {isAdmin && (
                <>
                  <AccountLink to="/admin/dashboard" icon={ShieldCheck} label="Admin orders" />
                  <AccountLink to="/admin/products" icon={ShieldCheck} label="Admin products" />
                </>
              )}
              <Button
                variant="ghost"
                className="justify-start"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/", replace: true });
                }}
              >
                <LogOut /> Sign out
              </Button>
            </nav>
          </aside>

          <div className="space-y-8">
            <div className="rounded-lg border border-border bg-card p-7">
              <h2 className="font-display text-2xl">Personal details</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2"
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2"
                    maxLength={15}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email ?? ""} className="mt-2" disabled />
                </div>
              </div>
              <Button
                variant="gold"
                className="mt-6"
                onClick={() => save.mutate()}
                disabled={save.isPending}
              >
                Save changes
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl">Recent orders</h2>
                <Button asChild variant="outline" size="sm">
                  <Link to="/orders">View all</Link>
                </Button>
              </div>
              <ul className="mt-5 space-y-3">
                {(orders ?? []).map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4"
                  >
                    <div>
                      <p className="font-mono text-sm">{o.order_number}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{o.status}</Badge>
                      <span className="font-display text-lg">{inr(Number(o.total))}</span>
                    </div>
                  </li>
                ))}
                {(orders ?? []).length === 0 && (
                  <li className="text-sm text-muted-foreground">No orders yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function AccountLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Package;
  label: string;
}) {
  return (
    <Button asChild variant="ghost" className="justify-start">
      <Link to={to}>
        <Icon /> {label}
      </Link>
    </Button>
  );
}
