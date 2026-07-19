import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// First City Bank — Admin layout
// Runs on the server before any /admin page renders. Anyone not signed in,
// or signed in but not present in admin_users, gets redirected to
// /admin-login. This is a real security boundary (checked server-side),
// not just hiding a link in the UI.
// ---------------------------------------------------------------------------

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/admin-login");
  }

  return (
    <div>
      <nav className="admin-nav">
        <style>{`
          .admin-nav {
            display: flex;
            gap: 20px;
            padding: 16px 24px;
            border-bottom: 1px solid var(--panel-line);
            background: var(--panel);
            font-size: 14px;
          }
          .admin-nav a {
            color: var(--parchment-dim);
            text-decoration: none;
          }
          .admin-nav a:hover { color: var(--brass); }
          .admin-nav .brand {
            color: var(--parchment);
            font-weight: 600;
            margin-right: 12px;
          }
        `}</style>
        <span className="brand">First City Bank — Admin</span>
        <a href="/admin">Accounts</a>
        <a href="/admin/create-account">Create account</a>
      </nav>
      {children}
    </div>
  );
}