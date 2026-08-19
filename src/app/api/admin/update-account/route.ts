import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// POST /api/admin/update-account
// Verifies the caller is a signed-in admin, then lets them change another
// user's full name, email, and/or password. Email and password changes go
// through the Supabase Admin API (service role) since a regular user
// session can never modify someone else's auth credentials — only the
// admin API can do that, which is why this route (and its verification
// step) exists at all.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user: caller },
  } = await verifyClient.auth.getUser(token);

  if (!caller) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: adminRow } = await verifyClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", caller.id)
    .maybeSingle();

  if (!adminRow) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { userId, fullName, email, password } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Update auth credentials (email and/or password) via the Admin API.
  if (email || password) {
    const { error: authUpdateError } = await admin.auth.admin.updateUserById(userId, {
      ...(email ? { email, email_confirm: true } : {}),
      ...(password ? { password } : {}),
    });
    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 400 });
    }
  }

  // Keep the profiles table's copy of name/email in sync.
  if (fullName || email) {
    const { error: profileUpdateError } = await admin
      .from("profiles")
      .update({
        ...(fullName ? { full_name: fullName } : {}),
        ...(email ? { email } : {}),
      })
      .eq("id", userId);
    if (profileUpdateError) {
      return NextResponse.json({ error: profileUpdateError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}