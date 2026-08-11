import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, Heart, LayoutDashboard, MapPin, Package, Settings, UserRound } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { initialsFrom } from "@/lib/orders";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer")({
  component: CustomerLayout,
});

const nav: DashboardNavItem[] = [
  { to: "/customer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/customer/orders", label: "My orders", icon: Package },
  { to: "/customer/wishlist", label: "Wishlist", icon: Heart },
  { to: "/customer/addresses", label: "Addresses", icon: MapPin },
  { to: "/customer/notifications", label: "Notifications", icon: Bell },
  { to: "/customer/profile", label: "Profile", icon: UserRound },
  { to: "/customer/settings", label: "Settings", icon: Settings },
];

function CustomerLayout() {
  const { user } = useAuth();

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

  return (
    <DashboardShell
      title={profile?.full_name || "My account"}
      subtitle={profile?.email ?? user?.email ?? undefined}
      initials={initialsFrom(profile?.full_name ?? user?.email)}
      badge={<Badge variant="secondary">Customer</Badge>}
      nav={nav}
    >
      <Outlet />
    </DashboardShell>
  );
}
