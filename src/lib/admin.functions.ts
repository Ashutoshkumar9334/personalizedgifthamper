import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Tells the sign-in screen whether an email is the reserved store-admin address.
 * The admin address itself is never returned to the browser.
 */
export const checkAdminEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => ({
    email: String(data.email ?? "").trim().toLowerCase().slice(0, 255),
  }))
  .handler(async ({ data }) => {
    if (!data.email) return { isAdminEmail: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("is_admin_email", {
      _email: data.email,
    });
    if (error) return { isAdminEmail: false };
    return { isAdminEmail: Boolean(result) };
  });

/** Role of the signed-in caller, resolved server-side against the database. */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { role: data ? ("admin" as const) : ("customer" as const) };
  });
