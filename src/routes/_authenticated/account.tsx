import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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

function Account() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim().slice(0, 120), phone: phone.trim().slice(0, 15) })
      .eq("id", user.id);
    setSaving(false);
    toast[error ? "error" : "success"](error ? "Couldn't save changes." : "Profile updated.");
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="My details" description={user?.email ?? ""} />
      <Section>
        <div className="mx-auto max-w-lg space-y-5 rounded-lg border border-border bg-card p-7">
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
          <div className="flex flex-wrap gap-3">
            <Button variant="gold" onClick={save} disabled={saving}>
              Save changes
            </Button>
            <Button asChild variant="outline">
              <Link to="/orders">My orders</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="ghost">
                <Link to="/admin/dashboard">Admin</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/", replace: true });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
