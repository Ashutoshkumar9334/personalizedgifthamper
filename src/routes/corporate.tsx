import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import catCorporate from "@/assets/cat-corporate.jpg";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Gift Hampers & Bulk Orders | A_S Hamper" },
      {
        name: "description",
        content:
          "Branded corporate gift hampers from 25 units — custom ribbons, GST invoicing and dispatch to multiple addresses. Request a quote.",
      },
      { property: "og:title", content: "Corporate Gifting | A_S Hamper" },
      {
        property: "og:description",
        content: "Branded bulk hampers with GST invoicing and multi-address dispatch.",
      },
    ],
  }),
  component: Corporate,
});

const schema = z.object({
  company: z.string().trim().min(2, "Company name is required").max(120),
  email: z.string().trim().email("Enter a valid work email").max(255),
  quantity: z.coerce.number().int().min(25, "Minimum bulk order is 25 units").max(100000),
  brief: z.string().trim().min(10, "Tell us about the occasion").max(1000),
});

function Corporate() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader
        eyebrow="Corporate gifting"
        title="Bulk hampers, your branding"
        description="Diwali gifting, onboarding kits, client thank-yous. From 25 units."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <img
              src={catCorporate}
              alt="Navy corporate gift hamper with branded ribbon"
              loading="lazy"
              width={800}
              height={800}
              className="rounded-lg object-cover"
            />
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              <li>· Custom-printed satin ribbon and belly bands with your logo</li>
              <li>· Dispatch to up to 500 individual addresses from one order</li>
              <li>· GST invoicing and 30-day payment terms for registered companies</li>
              <li>· Sample hamper shipped before you confirm the full run</li>
            </ul>
          </div>

          <form
            className="h-fit space-y-5 rounded-lg border border-border bg-card p-7"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const parsed = schema.safeParse({
                company: form.get("company"),
                email: form.get("email"),
                quantity: form.get("quantity"),
                brief: form.get("brief"),
              });
              if (!parsed.success) {
                const next: Record<string, string> = {};
                for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
                setErrors(next);
                return;
              }
              setErrors({});
              e.currentTarget.reset();
              toast.success("Quote request received — we'll reply within one working day.");
            }}
          >
            <p className="eyebrow">Request a quote</p>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" className="mt-2" maxLength={120} />
              {errors["company"] && (
                <p className="mt-1 text-xs text-destructive">{errors["company"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" className="mt-2" maxLength={255} />
              {errors["email"] && (
                <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="quantity">Approximate quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={25}
                className="mt-2"
                placeholder="60"
              />
              {errors["quantity"] && (
                <p className="mt-1 text-xs text-destructive">{errors["quantity"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="brief">Occasion & budget</Label>
              <Textarea id="brief" name="brief" rows={5} className="mt-2" maxLength={1000} />
              {errors["brief"] && (
                <p className="mt-1 text-xs text-destructive">{errors["brief"]}</p>
              )}
            </div>
            <Button type="submit" variant="gold" className="w-full">
              Request a quote
            </Button>
          </form>
        </div>
      </Section>
    </>
  );
}
