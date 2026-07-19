import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// POST /api/admin/create-account
// Verifies the caller is a signed-in admin (checked against admin_users),
// THEN uses the service-role client to create a real auth user + account +
// optional opening-balance transaction.
//
// This verification step is the whole point of this route existing as a
// server-side API rather than letting the client call admin functions
// directly — the service_role key never reaches the browser.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Verify the token and check admin_users using a plain (anon-key) client
  // scoped to this one request's token — NOT the admin client.
  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
  } = await verifyClient.auth.getUser(token);

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: adminRow } = await verifyClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  // Caller confirmed as admin — now safe to use the privileged client.
  const { fullName, email, passcode, accountNumber, openingBalance } = await request.json();

  if (!fullName || !email || !passcode || !accountNumber) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: newUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password: passcode,
    email_confirm: true, // admin-created accounts skip email verification
    user_metadata: { full_name: fullName },
  });

  if (createUserError || !newUser.user) {
    return NextResponse.json({ error: createUserError?.message ?? "Could not create user." }, { status: 400 });
  }

  const BANK_ROUTING_NUMBER = "084106768"; // placeholder — use the real assigned routing number once chartered/partnered

  const { data: newAccount, error: accountError } = await admin
    .from("accounts")
    .insert({
      user_id: newUser.user.id,
      account_number: accountNumber,
      routing_number: BANK_ROUTING_NUMBER,
      account_type: "checking",
    })
    .select("id")
    .single();

  if (accountError || !newAccount) {
    return NextResponse.json({ error: accountError?.message ?? "Could not create account." }, { status: 400 });
  }

  if (openingBalance && openingBalance > 0) {
    await admin.from("transactions").insert({
      account_id: newAccount.id,
      type: "credit",
      amount: openingBalance,
      category: "opening_deposit",
      description: "Opening deposit",
      created_by: user.id,
      reference_note: "Account opened by admin",
    });
  }

  return NextResponse.json({ accountId: newAccount.id });
}