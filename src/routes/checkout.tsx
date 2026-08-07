import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { deliverySlots, inr, wrappingOptions } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | A_S Hamper" },
      {
        name: "description",
        content: "Enter delivery details, pick a date and slot, add a gift message and place your order.",
      },
      { property: "og:title", content: "Checkout | A_S Hamper" },
      { property: "og:description", content: "Delivery details and gift message." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  recipient_name: z.string().trim().min(2, "Recipient name is required").max(120),
  recipient_phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  address_line1: z.string().trim().min(6, "Address is required").max(240),
  city: z.string().trim().min(2, "City is required").max(80),
  postal_code: z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit PIN code"),
  gift_message: z.string().trim().max(300).optional(),
});

function Checkout() {
  const { cart, subtotal, clearCart } = useStore();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState(deliverySlots[0]!);
  const [wrapping, setWrapping] = useState(wrappingOptions[0]!.name);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const shipping = subtotal > 2499 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  if (!loading && !user) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Sign in to continue" />
        <Section>
          <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
            <Lock className="mx-auto size-6 text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              We keep your orders and addresses in your account so you can reorder and track
              deliveries.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/auth" search={{ redirect: "/checkout" }}>
                Sign in or create an account
              </Link>
            </Button>
          </div>
        </Section>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      recipient_name: form.get("recipient_name"),
      recipient_phone: form.get("recipient_phone"),
      address_line1: form.get("address_line1"),
      city: form.get("city"),
      postal_code: form.get("postal_code"),
      gift_message: form.get("gift_message") || undefined,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        ...parsed.data,
        gift_message: parsed.data.gift_message ?? null,
        delivery_date: date ? format(date, "yyyy-MM-dd") : null,

        delivery_slot: slot,
        wrapping,
        items: cart.map((l) => ({
          slug: l.slug,
          name: l.name,
          qty: l.qty,
          price: l.price,
          custom: l.custom ?? null,
        })),
        subtotal,
        total,
      })
      .select("order_number")
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error("We couldn't place your order. Please try again.");
      return;
    }
    clearCart();
    navigate({ to: "/order-success", search: { order: data.order_number } });
  };

  return (
    <>
      <PageHeader eyebrow="Final step" title="Checkout" />
      <Section>
        <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <fieldset className="rounded-lg border border-border bg-card p-7">
              <legend className="eyebrow px-2">Delivery address</legend>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field
                  name="recipient_name"
                  label="Recipient name"
                  error={errors["recipient_name"]}
                />
                <Field
                  name="recipient_phone"
                  label="Recipient phone"
                  error={errors["recipient_phone"]}
                />
                <div className="sm:col-span-2">
                  <Field
                    name="address_line1"
                    label="Address"
                    error={errors["address_line1"]}
                  />
                </div>
                <Field name="city" label="City" error={errors["city"]} />
                <Field name="postal_code" label="PIN code" error={errors["postal_code"]} />
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-border bg-card p-7">
              <legend className="eyebrow px-2">Delivery date & wrapping</legend>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "mt-2 w-full justify-start font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon />
                        {date ? format(date, "PP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("pointer-events-auto p-3")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Time slot</Label>
                  <Select value={slot} onValueChange={setSlot}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deliverySlots.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Wrapping</Label>
                  <Select value={wrapping} onValueChange={setWrapping}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {wrappingOptions.map((w) => (
                        <SelectItem key={w.id} value={w.name}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-5">
                <Label htmlFor="gift_message">Gift message (optional)</Label>
                <Textarea
                  id="gift_message"
                  name="gift_message"
                  rows={3}
                  maxLength={300}
                  className="mt-2"
                  placeholder="Written by hand on our cotton card."
                />
              </div>
            </fieldset>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6">
            <p className="eyebrow">Your order</p>
            <ul className="mt-4 space-y-3 text-sm">
              {cart.map((l) => (
                <li key={l.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {l.name} × {l.qty}
                  </span>
                  <span>{inr(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-5" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{inr(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <dt>Total</dt>
                <dd className="font-display text-xl">{inr(total)}</dd>
              </div>
            </dl>
            <Button
              type="submit"
              size="lg"
              variant="gold"
              className="mt-6 w-full"
              disabled={saving || cart.length === 0}
            >
              {saving ? "Placing order…" : "Place order"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cash on delivery and UPI on dispatch. No card details stored.
            </p>
          </aside>
        </form>
      </Section>
    </>
  );
}

function Field({
  name,
  label,
  error,
}: {
  name: string;
  label: string;
  error?: string | undefined;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="mt-2" aria-invalid={Boolean(error)} />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
