import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact A_S Hamper — Support & Enquiries" },
      {
        name: "description",
        content:
          "Reach the A_S Hamper team for order support, bulk enquiries or help choosing a gift hamper.",
      },
      { property: "og:title", content: "Contact A_S Hamper" },
      { property: "og:description", content: "Order support and gifting help, 7 days a week." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Contact us"
        description="We reply within one working day, usually much sooner."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <form
            className="space-y-5 rounded-lg border border-border bg-card p-7"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const parsed = schema.safeParse({
                name: form.get("name"),
                email: form.get("email"),
                message: form.get("message"),
              });
              if (!parsed.success) {
                const next: Record<string, string> = {};
                for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
                setErrors(next);
                return;
              }
              setErrors({});
              e.currentTarget.reset();
              toast.success("Thanks — we'll be in touch shortly.");
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" className="mt-2" maxLength={100} />
                {errors["name"] && (
                  <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" className="mt-2" maxLength={255} />
                {errors["email"] && (
                  <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="message">How can we help?</Label>
              <Textarea id="message" name="message" rows={6} className="mt-2" maxLength={1000} />
              {errors["message"] && (
                <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
              )}
            </div>
            <Button type="submit" variant="gold">
              Send message
            </Button>
          </form>

          <aside className="space-y-5 rounded-lg border border-border bg-card p-7 text-sm">
            <p className="eyebrow">Studio</p>
            <p className="flex gap-3 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              14 Laburnum Lane, Kalyani Nagar, Pune 411006
            </p>
            <p className="flex gap-3 text-muted-foreground">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              +91 98765 43210
            </p>
            <p className="flex gap-3 text-muted-foreground">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              hello@ashamper.in
            </p>
            <p className="text-muted-foreground">Mon–Sat, 10 AM – 7 PM IST</p>
          </aside>
        </div>
      </Section>
    </>
  );
}
