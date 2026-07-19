"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// First City Bank — Profile
// Account details, personal info, security, statements, support, legal —
// the standard sections a traditional bank's app/site includes. Mock data
// throughout; wire up to Supabase (user profile + account tables) later.
// ---------------------------------------------------------------------------

const mockUser = {
  name: "Jeffery Onyenwe",
  email: "jconyenwe@gmail.com",
  phone: "+234 •• ••• ••90",
  memberSince: "2024",
  accountNumber: "2280515409",
  routingNumber: "084106768",
  accountType: "Personal Checking",
};

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCopy() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="2" />
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

function Row({ label, hint, onClick, right }: { label: string; hint?: string; onClick?: () => void; right?: React.ReactNode }) {
  return (
    <div className="row" onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="row__left">
        <div className="row__label">{label}</div>
        {hint && <div className="row__hint">{hint}</div>}
      </div>
      {right ?? <span className="row__chevron"><IconChevron /></span>}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className="toggle" data-on={on} onClick={onToggle} aria-pressed={on}>
      <span className="toggle__knob" />
    </button>
  );
}

export default function Profile() {
  const [copied, setCopied] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  function copyAccountNumber() {
    navigator.clipboard?.writeText(mockUser.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="profile">
      <style>{`
        .profile {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 100px;
        }

        .p-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .p-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 22px;
          color: var(--brass);
        }
        .p-name { font-size: 17px; font-weight: 600; }
        .p-since { font-size: 12px; color: var(--parchment-dim); }

        .account-card {
          background: linear-gradient(135deg, var(--panel) 0%, var(--ink) 100%);
          border: 1px solid var(--panel-line);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 28px;
        }
        .account-card__type {
          font-size: 12px;
          color: var(--parchment-dim);
          margin-bottom: 10px;
        }
        .account-card__line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0;
        }
        .account-card__label { font-size: 12px; color: var(--parchment-dim); }
        .account-card__value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .copy-btn {
          background: none;
          border: none;
          color: var(--brass);
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .copied-tag {
          font-size: 11px;
          color: var(--credit);
        }

        .section-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--parchment-dim);
          margin: 24px 0 8px;
        }
        .section-label:first-of-type { margin-top: 0; }

        .list {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 12px;
          overflow: hidden;
        }
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--panel-line);
          cursor: pointer;
        }
        .row:last-child { border-bottom: none; }
        .row__label { font-size: 14px; }
        .row__hint { font-size: 12px; color: var(--parchment-dim); margin-top: 2px; }
        .row__chevron { color: var(--parchment-dim); display: flex; }

        .toggle {
          position: relative;
          width: 44px;
          height: 26px;
          border-radius: 999px;
          background: var(--panel-line);
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }
        .toggle[data-on="true"] { background: var(--brass); }
        .toggle__knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--parchment);
          transition: transform 0.2s ease;
        }
        .toggle[data-on="true"] .toggle__knob { transform: translateX(18px); }

        .signout {
          width: 100%;
          margin-top: 28px;
          padding: 14px;
          background: transparent;
          border: 1px solid var(--debit);
          color: var(--debit);
          border-radius: 10px;
          font-size: 15px;
          cursor: pointer;
        }

        .app-version {
          text-align: center;
          font-size: 11px;
          color: var(--parchment-dim);
          margin-top: 20px;
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

      <div className="p-header">
        <div className="p-avatar">{mockUser.name.charAt(0)}</div>
        <div>
          <div className="p-name">{mockUser.name}</div>
          <div className="p-since">Member since {mockUser.memberSince}</div>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card__type">{mockUser.accountType}</div>
        <div className="account-card__line">
          <span className="account-card__label">Account number</span>
          <span className="account-card__value">
            {mockUser.accountNumber}
            <button className="copy-btn" onClick={copyAccountNumber} aria-label="Copy account number">
              <IconCopy />
            </button>
            {copied && <span className="copied-tag">Copied</span>}
          </span>
        </div>
        <div className="account-card__line">
          <span className="account-card__label">Routing number</span>
          <span className="account-card__value">{mockUser.routingNumber}</span>
        </div>
      </div>

      <div className="section-label">Personal information</div>
      <div className="list">
        <Row label="Email" hint={mockUser.email} />
        <Row label="Phone number" hint={mockUser.phone} />
        <Row label="Home address" hint="Add an address" />
      </div>

      <div className="section-label">Security</div>
      <div className="list">
        <Row label="Change passcode" />
        <Row label="Two-factor authentication" hint="Recommended" />
        <Row
          label="Biometric login"
          right={<Toggle on={biometric} onToggle={() => setBiometric((b) => !b)} />}
        />
      </div>

      <div className="section-label">Banking</div>
      <div className="list">
        <Row label="Cards & wallet" />
        <Row label="Statements & documents" />
        <Row label="Beneficiaries" hint="Manage saved recipients" />
        <Row
          label="Push notifications"
          right={<Toggle on={pushNotifs} onToggle={() => setPushNotifs((p) => !p)} />}
        />
      </div>

      <div className="section-label">Support</div>
      <div className="list">
        <Row label="Help center" />
        <Row label="Contact support" />
        <Row label="Terms of service" />
        <Row label="Privacy policy" />
      </div>

      <div className="section-label">Preferences</div>
      <div className="list">
        <Row label="App settings" hint="Theme, display" />
      </div>

      <button className="signout">Sign out</button>
      <div className="app-version">First City Bank — v0.1.0</div>

      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item">
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
        <a href="/profile" className="nav-item is-active">
          <IconProfile />
          Profile
        </a>
      </nav>
    </main>
  );
}