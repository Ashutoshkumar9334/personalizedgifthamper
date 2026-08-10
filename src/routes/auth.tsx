import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock, Mail, Package, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},

  head: () => ({
    meta: [
      { title: "Sign In or Create an Account | A_S Hamper" },
      {
        name: "description",
        content: "Sign in to track hamper orders, save your wishlist and reorder favourites.",
      },
      { property: "og:title", content: "Sign In | A_S Hamper" },
      { property: "og:description", content: "Track orders and save your wishlist." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const creds = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function safePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

type Portal = "user" | "admin";
type Mode = "up" | "in";

const benefits: Record<Portal, { title: string; items: [string, string][] }> = {
  user: {
    title: "User account benefits",
    items: [
      ["Track your orders", "See the current status of your hamper deliveries."],
      ["Save your details", "Keep your account information ready for future purchases."],
      ["Faster checkout", "Use your account to make shopping simpler."],
      ["Exclusive offers", "Get access to new collections and special deals."],
    ],
  },
  admin: {
    title: "Admin product controls",
    items: [
      ["Add products", "Create hampers with categories, images, prices and stock."],
      ["Edit inventory", "Update product details and availability whenever needed."],
      ["Remove products", "Remove items that are no longer available."],
      ["Manage orders", "Review orders and update their delivery status."],
    ],
  },
};

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal>("user");
  const [mode, setMode] = useState<Mode>("in");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (redirect) {
      navigate({ to: safePath(redirect), replace: true });
      return;
    }
    if (!checked) return;
    navigate({ to: isAdmin ? "/admin/dashboard" : "/account", replace: true });
  }, [user, redirect, checked, isAdmin, navigate]);

  const run = async (e: React.FormEvent<HTMLFormElement>) => {
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
    const fullName = String(form.get("full_name") ?? "").trim().slice(0, 120);
    const { error } = await supabase.auth.signUp({
      ...parsed.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: fullName ? { full_name: fullName } : {},
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. You're signed in.");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in didn't complete.");
  };

  const isAdminPortal = portal === "admin";
  const copy = benefits[portal];

  return (
    <>
      <PageHeader
        eyebrow="Account portal"
        title="Sign in to continue"
        description="Sign in or create a customer account, or use the separate admin login."
      />
      <Section>
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        <div className="mb-8 inline-flex rounded-full bg-secondary p-1">
          {(["user", "admin"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPortal(p)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors ${
                portal === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "user" ? (
                <UserRound className="size-4" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {p === "user" ? "Customer account" : "Admin access"}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {isAdminPortal ? (
                  <ShieldCheck className="size-5" />
                ) : (
                  <UserRound className="size-5" />
                )}
              </span>
              <div>
                <h2 className="font-display text-2xl">
                  {isAdminPortal ? "Admin account" : "Customer account"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminPortal
                    ? "Secure access for your store administrators"
                    : mode === "in"
                      ? "Welcome back, customer"
                      : "Create an account to track orders"}
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

            <form className="mt-6 space-y-5" onSubmit={run}>
              {mode === "up" && (
                <div>
                  <Label htmlFor="full_name" className="eyebrow flex items-center gap-2">
                    <UserRound className="size-4" /> Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    className="mt-2"
                    placeholder="Your name"
                    maxLength={120}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="auth-email" className="eyebrow flex items-center gap-2">
                  <Mail className="size-4" /> Email
                </Label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2"
                  maxLength={255}
                />
              </div>
              <div>
                <Label htmlFor="auth-password" className="eyebrow flex items-center gap-2">
                  <Lock className="size-4" /> Password
                </Label>
                <Input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                  className="mt-2"
                  maxLength={72}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {mode === "in"
                  ? "Sign in"
                  : isAdminPortal
                    ? "Create admin account"
                    : "Create account"}
                <ArrowRight />
              </Button>
            </form>

            {!isAdminPortal && (
              <>
                <div className="my-6 flex items-center gap-4 text-xs tracking-widest text-muted-foreground uppercase">
                  <span className="h-px flex-1 bg-border" />
                  Or continue with
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button variant="outline" className="w-full" size="lg" onClick={google}>
                  Google
                </Button>
              </>
            )}

            {isAdminPortal && (
              <p className="mt-6 text-xs text-muted-foreground">
                New admin accounts need staff access granted before the dashboard unlocks.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-8">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              {isAdminPortal ? <Package className="size-5" /> : <UserRound className="size-5" />}
            </span>
            <h2 className="mt-6 font-display text-2xl">{copy.title}</h2>
            <ol className="mt-6 space-y-5">
              {copy.items.map(([title, description], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-lg">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </>
  );
}
