import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PanelCard } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer/addresses")({
  head: () => ({
    meta: [
      { title: "Saved Addresses | A_S Hamper" },
      { name: "description", content: "Save delivery addresses for a faster hamper checkout." },
      { property: "og:title", content: "Saved Addresses | A_S Hamper" },
      { property: "og:description", content: "Save delivery addresses for faster checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerAddresses,
});

const schema = z.object({
  label: z.string().trim().min(2, "Name this address").max(40),
  recipient_name: z.string().trim().min(2, "Add a recipient name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,15}$/, "Enter a valid phone number"),
  address_line1: z.string().trim().min(5, "Add the street address").max(200),
  city: z.string().trim().min(2, "Add a city").max(80),
  postal_code: z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit PIN code"),
});

const blank = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address_line1: "",
  city: "",
  postal_code: "",
};

function CustomerAddresses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blank);
  const [adding, setAdding] = useState(false);

  const { data } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase
        .from("addresses")
        .insert({ ...parsed.data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Address saved.");
      setForm(blank);
      setAdding(false);
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save that address."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Address removed.");
      void invalidate();
    },
    onError: () => toast.error("Couldn't remove that address."),
  });

  const makeDefault = useMutation({
    mutationFn: async (id: string) => {
      const { error: clear } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user!.id);
      if (clear) throw clear;
      const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Default address updated.");
      void invalidate();
    },
    onError: () => toast.error("Couldn't update the default address."),
  });

  const set = (key: keyof typeof blank, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <PanelCard
      title="Saved addresses"
      action={
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus /> {adding ? "Close" : "Add address"}
        </Button>
      }
    >
      {adding && (
        <form
          className="mb-8 grid gap-4 rounded-lg border border-border p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          {(
            [
              ["label", "Label (Home, Office…)", 40],
              ["recipient_name", "Recipient name", 120],
              ["phone", "Phone", 15],
              ["city", "City", 80],
              ["postal_code", "PIN code", 6],
            ] as const
          ).map(([key, label, max]) => (
            <div key={key}>
              <Label htmlFor={`addr-${key}`}>{label}</Label>
              <Input
                id={`addr-${key}`}
                className="mt-2"
                maxLength={max}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Label htmlFor="addr-line1">Street address</Label>
            <Input
              id="addr-line1"
              className="mt-2"
              maxLength={200}
              value={form.address_line1}
              onChange={(e) => set("address_line1", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gold" disabled={create.isPending}>
              Save address
            </Button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {(data ?? []).map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border p-5"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{a.label}</p>
                {a.is_default && <Badge variant="gold">Default</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {a.recipient_name} · {a.phone}
                <br />
                {a.address_line1}, {a.city} {a.postal_code}
              </p>
            </div>
            <div className="flex gap-2">
              {!a.is_default && (
                <Button size="sm" variant="outline" onClick={() => makeDefault.mutate(a.id)}>
                  <Star /> Make default
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => remove.mutate(a.id)}
              >
                <Trash2 /> Remove
              </Button>
            </div>
          </li>
        ))}
        {(data ?? []).length === 0 && (
          <li className="text-sm text-muted-foreground">No saved addresses yet.</li>
        )}
      </ul>
    </PanelCard>
  );
}
