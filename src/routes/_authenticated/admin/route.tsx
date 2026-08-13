import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  BadgePercent,
  BarChart3,
  Bell,
  Boxes,
  FileText,
  Images,
  LayoutDashboard,
  ListTree,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { DashboardShell, type DashboardNavItem } from "@/components/site/DashboardShell";
import { Section } from "@/components/site/Layout";
import { Badge } from "@/components/ui/badge";
import { initialsFrom } from "@/lib/orders";
import { useAuth, useIsAdmin } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav: DashboardNavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons & offers", icon: BadgePercent },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/banners", label: "Banners", icon: Images },
  { to: "/admin/blogs", label: "Blog & gift guides", icon: FileText },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Admin settings", icon: Settings },
  { to: "/shop", label: "View storefront", icon: ShoppingBag },
];

function AdminLayout() {
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (checked && !isAdmin) navigate({ to: "/customer", replace: true });
  }, [checked, isAdmin, navigate]);

  if (!checked || !isAdmin) {
    return (
      <Section>
        <p className="text-center text-muted-foreground">
          {checked
            ? "This area is limited to the A_S Hamper store admin. Taking you to your account…"
            : "Checking your access…"}
        </p>
      </Section>
    );
  }

  return (
    <DashboardShell
      title="Store admin"
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
