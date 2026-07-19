"use client";

import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// First City Bank — Analytics
// Inspired by the reference screen's layout (total figure, stat breakdown,
// trend chart, filtered list) adapted to general spending/income analytics
// rather than installment/BNPL tracking. Swap for real aggregation queries
// once transactions live in Supabase.
// ---------------------------------------------------------------------------

const mockMonthly = [
  { label: "Jan", spending: 1800 },
  { label: "Feb", spending: 2100 },
  { label: "Mar", spending: 1950 },
  { label: "Apr", spending: 2400 },
  { label: "May", spending: 2890 },
  { label: "Jun", spending: 2600 },
];

const mockList = {
  spending: [
    { id: 1, label: "Amazon Purchase", category: "Shopping", amount: -120.0 },
    { id: 2, label: "Spotify Premium", category: "Entertainment", amount: -19.99 },
    { id: 3, label: "Uber Ride", category: "Transport", amount: -8.75 },
    { id: 4, label: "Rent — Autopay", category: "Housing", amount: -1200.0 },
  ],
  income: [
    { id: 5, label: "Payroll deposit", category: "Income", amount: 2450.0 },
    { id: 6, label: "Transfer from J. Aro", category: "Transfer", amount: 300.0 },
    { id: 7, label: "Interest earned", category: "Interest", amount: 4.18 },
  ],
};

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
function IconAnalyticsNav() {
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

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendChart({ data, activeIndex, onPointHover }: {
  data: { label: string; spending: number }[];
  activeIndex: number;
  onPointHover: (i: number) => void;
}) {
  const width = 340;
  const height = 140;
  const padding = 20;
  const max = Math.max(...data.map((d) => d.spending));
  const min = Math.min(...data.map((d) => d.spending));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.spending - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brass)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brass)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="var(--brass)" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i} onClick={() => onPointHover(i)} style={{ cursor: "pointer" }}>
          <circle cx={p.x} cy={p.y} r={10} fill="transparent" />
          <circle
            cx={p.x}
            cy={p.y}
            r={i === activeIndex ? 5 : 3}
            fill={i === activeIndex ? "var(--brass)" : "var(--panel-line)"}
            stroke="var(--ink)"
            strokeWidth={i === activeIndex ? 2 : 0}
          />
        </g>
      ))}
    </svg>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState<"spending" | "income">("spending");
  const [activeIndex, setActiveIndex] = useState(mockMonthly.length - 1);

  const totalSpending = useMemo(
    () => mockList.spending.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    []
  );
  const totalIncome = useMemo(
    () => mockList.income.reduce((sum, tx) => sum + tx.amount, 0),
    []
  );

  const activeMonth = mockMonthly[activeIndex];
  const list = mockList[tab];

  return (
    <main className="analytics">
      <style>{`
        .analytics {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 100px;
        }
        .a-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .a-back {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--parchment);
          cursor: pointer;
        }
        .a-title { font-size: 17px; font-weight: 600; }

        .a-total-label {
          font-size: 13px;
          color: var(--parchment-dim);
          margin-bottom: 6px;
        }
        .a-total {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 32px;
          margin-bottom: 20px;
        }

        .a-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        .a-stat {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 10px;
          padding: 12px;
        }
        .a-stat__label {
          font-size: 11px;
          color: var(--parchment-dim);
          margin-bottom: 6px;
        }
        .a-stat__value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }

        .a-chart-card {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 24px;
        }
        .a-chart-tooltip {
          font-size: 12px;
          color: var(--parchment-dim);
          margin-bottom: 4px;
        }
        .a-chart-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 18px;
          margin-bottom: 12px;
        }
        .a-chart-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--parchment-dim);
          margin-top: 4px;
          padding: 0 20px;
        }

        .a-tabs {
          display: inline-flex;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 999px;
          padding: 3px;
          margin-bottom: 16px;
        }
        .a-tab {
          border: none;
          background: none;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          color: var(--parchment-dim);
          cursor: pointer;
        }
        .a-tab.is-active {
          background: var(--brass);
          color: var(--ink);
          font-weight: 600;
        }

        .a-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--panel-line);
        }
        .a-row:last-child { border-bottom: none; }
        .a-row__left { display: flex; flex-direction: column; }
        .a-row__label { font-size: 14px; }
        .a-row__meta { font-size: 12px; color: var(--parchment-dim); }
        .a-row__amount {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }
        .is-credit { color: var(--credit); }
        .is-debit { color: var(--parchment); }

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
          text-decoration: none;
        }
        .nav-item.is-active { color: var(--brass); }
      `}</style>

      <div className="a-header">
        <a href="/dashboard" className="a-back" aria-label="Back to dashboard">
          <IconBack />
        </a>
        <div className="a-title display">Analytics</div>
      </div>

      <div className="a-total-label">Total spending (last 30 days)</div>
      <div className="a-total mono">{formatCurrency(totalSpending)}</div>

      <div className="a-stats">
        <div className="a-stat">
          <div className="a-stat__label">Spending</div>
          <div className="a-stat__value">{formatCurrency(totalSpending)}</div>
        </div>
        <div className="a-stat">
          <div className="a-stat__label">Income</div>
          <div className="a-stat__value">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="a-stat">
          <div className="a-stat__label">Net</div>
          <div className="a-stat__value">{formatCurrency(totalIncome - totalSpending)}</div>
        </div>
      </div>

      <div className="a-chart-card">
        <div className="a-chart-tooltip">{activeMonth.label} spending</div>
        <div className="a-chart-value mono">{formatCurrency(activeMonth.spending)}</div>
        <TrendChart data={mockMonthly} activeIndex={activeIndex} onPointHover={setActiveIndex} />
        <div className="a-chart-labels">
          {mockMonthly.map((m) => (
            <span key={m.label}>{m.label}</span>
          ))}
        </div>
      </div>

      <div className="a-tabs">
        <button className={`a-tab ${tab === "spending" ? "is-active" : ""}`} onClick={() => setTab("spending")}>
          Spending
        </button>
        <button className={`a-tab ${tab === "income" ? "is-active" : ""}`} onClick={() => setTab("income")}>
          Income
        </button>
      </div>

      <div>
        {list.map((tx) => (
          <div className="a-row" key={tx.id}>
            <div className="a-row__left">
              <div className="a-row__label">{tx.label}</div>
              <div className="a-row__meta">{tx.category}</div>
            </div>
            <div className={`a-row__amount ${tab === "income" ? "is-credit" : "is-debit"}`}>
              {formatCurrency(tx.amount)}
            </div>
          </div>
        ))}
      </div>

      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item">
          <IconHome />
          Home
        </a>
        <a href="/analytics" className="nav-item is-active">
          <IconAnalyticsNav />
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