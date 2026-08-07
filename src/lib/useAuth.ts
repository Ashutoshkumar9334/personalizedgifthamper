import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user: User | null = session?.user ?? null;
  return { session, user, loading };
}

export function useIsAdmin(userId?: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }
    let active = true;
    supabase
      .rpc("has_role", { _user_id: userId, _role: "admin" })
      .then(({ data }) => {
        if (!active) return;
        setIsAdmin(Boolean(data));
        setChecked(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return { isAdmin, checked };
}
