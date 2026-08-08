import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string } =>
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
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: safePath(redirect ?? ""), replace: true });
  }, [user, redirect, navigate]);

  const submit = async (mode: "in" | "up", e: React.FormEvent<HTMLFormElement>) => {
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
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) setSent(true);
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in didn't complete.");
  };

  return (
    <>
      <PageHeader eyebrow="Your account" title="Sign in to A_S Hamper" />
      <Section>
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8">
          {sent ? (
            <p className="text-center text-sm text-muted-foreground">
              Check your email to confirm your account, then come back and sign in.
            </p>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={google}>
                Continue with Google
              </Button>
              <div className="my-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
                or
              </div>
              <Tabs defaultValue="in">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="in">Sign in</TabsTrigger>
                  <TabsTrigger value="up">Create account</TabsTrigger>
                </TabsList>
                {(["in", "up"] as const).map((mode) => (
                  <TabsContent key={mode} value={mode}>
                    <form className="space-y-4 pt-4" onSubmit={(e) => submit(mode, e)}>
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
      </Section>
    </>
  );
}
