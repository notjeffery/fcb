"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Admin: Account detail
// Shows the account's full transaction history (its "statement") and lets
// an admin manually post a credit or debit — e.g. confirming a wire/ACH
// transfer that came in outside business hours. This inserts a real
// transactions row (using the admin INSERT policy from schema.sql), so it
// carries the same audit trail as any other transaction: who posted it,
// when, and why.
// ---------------------------------------------------------------------------

type Account = {
  id: string;
  user_id: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  status: string;
  profiles: { full_name: string; email: string } | null;
};

type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  category: string;
  description: string;
  reference_note: string | null;
  created_by: string | null;
  created_at: string;
};

function formatCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AccountDetail() {
  const params = useParams();
  const accountId = params.id as string;
  const supabase = createClient();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [referenceNote, setReferenceNote] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPasscode, setEditPasscode] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  async function loadData() {
    const { data: accountData } = await supabase
      .from("accounts")
      .select("id, user_id, account_number, routing_number, account_type, status, profiles(full_name, email)")
      .eq("id", accountId)
      .single();

    const { data: txData } = await supabase
      .from("transactions")
      .select("id, type, amount, category, description, reference_note, created_by, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    const { data: balanceData } = await supabase
      .from("account_balances")
      .select("balance")
      .eq("account_id", accountId)
      .maybeSingle();

    if (!accountData) {
      setStatus("error");
      return;
    }

    setAccount(accountData as any);
    setEditFullName((accountData as any).profiles?.full_name ?? "");
    setEditEmail((accountData as any).profiles?.email ?? "");
    setTransactions(txData ?? []);
    setBalance(balanceData?.balance ?? 0);
    setStatus("ready");
  }

  useEffect(() => {
    loadData();
  }, [accountId]);

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditSuccess(false);
    setEditSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !account) {
      setEditError("Session expired — please log in again.");
      setEditSaving(false);
      return;
    }

    const res = await fetch("/api/admin/update-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: account.user_id,
        fullName: editFullName || undefined,
        email: editEmail || undefined,
        passcode: editPasscode || undefined,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setEditError(result.error ?? "Something went wrong.");
      setEditSaving(false);
      return;
    }

    setEditPasscode("");
    setEditSuccess(true);
    setEditSaving(false);
    loadData();
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPostError("");

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setPostError("Enter a valid amount greater than zero.");
      return;
    }
    if (!description) {
      setPostError("Description is required.");
      return;
    }

    setPosting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("transactions").insert({
      account_id: accountId,
      type,
      amount: parsedAmount,
      category: "manual",
      description,
      created_by: user?.id,
      reference_note: referenceNote || null,
    });

    if (error) {
      setPostError(error.message);
      setPosting(false);
      return;
    }

    setAmount("");
    setDescription("");
    setReferenceNote("");
    setPosting(false);
    loadData();
  }

  if (status === "loading") return <main style={{ padding: 24 }}>Loading…</main>;
  if (status === "error" || !account) return <main style={{ padding: 24 }}>Account not found.</main>;

  return (
    <main className="account-detail">
      <style>{`
        .account-detail { max-width: 800px; margin: 0 auto; padding: 28px 24px; }
        .ad-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .ad-name { font-size: 20px; }
        .ad-meta { font-size: 13px; color: var(--parchment-dim); margin-top: 4px; }
        .ad-balance { text-align: right; }
        .ad-balance-label { font-size: 12px; color: var(--parchment-dim); }
        .ad-balance-value { font-family: 'IBM Plex Mono', monospace; font-size: 24px; }

        .panel {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .panel-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }

        .field { margin-bottom: 14px; }
        .field label { display: block; font-size: 12px; color: var(--parchment-dim); margin-bottom: 6px; }
        .field input, .field select {
          width: 100%;
          padding: 10px 12px;
          background: var(--ink);
          border: 1px solid var(--panel-line);
          border-radius: 6px;
          color: var(--parchment);
          font-size: 14px;
        }
        .field input:focus, .field select:focus { outline: none; border-color: var(--brass); }
        .field-row { display: flex; gap: 12px; }
        .field-row .field { flex: 1; }

        .error-box {
          background: rgba(201, 123, 99, 0.12);
          border: 1px solid var(--debit);
          color: var(--debit);
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--parchment-dim);
          padding: 8px 10px;
          border-bottom: 1px solid var(--panel-line);
        }
        td { padding: 10px; border-bottom: 1px solid var(--panel-line); }
        .amount-mono { font-family: 'IBM Plex Mono', monospace; }
        .is-credit { color: var(--credit); }
        .is-debit { color: var(--debit); }
      `}</style>

      <div className="ad-header">
        <div>
          <div className="ad-name display">{account.profiles?.full_name}</div>
          <div className="ad-meta">
            {account.profiles?.email} · Acct •••• {account.account_number.slice(-4)} · Routing {account.routing_number}
          </div>
        </div>
        <div className="ad-balance">
          <div className="ad-balance-label">Current balance</div>
          <div className="ad-balance-value">{formatCurrency(balance)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Edit account holder</div>
        {editError && <div className="error-box">{editError}</div>}
        {editSuccess && (
          <div style={{ color: "var(--credit)", fontSize: 13, marginBottom: 14 }}>Changes saved.</div>
        )}
        <form onSubmit={handleEditSubmit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Reset passcode (leave blank to keep current)</label>
            <input
              type="text"
              placeholder="New passcode, min. 6 characters"
              value={editPasscode}
              onChange={(e) => setEditPasscode(e.target.value)}
              minLength={6}
            />
          </div>
          <button className="btn-primary" type="submit" disabled={editSaving}>
            {editSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">Post a manual transaction</div>
        {postError && <div className="error-box">{postError}</div>}
        <form onSubmit={handlePost}>
          <div className="field-row">
            <div className="field">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "credit" | "debit")}>
                <option value="credit">Credit (add funds)</option>
                <option value="debit">Debit (remove funds)</option>
              </select>
            </div>
            <div className="field">
              <label>Amount</label>
              <input type="text" inputMode="decimal" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Description (shown to the customer)</label>
            <input
              type="text"
              placeholder="e.g. Wire transfer received"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Internal reference note (admin-only, for the audit trail)</label>
            <input
              type="text"
              placeholder="e.g. Confirmed via bank statement, ref #48213"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
            />
          </div>
          <button className="btn-primary" type="submit" disabled={posting}>
            {posting ? "Posting…" : "Post transaction"}
          </button>
        </form>
      </div>

      <div className="panel-title">Transaction history</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Reference note</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              <td>{tx.description}</td>
              <td style={{ color: "var(--parchment-dim)" }}>{tx.reference_note ?? "—"}</td>
              <td className={`amount-mono ${tx.type === "credit" ? "is-credit" : "is-debit"}`}>
                {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}