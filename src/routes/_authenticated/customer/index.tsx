import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PanelCard, StatCard } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/data/hampers";
import { supabase } from "@/integrations/supabase/client";
import { orderStatusLabels, type OrderStatus } from "@/lib/orders";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer/")({
  head: () => ({
    meta: [
      { title: "My Dashboard | A_S Hamper" },
      { name: "description", content: "Your hamper orders, wishlist and account activity." },
      { property: "og:title", content: "My Dashboard | A_S Hamper" },
      { property: "og:description", content: "Your orders, wishlist and account activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerDashboard;
});

function CustomerDashboard() {
  return null;
}
