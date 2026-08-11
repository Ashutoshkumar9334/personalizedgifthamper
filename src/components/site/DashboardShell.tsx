import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  initials,
  badge,
  nav,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  initials: string;
  badge?: ReactNode;
  nav: DashboardNavItem[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr] lg:py-14">
      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">
            {initials}
          </div>
          <p className="mt-4 font-display text-xl leading-tight">{title}</p>
          {subtitle && <p className="mt-1 text-sm break-all text-muted-foreground">{subtitle}</p>}
          {badge && <div className="mt-3 flex justify-center">{badge}</div>}
        </div>

        <nav className="grid gap-1 rounded-xl border border-border bg-card p-3">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: Boolean(exact) }}
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
          <Button variant="ghost" className="mt-1 justify-start gap-3" onClick={signOut}>
            <LogOut className="size-4" /> Log out
          </Button>
        </nav>
      </aside>

      <div className="min-w-0 space-y-8">{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PanelCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
