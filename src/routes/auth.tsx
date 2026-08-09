import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminSent, setAdminSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (redirect) {
      navigate({ to: safePath(redirect), replace: true });
      return;
    }
    if (!checked) return;
    navigate({ to: isAdmin ? "/admin/dashboard" : "/account", replace: true });
  }, [user, redirect, checked, isAdmin, navigate]);

  const run = async (
    mode: "in" | "up",
    e: React.FormEvent<HTMLFormElement>,
    kind: "user" | "admin",
  ) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = creds.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    const setLoading = kind === "admin" ? setAdminBusy : setBusy;
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setLoading(false);
      if (error) toast.error("Those details didn't match. Please try again.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: {
        emailRedirectTo:
          kind === "admin" ? `${window.location.origin}/admin/dashboard` : window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      if (kind === "admin") setAdminSent(true);
      else setSent(true);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in didn't complete.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Sign in to A_S Hamper"
        description="Customers sign in on the left. Staff can reach the admin orders dashboard on the right."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex items-center gap-3">
              <UserRound className="size-5 text-primary" />
              <h2 className="font-display text-2xl">Customer account</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Track orders, save a wishlist and reorder favourites.
            </p>
            {sent ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Check your email to confirm your account, then come back and sign in.
              </p>
            ) : (
              <>
                <Button variant="outline" className="mt-6 w-full" onClick={google}>
                  Continue with Google
                </Button>
                <div className="my-5 text-center text-xs tracking-widest uppercase text-muted-foreground">
                  or
                </div>
                <Tabs defaultValue="in">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="in">Sign in</TabsTrigger>
                    <TabsTrigger value="up">Create account</TabsTrigger>
                  </TabsList>
                  {(["in", "up"] as const).map((mode) => (
                    <TabsContent key={mode} value={mode}>
                      <form className="space-y-4 pt-4" onSubmit={(e) => run(mode, e, "user")}>
                        <div>
                          <Label htmlFor={`${mode}-email`}>Email</Label>
                          <Input
                            id={`${mode}-email`}
                            name="email"
                            type="email"
                            className="mt-2"
                            maxLength={255}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${mode}-password`}>Password</Label>
                          <Input
                            id={`${mode}-password`}
                            name="password"
                            type="password"
                            className="mt-2"
                            maxLength={72}
                          />
                        </div>
                        <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                          {mode === "in" ? "Sign in" : "Create account"}
                        </Button>
                      </form>
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            )}
          </div>

          <div className="rounded-lg border border-border bg-secondary/40 p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="font-display text-2xl">Admin orders dashboard</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Staff sign-in for order management, returns and cancellations. New admin accounts need
              staff access granted before the dashboard unlocks.
            </p>
            {adminSent ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Confirm your email, then sign in here to reach the dashboard.
              </p>
            ) : (
              <Tabs defaultValue="in" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="in">Admin sign in</TabsTrigger>
                  <TabsTrigger value="up">Create admin account</TabsTrigger>
                </TabsList>
                {(["in", "up"] as const).map((mode) => (
                  <TabsContent key={mode} value={mode}>
                    <form className="space-y-4 pt-4" onSubmit={(e) => run(mode, e, "admin")}>
                      <div>
                        <Label htmlFor={`a-${mode}-email`}>Work email</Label>
                        <Input
                          id={`a-${mode}-email`}
                          name="email"
                          type="email"
                          className="mt-2"
                          maxLength={255}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`a-${mode}-password`}>Password</Label>
                        <Input
                          id={`a-${mode}-password`}
                          name="password"
                          type="password"
                          className="mt-2"
                          maxLength={72}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={adminBusy}>
                        {mode === "in" ? "Sign in to dashboard" : "Create admin account"}
                      </Button>
                    </form>
                  </TabsContent>
                ))}
              </Tabs>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              Selling with us instead?{" "}
              <Link to="/vendor" className="underline">
                Go to the vendor zone
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
