"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Wallet
// Card details/controls + a live crypto market watchlist (price display
// only, not trading) via CoinGecko's free public API. Account balance and
// number now come from Supabase, matching the Dashboard.
// ---------------------------------------------------------------------------

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
];

type CoinPrice = { symbol: string; name: string; price: number; change: number };

function formatCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSnowflake() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconMore() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
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

export default function Wallet() {
  const router = useRouter();
  const supabase = createClient();

  const [accountNumberLast4, setAccountNumberLast4] = useState("");
  const [balance, setBalance] = useState(0);
  const [accountStatus, setAccountStatus] = useState<"loading" | "ready" | "error">("loading");

  const [frozen, setFrozen] = useState(false);
  const [market, setMarket] = useState<CoinPrice[]>([]);
  const [marketStatus, setMarketStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: acct } = await supabase
        .from("accounts")
        .select("id, account_number")
        .eq("user_id", user.id)
        .single();

      if (!acct) {
        setAccountStatus("error");
        return;
      }

      const { data: balanceRow } = await supabase
        .from("account_balances")
        .select("balance")
        .eq("account_id", acct.id)
        .maybeSingle();

      setAccountNumberLast4(acct.account_number.slice(-4));
      setBalance(balanceRow?.balance ?? 0);
      setAccountStatus("ready");
    }
    loadAccount();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const ids = COINS.map((c) => c.id).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        if (!res.ok) throw new Error("Failed to fetch prices");
        const data = await res.json();
        if (cancelled) return;

        const next: CoinPrice[] = COINS.map((c) => ({
          symbol: c.symbol,
          name: c.name,
          price: data[c.id]?.usd ?? 0,
          change: data[c.id]?.usd_24h_change ?? 0,
        }));
        setMarket(next);
        setMarketStatus("ready");
      } catch {
        if (!cancelled) setMarketStatus("error");
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // refresh every 60s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (accountStatus === "loading") {
    return <main style={{ padding: 24 }}>Loading your wallet…</main>;
  }
  if (accountStatus === "error") {
    return <main style={{ padding: 24 }}>Couldn&apos;t load your account.</main>;
  }

  return (
    <main className="wallet">
      <style>{`
        .wallet {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 100px;
        }
        .w-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .w-back {
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
        .w-title { font-size: 17px; font-weight: 600; }

        .card {
          background: linear-gradient(135deg, var(--panel) 0%, var(--ink) 100%);
          border: 1px solid var(--panel-line);
          border-radius: 16px;
          padding: 24px 22px;
          margin-bottom: 16px;
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
        .card__network {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.06em;
          color: var(--brass);
        }
        .card__label {
          font-size: 12px;
          color: var(--parchment-dim);
          margin-bottom: 6px;
        }
        .card__number-big {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          letter-spacing: 0.06em;
          margin-bottom: 22px;
          position: relative;
        }
        .card__bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
        }
        .card__balance-label { font-size: 11px; color: var(--parchment-dim); }
        .card__balance { font-family: 'IBM Plex Mono', monospace; font-size: 16px; }

        .card-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 28px;
        }
        .card-action {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 10px;
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          cursor: pointer;
          color: var(--parchment);
        }
        .card-action.is-active-toggle {
          border-color: var(--brass);
          color: var(--brass);
        }

        .section-label {
          font-size: 13px;
          color: var(--parchment-dim);
          margin-bottom: 12px;
        }

        .market-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--panel-line);
        }
        .market-row:last-child { border-bottom: none; }
        .market-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--ink);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--brass);
          flex-shrink: 0;
        }
        .market-body { flex: 1; }
        .market-name { font-size: 14px; }
        .market-symbol { font-size: 12px; color: var(--parchment-dim); }
        .market-right { text-align: right; }
        .market-price { font-family: 'IBM Plex Mono', monospace; font-size: 14px; }
        .market-change { font-size: 12px; }
        .is-up { color: var(--credit); }
        .is-down { color: var(--debit); }
        .is-flat { color: var(--parchment-dim); }

        .market-note {
          font-size: 11px;
          color: var(--parchment-dim);
          margin-top: 12px;
        }

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

      <div className="w-header">
        <a href="/dashboard" className="w-back" aria-label="Back to dashboard">
          <IconBack />
        </a>
        <div className="w-title display">Wallet</div>
      </div>

      <div className="card">
        <div className="card__glow" />
        <div className="card__top">
          <div className="card__label">Debit card</div>
          <div className="card__network">VISA</div>
        </div>
        <div className="card__number-big">
          •••• •••• •••• {accountNumberLast4}
        </div>
        <div className="card__bottom">
          <div>
            <div className="card__balance-label">Available balance</div>
            <div className="card__balance">{formatCurrency(balance)}</div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <div
          className={`card-action ${frozen ? "is-active-toggle" : ""}`}
          onClick={() => setFrozen((f) => !f)}
        >
          <IconSnowflake />
          {frozen ? "Unfreeze" : "Freeze card"}
        </div>
        <div className="card-action">
          <IconCard />
          Card details
        </div>
        <div className="card-action">
          <IconMore />
          More
        </div>
      </div>

      <div className="section-label">Markets</div>
      <div>
        {marketStatus === "loading" && (
          <div className="market-note">Loading live prices…</div>
        )}
        {marketStatus === "error" && (
          <div className="market-note">
            Couldn&apos;t load live prices right now — check your connection or try again shortly.
          </div>
        )}
        {marketStatus === "ready" && market.map((coin) => (
          <div className="market-row" key={coin.symbol}>
            <div className="market-icon">{coin.symbol.slice(0, 1)}</div>
            <div className="market-body">
              <div className="market-name">{coin.name}</div>
              <div className="market-symbol">{coin.symbol}</div>
            </div>
            <div className="market-right">
              <div className="market-price">
                {coin.price >= 1 ? formatCurrency(coin.price) : `$${coin.price.toFixed(4)}`}
              </div>
              <div className={`market-change ${coin.change > 0.005 ? "is-up" : coin.change < -0.005 ? "is-down" : "is-flat"}`}>
                {coin.change > 0 ? "+" : ""}{coin.change.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="market-note">
        Live prices via CoinGecko · refreshes every 60s · reference only, not a trading feature
      </div>

      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item">
          <IconHome />
          Home
        </a>
        <a href="/analytics" className="nav-item">
          <IconAnalytics />
          Analytics
        </a>
        <a href="/wallet" className="nav-item is-active">
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