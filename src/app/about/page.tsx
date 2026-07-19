"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// First City Bank — Landing Page
// Working name, subject to legal review re: "Bank" naming restrictions.
// ---------------------------------------------------------------------------

const passbookEntries = [
  { label: "Payroll deposit", amount: "+2,450.00", type: "credit" },
  { label: "Rent — Autopay", amount: "-1,200.00", type: "debit" },
  { label: "Transfer from J. Aro", amount: "+300.00", type: "credit" },
  { label: "Groceries", amount: "-84.12", type: "debit" },
  { label: "Interest earned", amount: "+4.18", type: "credit" },
];

function Passbook() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= passbookEntries.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 650);
    return () => clearTimeout(t);
  }, [visibleCount]);

  return (
    <div className="passbook">
      <div className="passbook__cover">
        <span className="passbook__eyebrow">Account passbook</span>
        <span className="passbook__number">**** **** **** 4471</span>
      </div>
      <div className="passbook__ledger">
        <div className="passbook__ledger-head">
          <span>Description</span>
          <span>Amount</span>
        </div>
        {passbookEntries.map((entry, i) => (
          <div
            key={entry.label}
            className={`passbook__row ${i < visibleCount ? "is-stamped" : ""}`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <span className="passbook__row-label">{entry.label}</span>
            <span
              className={`passbook__row-amount ${
                entry.type === "credit" ? "is-credit" : "is-debit"
              }`}
            >
              {entry.amount}
            </span>
            {i < visibleCount && <span className="passbook__stamp">POSTED</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="page">
      <style>{`
        .page {
          background: var(--ink);
          color: var(--parchment);
          font-family: 'Inter', -apple-system, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .display {
          font-family: 'Fraunces', Georgia, serif;
        }

        .mono {
          font-family: 'IBM Plex Mono', 'Courier New', monospace;
        }

        /* Nav */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px clamp(20px, 5vw, 72px);
          border-bottom: 1px solid var(--panel-line);
        }

        .nav__mark {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 18px;
          letter-spacing: 0.02em;
          color: var(--parchment);
        }

        .nav__mark img {
          height: 32px;
          width: auto;
        }

        .nav__links {
          display: flex;
          gap: 32px;
          font-size: 14px;
          color: var(--parchment-dim);
        }

        .nav__links a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .nav__links a:hover,
        .nav__links a:focus-visible {
          color: var(--parchment);
        }

        .nav__cta {
          padding: 10px 20px;
          border: 1px solid var(--brass);
          border-radius: 2px;
          color: var(--brass);
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .nav__cta:hover,
        .nav__cta:focus-visible {
          background: var(--brass);
          color: var(--ink);
        }

        /* Hero */
        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          align-items: center;
          padding: clamp(48px, 8vw, 96px) clamp(20px, 5vw, 72px);
          max-width: 1280px;
          margin: 0 auto;
        }

        @media (max-width: 880px) {
          .hero { grid-template-columns: 1fr; }
        }

        .hero__eyebrow {
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass);
          margin-bottom: 20px;
        }

        .hero__title {
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1.08;
          margin: 0 0 24px;
          font-weight: 500;
        }

        .hero__title em {
          font-style: italic;
          color: var(--brass);
        }

        .hero__body {
          font-size: 17px;
          line-height: 1.6;
          color: var(--parchment-dim);
          max-width: 46ch;
          margin-bottom: 36px;
        }

        .hero__actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 14px 28px;
          background: var(--brass);
          color: var(--ink);
          border: none;
          border-radius: 2px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .btn-primary:hover,
        .btn-primary:focus-visible {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(184, 146, 90, 0.25);
        }

        .btn-secondary {
          padding: 14px 28px;
          background: transparent;
          color: var(--parchment);
          border: 1px solid var(--panel-line);
          border-radius: 2px;
          font-size: 15px;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }

        .btn-secondary:hover,
        .btn-secondary:focus-visible {
          border-color: var(--parchment-dim);
        }

        /* Passbook signature element */
        .passbook {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 4px;
          transform: rotate(-2deg);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .passbook__cover {
          padding: 22px 24px;
          border-bottom: 1px dashed var(--panel-line);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .passbook__eyebrow {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--parchment-dim);
        }

        .passbook__number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          color: var(--brass);
        }

        .passbook__ledger {
          padding: 20px 24px 26px;
        }

        .passbook__ledger-head {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--parchment-dim);
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--panel-line);
        }

        .passbook__row {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.45s ease, transform 0.45s ease;
          border-bottom: 1px solid rgba(38, 55, 78, 0.5);
        }

        .passbook__row.is-stamped {
          opacity: 1;
          transform: translateY(0);
        }

        .passbook__row-label {
          font-size: 14px;
          color: var(--parchment);
        }

        .passbook__row-amount {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }

        .is-credit { color: var(--credit); }
        .is-debit { color: var(--debit); }

        .passbook__stamp {
          position: absolute;
          right: 0;
          top: -2px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--credit);
          border: 1px solid var(--credit);
          padding: 1px 5px;
          border-radius: 2px;
          transform: rotate(-8deg) translateY(-14px);
          opacity: 0.85;
        }

        /* Features */
        .features {
          padding: clamp(48px, 8vw, 96px) clamp(20px, 5vw, 72px);
          border-top: 1px solid var(--panel-line);
          max-width: 1280px;
          margin: 0 auto;
        }

        .features__head {
          max-width: 56ch;
          margin-bottom: 48px;
        }

        .features__eyebrow {
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass);
          margin-bottom: 16px;
        }

        .features__title {
          font-size: clamp(26px, 3vw, 34px);
          line-height: 1.2;
          font-weight: 500;
        }

        .features__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--panel-line);
          border: 1px solid var(--panel-line);
        }

        @media (max-width: 880px) {
          .features__grid { grid-template-columns: 1fr; }
        }

        .feature {
          background: var(--ink);
          padding: 32px 28px;
        }

        .feature__index {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--brass);
          margin-bottom: 16px;
        }

        .feature__title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .feature__body {
          font-size: 14px;
          line-height: 1.6;
          color: var(--parchment-dim);
        }

        /* Footer */
        .footer {
          padding: 32px clamp(20px, 5vw, 72px);
          border-top: 1px solid var(--panel-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: var(--parchment-dim);
        }

        @media (prefers-reduced-motion: reduce) {
          .passbook__row {
            transition: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <nav className="nav">
        <div className="nav__mark">
          <Image src="/logo-transparent.png" alt="First City Bank" width={32} height={26} priority />
          First City Bank
        </div>
        <div className="nav__links">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#">Support</a>
        </div>
        <a href="/" className="nav__cta">
          Sign in
        </a>
      </nav>

      <section className="hero">
        <div>
          <div className="hero__eyebrow">Banking, kept in the open</div>
          <h1 className="hero__title display">
            Every deposit, <em>recorded</em>. Every transfer, <em>traceable</em>.
          </h1>
          <p className="hero__body">
            First City Bank gives you a checking account that moves at the speed
            of a modern wallet, but keeps a record as plain and accountable as
            a passbook — because every dollar in your account should be one
            you can trace back to where it came from.
          </p>
          <div className="hero__actions">
            <button className="btn-primary">Open an account</button>
            <button className="btn-secondary">See how it works</button>
          </div>
        </div>
        <Passbook />
      </section>

      <section className="features" id="features">
        <div className="features__head">
          <div className="features__eyebrow">How money moves</div>
          <h2 className="features__title display">
            Built for people who want to see exactly where their money is
            at every step.
          </h2>
        </div>
        <div className="features__grid">
          <div className="feature">
            <div className="feature__index mono">01</div>
            <div className="feature__title">Instant transfers</div>
            <div className="feature__body">
              Send and receive money between First City Bank accounts in
              seconds, with a running record of every transfer in and out.
            </div>
          </div>
          <div className="feature">
            <div className="feature__index mono">02</div>
            <div className="feature__title">Verified deposits</div>
            <div className="feature__body">
              Incoming deposits are confirmed and posted by our team, so
              your balance always reflects money that's actually arrived.
            </div>
          </div>
          <div className="feature">
            <div className="feature__index mono">03</div>
            <div className="feature__title">A full paper trail</div>
            <div className="feature__body">
              Every credit and debit is logged with a timestamp and a
              reference, so nothing ever changes without a record of why.
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>© 2026 First City Bank. Working name — subject to change.</span>
        <span className="mono">FDIC copy pending — do not launch without it</span>
      </footer>
    </main>
  );
}