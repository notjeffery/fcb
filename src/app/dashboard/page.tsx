"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ---------------------------------------------------------------------------
// First City Bank — Dashboard (home)
// Inspired by the FinSight / wallet-app reference layout: greeting header,
// wallet card, quick actions, transaction list, bottom nav.
// Replace mock data with real Supabase queries (account balance, recent
// transactions) once the schema is wired up.
// ---------------------------------------------------------------------------

const mockAccount = {
  holderName: "Jeffery",
  cardNumber: "4471",
  balance: 12505.58,
};

const mockTransactions = [
  { id: 1, label: "Payroll deposit", category: "Income", timestamp: "2026-05-29T13:00:00Z", amount: 2450.0, type: "credit" },
  { id: 2, label: "Uber Ride", category: "Transport", timestamp: "2026-05-29T21:15:00Z", amount: -8.75, type: "debit" },
  { id: 3, label: "Spotify Premium", category: "Entertainment", timestamp: "2026-05-15T09:00:00Z", amount: -19.99, type: "debit" },
  { id: 4, label: "Amazon Purchase", category: "Shopping", timestamp: "2026-05-03T17:40:00Z", amount: -120.0, type: "debit" },
];

function formatLocalDate(utcTimestamp: string) {
  return new Date(utcTimestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconAnalytics() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V9M12 19V4M20 19v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="14" r="1.4" fill="currentColor" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 20c1.6-3.5 5-5 7.5-5s5.9 1.5 7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 19l14-14M19 5H9M19 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconRequest() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 5L5 19M5 19h10M5 19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconAdd() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 8a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [greeting, setGreeting] = useState("Good morning");
  const [formattedDates, setFormattedDates] = useState<Record<number, string>>({});

  useEffect(() => {
    setGreeting(getGreeting());
    const dates: Record<number, string> = {};
    mockTransactions.forEach((tx) => {
      dates[tx.id] = formatLocalDate(tx.timestamp);
    });
    setFormattedDates(dates);
  }, []);

  const masked = "•••••••";

  return (
    <main className="dash">
      <style>{`
        .dash {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 100px;
          position: relative;
        }

        .dash__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .dash__greeting-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dash__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          color: var(--brass);
          font-size: 16px;
          text-decoration: none;
          cursor: pointer;
        }
        .dash__greeting-sub {
          font-size: 12px;
          color: var(--parchment-dim);
        }
        .dash__greeting-name {
          font-size: 15px;
          font-weight: 600;
        }
        .dash__bell {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--parchment);
        }

        .dash__section-label {
          font-size: 13px;
          color: var(--parchment-dim);
          margin-bottom: 12px;
        }

        /* Wallet card */
        .card {
          background: linear-gradient(135deg, var(--panel) 0%, var(--ink) 100%);
          border: 1px solid var(--panel-line);
          border-radius: 16px;
          padding: 24px 22px;
          margin-bottom: 22px;
          position: relative;
          overflow: hidden;
        }
        .card__glow {
          position: absolute;
          top: -80px;
          right: -60px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,146,90,0.25), transparent 70%);
        }
        .card__top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          position: relative;
        }
        .card__brand {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 16px;
        }
        .card__brand img {
          height: 22px;
          width: auto;
          margin-bottom: 4px;
        }
        .card__network {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.06em;
          color: var(--brass);
        }
        .card__balance-label {
          font-size: 12px;
          color: var(--parchment-dim);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .card__eye {
          background: none;
          border: none;
          color: var(--parchment-dim);
          cursor: pointer;
          padding: 0;
          display: flex;
        }
        .card__balance {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 30px;
          margin-bottom: 22px;
          position: relative;
        }
        .card__bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
        }
        .card__number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--parchment-dim);
        }
        .card__exp {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--parchment-dim);
          text-align: right;
        }
        .card__exp-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Quick actions */
        .actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }
        .action {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 12px;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          text-decoration: none;
          color: var(--parchment);
        }
        .action__icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--ink);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brass);
        }
        .action__label {
          font-size: 12px;
        }

        /* Transactions */
        .tx-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .tx-header a {
          font-size: 13px;
          color: var(--brass);
          text-decoration: none;
        }
        .tx-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--panel-line);
        }
        .tx-row:last-child { border-bottom: none; }
        .tx-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          flex-shrink: 0;
        }
        .tx-body { flex: 1; min-width: 0; }
        .tx-label { font-size: 14px; }
        .tx-meta { font-size: 12px; color: var(--parchment-dim); }
        .tx-amount {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          white-space: nowrap;
        }
        .is-credit { color: var(--credit); }
        .is-debit { color: var(--parchment); }

        /* Bottom nav */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 420px;
          margin: 0 auto;
          background: var(--panel);
          border-top: 1px solid var(--panel-line);
          display: flex;
          justify-content: space-around;
          padding: 14px 0 18px;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--parchment-dim);
          font-size: 11px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-item.is-active { color: var(--brass); }
      `}</style>

      <div className="dash__header">
        <div className="dash__greeting-row">
          <a href="/profile" className="dash__avatar">
            {mockAccount.holderName.charAt(0)}
          </a>
          <div>
            <div className="dash__greeting-sub">{greeting}</div>
            <div className="dash__greeting-name">{mockAccount.holderName}</div>
          </div>
        </div>
        <button className="dash__bell" aria-label="Notifications">
          <IconBell />
        </button>
      </div>

      <div className="dash__section-label">My wallet</div>

      <div className="card" onClick={() => router.push("/wallet")} style={{ cursor: "pointer" }}>
        <div className="card__glow" />
        <div className="card__top">
          <div className="card__brand">
            <Image src="/logo-transparent.png" alt="First City Bank" width={90} height={22} style={{ height: 22, width: "auto" }} />
          </div>
          <div className="card__network">DEBIT</div>
        </div>
        <div className="card__balance-label">
          Current balance
          <button className="card__eye" onClick={(e) => { e.stopPropagation(); setShowBalance((s) => !s); }} aria-label="Toggle balance visibility">
            {showBalance ? "🙈" : "👁"}
          </button>
        </div>
        <div className="card__balance">
          {showBalance ? formatCurrency(mockAccount.balance) : masked}
        </div>
        <div className="card__bottom">
          <div className="card__number">
            •••• •••• •••• {mockAccount.cardNumber}
          </div>
          <div className="card__exp">
            <div className="card__exp-label">Exp date</div>
            10/28
          </div>
        </div>
      </div>

      <div className="actions">
        <a href="/transfer/send" className="action">
          <div className="action__icon"><IconSend /></div>
          <div className="action__label">Send</div>
        </a>
        <a href="/transfer/receive" className="action">
          <div className="action__icon"><IconRequest /></div>
          <div className="action__label">Request</div>
        </a>
        <a href="/transfer/add-funds" className="action">
          <div className="action__icon"><IconAdd /></div>
          <div className="action__label">Add funds</div>
        </a>
      </div>

      <div className="tx-header">
        <div className="dash__section-label" style={{ marginBottom: 0 }}>Transactions</div>
        <a href="#">View all</a>
      </div>
      <div>
        {mockTransactions.map((tx) => (
          <div className="tx-row" key={tx.id}>
            <div className="tx-icon" />
            <div className="tx-body">
              <div className="tx-label">{tx.label}</div>
              <div className="tx-meta">{tx.category} · {formattedDates[tx.id] ?? "…"}</div>
            </div>
            <div className={`tx-amount ${tx.type === "credit" ? "is-credit" : "is-debit"}`}>
              {formatCurrency(tx.amount)}
            </div>
          </div>
        ))}
      </div>

      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item is-active">
          <IconHome />
          Home
        </a>
        <a href="/analytics" className="nav-item">
          <IconAnalytics />
          Analytics
        </a>
        <a href="/wallet" className="nav-item">
          <IconWallet />
          Wallet
        </a>
        <a href="/profile" className="nav-item">
          <IconProfile />
          Profile
        </a>
      </nav>
    </main>
  );
}