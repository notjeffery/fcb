// -----------------------------------------------------------------------------
// First City Bank — seed script for the master/display account
//
// Run once from your project root:
//   node --env-file=.env.local scripts/seed-master-account.js
//
// (If your Node version doesn't support --env-file, install dotenv instead:
//   npm install dotenv
// and uncomment the require("dotenv").config() line below.)
//
// Uses the service_role key directly — safe here because this only ever
// runs locally on your machine, never as a public web endpoint.
// -----------------------------------------------------------------------------

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Checked for a .env.local file in:", process.cwd());
  console.error("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error("SUPABASE_SERVICE_ROLE_KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ACCOUNT = {
  fullName: "Yvonne Price",
  email: "yvonne.price@gmail.com",
  password: "yvonneprice",
  openingBalance: 4500000.0, // midpoint of the $4–5M range you gave
};

// Same mock activity used throughout the build, backdated across the
// last month so the history looks lived-in rather than all-at-once.
const MOCK_TRANSACTIONS = [
  { type: "credit", amount: 2450.0, description: "Payroll deposit", daysAgo: 2 },
  { type: "debit", amount: 1200.0, description: "Rent — Autopay", daysAgo: 3 },
  { type: "credit", amount: 300.0, description: "Transfer from J. Aro", daysAgo: 11 },
  { type: "debit", amount: 8.75, description: "Uber Ride", daysAgo: 2 },
  { type: "debit", amount: 19.99, description: "Spotify Premium", daysAgo: 16 },
  { type: "debit", amount: 120.0, description: "Amazon Purchase", daysAgo: 28 },
  { type: "credit", amount: 4.18, description: "Interest earned", daysAgo: 30 },
];

function daysAgoToISOString(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function main() {
  console.log(`Creating user: ${ACCOUNT.email}...`);

  const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
    email: ACCOUNT.email,
    password: ACCOUNT.password,
    email_confirm: true,
    user_metadata: { full_name: ACCOUNT.fullName },
  });

  if (createUserError || !newUser.user) {
    console.error("Failed to create user. Full error details:");
    console.error(JSON.stringify(createUserError, Object.getOwnPropertyNames(createUserError || {}), 2));
    return;
  }

  console.log(`User created: ${newUser.user.id}`);

  // The database trigger auto-creates the accounts row the instant the
  // user is created — no client-side insert needed here.
  const { data: account, error: accountLookupError } = await supabase
    .from("accounts")
    .select("id, account_number")
    .eq("user_id", newUser.user.id)
    .single();

  if (accountLookupError || !account) {
    console.error("Couldn't find the auto-created account row:", accountLookupError?.message);
    return;
  }

  console.log(`Account found: ${account.account_number}`);

  console.log(`Posting opening deposit of $${ACCOUNT.openingBalance.toLocaleString()}...`);
  await supabase.from("transactions").insert({
    account_id: account.id,
    type: "credit",
    amount: ACCOUNT.openingBalance,
    category: "opening_deposit",
    description: "Opening deposit",
    reference_note: "Account opened via seed script",
    created_at: daysAgoToISOString(35),
  });

  console.log("Posting mock activity...");
  for (const tx of MOCK_TRANSACTIONS) {
    await supabase.from("transactions").insert({
      account_id: account.id,
      type: tx.type,
      amount: tx.amount,
      category: "manual",
      description: tx.description,
      reference_note: "Seeded mock activity",
      created_at: daysAgoToISOString(tx.daysAgo),
    });
    console.log(`  ${tx.type === "credit" ? "+" : "-"}$${tx.amount} — ${tx.description}`);
  }

  const netMockActivity = MOCK_TRANSACTIONS.reduce(
    (sum, tx) => sum + (tx.type === "credit" ? tx.amount : -tx.amount),
    0
  );
  const finalBalance = ACCOUNT.openingBalance + netMockActivity;

  console.log("\nDone.");
  console.log(`Account number: ${account.account_number}`);
  console.log(`Passcode: ${ACCOUNT.password}`);
  console.log(`Final balance: $${finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
}

main();