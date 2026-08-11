import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PanelCard } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/customer/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | A_S Hamper" },
      { name: "description", content: "Updates about your hamper orders and offers." },
      { property: "og:title", content: "Notifications | A_S Hamper" },
      { property: "og:description", content: "Updates about your orders and offers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerNotifications,
});

function CustomerNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All caught up.");
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-unread"] });
    },
    onError: () => toast.error("Couldn't update your notifications."),
  });

  const list = data ?? [];
  const unread = list.filter((n) => !n.read_at).length;

  return (
    <PanelCard
      title="Notifications"
      action={
        unread > 0 ? (
          <Button size="sm" variant="outline" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        ) : undefined
      }
    >
      <ul className="space-y-3">
        {list.map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border p-5 ${
              n.read_at ? "border-border" : "border-primary/40 bg-secondary/40"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">{n.title}</p>
              {!n.read_at && <Badge variant="gold">New</Badge>}
            </div>
            {n.body && <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleString("en-IN")}
            </p>
          </li>
        ))}
        {list.length === 0 && (
          <li className="text-sm text-muted-foreground">No notifications yet.</li>
        )}
      </ul>
    </PanelCard>
  );
}
