import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/site/DashboardShell";
import { Section } from "@/components/site/Layout";
import { Badge } from "@/components/ui/badge";
import { initialsFrom } from "@/lib/orders";
import { useAuth, useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav: DashboardNavItem[] = [
  { to: "/admin/dashboard", label: "Orders", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/shop", label: "View storefront", icon: ShoppingBag },
];

function AdminLayout() {
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin(user?.id);

  if (checked && !isAdmin) {
    return (
      <Section>
        <p className="text-center text-muted-foreground">
          This area is limited to the A_S Hamper admin account.
        </p>
      </Section>
    );
  }

  return (
    <DashboardShell
      title="Admin"
      subtitle={user?.email ?? undefined}
      initials={initialsFrom(user?.email)}
      badge={
        <Badge variant="gold">
          <Store className="mr-1 size-3" /> Store admin
        </Badge>
      }
      nav={nav}
    >
      <Outlet />
    </DashboardShell>
  );
}
