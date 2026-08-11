import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PanelCard } from "@/components/site/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | A_S Hamper" },
      { name: "description", content: "Update your name, phone number and contact details." },
      { property: "og:title", content: "My Profile | A_S Hamper" },
      { property: "og:description", content: "Update your contact details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerProfile,
});

const schema = z.object({
  full_name: z.string().trim().max(120),
  phone: z
    .string()
    .trim()
    .max(15)
    .refine((v) => v === "" || /^[0-9+\-\s]{6,15}$/.test(v), "Enter a valid phone number"),
  avatar_url: z.string().trim().max(500),
});

function CustomerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email, avatar_url, created_at")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setAvatar(profile?.avatar_url ?? "");
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ full_name: fullName, phone, avatar_url: avatar });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          avatar_url: parsed.data.avatar_url || null,
        })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save changes."),
  });

  return (
    <PanelCard title="Personal details">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            className="mt-2"
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            className="mt-2"
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="mt-2" value={profile?.email ?? user?.email ?? ""} disabled />
        </div>
        <div>
          <Label htmlFor="avatar">Profile photo URL</Label>
          <Input
            id="avatar"
            className="mt-2"
            maxLength={500}
            placeholder="https://…"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
      </div>
      <Button variant="gold" className="mt-6" onClick={() => save.mutate()} disabled={save.isPending}>
        Save changes
      </Button>
      {profile?.created_at && (
        <p className="mt-4 text-xs text-muted-foreground">
          Member since {new Date(profile.created_at).toLocaleDateString("en-IN")}
        </p>
      )}
    </PanelCard>
  );
}
