"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Admin: Create account
// Lets an admin set up a full account manually: name, email, passcode,
// account number, and an opening balance. The opening balance is posted
// as a real transaction (not a raw balance edit) so it shows up in the
// account's history from day one.
// ---------------------------------------------------------------------------

function generateAccountNumber() {
  let n = "";
  for (let i = 0; i < 10; i++) n += Math.floor(Math.random() * 10);
  return n;
}

export default function CreateAccount() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [accountNumber, setAccountNumber] = useState(generateAccountNumber());
  const [openingBalance, setOpeningBalance] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Get the current admin's access token to pass to the API route,
    // which verifies admin status server-side before doing anything.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Your session expired — please log in again.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/admin/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        fullName,
        email,
        passcode,
        accountNumber,
        openingBalance: openingBalance ? parseFloat(openingBalance) : 0,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    router.push(`/admin/accounts/${result.accountId}`);
  }

  return (
    <main className="create-account">
      <style>{`
        .create-account { max-width: 480px; margin: 0 auto; padding: 28px 24px; }
        .ca-title { font-size: 20px; margin-bottom: 20px; }
        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 13px;
          color: var(--parchment-dim);
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          padding: 12px 14px;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 8px;
          color: var(--parchment);
          font-size: 14px;
        }
        .field input:focus { outline: none; border-color: var(--brass); }
        .regen-btn {
          margin-top: 8px;
          background: none;
          border: none;
          color: var(--brass);
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }
        .error-box {
          background: rgba(201, 123, 99, 0.12);
          border: 1px solid var(--debit);
          color: var(--debit);
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 18px;
        }
      `}</style>

      <div className="ca-title display">Create account</div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Passcode (min. 6 characters)</label>
          <input
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div className="field">
          <label>Account number</label>
          <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
          <button type="button" className="regen-btn" onClick={() => setAccountNumber(generateAccountNumber())}>
            Generate a different number
          </button>
        </div>
        <div className="field">
          <label>Opening balance (optional)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="$0.00"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />
        </div>
        <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>
    </main>
  );
}