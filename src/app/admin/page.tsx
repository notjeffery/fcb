"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Admin dashboard
// Lists every account with its current holder and balance. Balance is read
// from the account_balances view (derived from transactions), never a
// stored column.
// ---------------------------------------------------------------------------

type AccountRow = {
  id: string;
  account_number: string;
  account_type: string;
  status: string;
  profiles: { full_name: string; email: string } | null;
  balance: number;
};

function formatCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function load() {
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("id, account_number, account_type, status, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (accountsError || !accountsData) {
        setStatus("error");
        return;
      }

      const { data: balancesData } = await supabase.from("account_balances").select("account_id, balance");
      const balanceMap = new Map((balancesData ?? []).map((b) => [b.account_id, b.balance]));

      const merged: AccountRow[] = accountsData.map((a: any) => ({
        id: a.id,
        account_number: a.account_number,
        account_type: a.account_type,
        status: a.status,
        profiles: a.profiles,
        balance: balanceMap.get(a.id) ?? 0,
      }));

      setAccounts(merged);
      setStatus("ready");
    }
    load();
  }, []);

  return (
    <main className="admin-dash">
      <style>{`
        .admin-dash { max-width: 900px; margin: 0 auto; padding: 28px 24px; }
        .admin-dash__title { font-size: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--parchment-dim);
          padding: 10px 12px;
          border-bottom: 1px solid var(--panel-line);
        }
        td {
          padding: 12px;
          border-bottom: 1px solid var(--panel-line);
        }
        tr.acct-row { cursor: pointer; }
        tr.acct-row:hover td { background: var(--panel); }
        .acct-number { font-family: 'IBM Plex Mono', monospace; }
        .status-pill {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid var(--panel-line);
        }
        .status-active { color: var(--credit); border-color: var(--credit); }
        .status-frozen { color: var(--debit); border-color: var(--debit); }
      `}</style>

      <div className="admin-dash__title display">Accounts</div>

      {status === "loading" && <p>Loading accounts…</p>}
      {status === "error" && <p>Couldn't load accounts. Check console for details.</p>}

      {status === "ready" && (
        <table>
          <thead>
            <tr>
              <th>Holder</th>
              <th>Account number</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr className="acct-row" key={a.id} onClick={() => router.push(`/admin/accounts/${a.id}`)}>
                <td>
                  {a.profiles?.full_name}
                  <div style={{ fontSize: 12, color: "var(--parchment-dim)" }}>{a.profiles?.email}</div>
                </td>
                <td className="acct-number">{a.account_number}</td>
                <td style={{ textTransform: "capitalize" }}>{a.account_type}</td>
                <td className="acct-number">{formatCurrency(a.balance)}</td>
                <td>
                  <span className={`status-pill ${a.status === "active" ? "status-active" : "status-frozen"}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}