import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PanelCard } from "@/components/site/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/customer/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings | A_S Hamper" },
      { name: "description", content: "Change your password and appearance preferences." },
      { property: "og:title", content: "Account Settings | A_S Hamper" },
      { property: "og:description", content: "Change your password and preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerSettings,
});

function CustomerSettings() {
  const { theme, toggle } = useTheme();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().min(8, "Use at least 8 characters").max(72).safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) {
      toast.error("Couldn't update your password.");
      return;
    }
    setPassword("");
    toast.success("Password updated.");
  };

  return (
    <>
      <PanelCard title="Change password">
        <form className="max-w-sm space-y-4" onSubmit={change}>
          <div>
            <Label htmlFor="pwd">New password</Label>
            <Input
              id="pwd"
              type="password"
              className="mt-2"
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            Update password
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Signed in with Google? You can set a password here to also log in with email.
        </p>
      </PanelCard>

      <PanelCard title="Appearance">
        <p className="text-sm text-muted-foreground">
          Currently using {theme === "dark" ? "dark" : "bright"} mode.
        </p>
        <Button variant="outline" className="mt-4" onClick={toggle}>
          Switch to {theme === "dark" ? "bright" : "dark"} mode
        </Button>
      </PanelCard>
    </>
  );
}
