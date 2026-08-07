import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useState } from "react";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search["order"] === "string" ? search["order"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Track Your Order | A_S Hamper" },
      {
        name: "description",
        content: "Enter your A_S Hamper order number to see where your gift hamper is.",
      },
      { property: "og:title", content: "Track Your Order | A_S Hamper" },
      { property: "og:description", content: "See where your gift hamper is right now." },
    ],
  }),
  component: TrackPage,
});

const stages = ["placed", "packing", "dispatched", "delivered"] as const;

function TrackPage() {
  const { order } = Route.useSearch();
  const [value, setValue] = useState(order);
  const [status, setStatus] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "missing">("idle");

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const { data } = await supabase
      .from("orders")
      .select("status")
      .eq("order_number", value.trim().toUpperCase())
      .maybeSingle();
    if (!data) {
      setStatus(null);
      setState("missing");
      return;
    }
    setStatus(data.status);
    setState("idle");
  };

  return (
    <>
      <PageHeader
        eyebrow="Order tracking"
        title="Where's my hamper?"
        description="Sign in with the account you ordered from, then enter the order number."
      />
      <Section>
        <form onSubmit={lookup} className="mx-auto max-w-md">
          <Label htmlFor="order">Order number</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="order"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="AS-1A2B3C4D"
              maxLength={20}
            />
            <Button type="submit" disabled={state === "loading" || value.trim().length < 4}>
              Track
            </Button>
          </div>

          {state === "missing" && (
            <p className="mt-4 text-sm text-destructive">
              No order found for that number on this account.
            </p>
          )}

          {status && (
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                <p className="eyebrow">Current status</p>
              </div>
              <ol className="mt-5 space-y-4">
                {stages.map((s, i) => {
                  const reached = stages.indexOf(status as typeof stages[number]) >= i;
                  return (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span
                        className={
                          reached
                            ? "size-2.5 rounded-full bg-primary"
                            : "size-2.5 rounded-full bg-border"
                        }
                      />
                      <span className={reached ? "" : "text-muted-foreground"}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </form>
      </Section>
    </>
  );
}
