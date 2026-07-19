"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// First City Bank — Add Funds
// Three standard ways US banks let you fund an account: pull from a linked
// external account (ACH), a debit card top-up, or mobile check deposit.
// All mocked. Real versions:
//  - Linked account: needs account verification (Plaid or micro-deposits),
//    not just a typed-in account number.
//  - Debit card: needs a real card processor (Stripe, etc.), never store
//    raw card numbers yourself.
//  - Check deposit: needs real image capture + a check-processing vendor.
// ---------------------------------------------------------------------------

type Method = "menu" | "linked" | "card" | "check";

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBank() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 10l9-6 9 6M4 10v9h16v-9M9 19v-6M15 19v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h3l2-2h6l2 2h3v11H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--credit)" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke="var(--credit)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AddFunds() {
  const [method, setMethod] = useState<Method>("menu");
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1000);
  }

  function reset() {
    setMethod("menu");
    setSuccess(false);
    setAmount("");
    setAccountNumber("");
    setRoutingNumber("");
    setCardNumber("");
  }

  return (
    <main className="add-funds">
      <style>{`
        .add-funds {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 60px;
        }
        .af-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .af-back {
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
          text-decoration: none;
          background-color: var(--panel);
        }
        .af-title { font-size: 17px; font-weight: 600; }

        .method-list {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 12px;
          overflow: hidden;
        }
        .method-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-bottom: 1px solid var(--panel-line);
          cursor: pointer;
        }
        .method-row:last-child { border-bottom: none; }
        .method-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--ink);
          border: 1px solid var(--panel-line);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brass);
          flex-shrink: 0;
        }
        .method-body { flex: 1; }
        .method-label { font-size: 14px; }
        .method-hint { font-size: 12px; color: var(--parchment-dim); margin-top: 2px; }
        .method-chevron { color: var(--parchment-dim); display: flex; }

        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 13px;
          color: var(--parchment-dim);
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          padding: 14px;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 8px;
          color: var(--parchment);
          font-size: 15px;
        }
        .field input:focus { outline: none; border-color: var(--brass); }
        .amount-input {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 28px !important;
          text-align: center;
        }

        .check-illustration {
          background: var(--panel);
          border: 1px dashed var(--panel-line);
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          color: var(--parchment-dim);
          margin-bottom: 20px;
        }
        .check-illustration svg { color: var(--brass); margin-bottom: 12px; }

        .success-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-top: 60px;
        }
        .success-title { font-size: 20px; margin: 20px 0 6px; }
        .success-body { font-size: 14px; color: var(--parchment-dim); margin-bottom: 32px; }
      `}</style>

      {!success && (
        <div className="af-header">
          <button
            className="af-back"
            onClick={() => (method === "menu" ? window.history.back() : setMethod("menu"))}
            aria-label="Back"
          >
            <IconBack />
          </button>
          <div className="af-title display">Add funds</div>
        </div>
      )}

      {success && (
        <div className="success-wrap">
          <IconCheck />
          <div className="success-title display">
            {method === "check" ? "Check submitted" : "Funds added"}
          </div>
          <div className="success-body">
            {method === "check"
              ? "Your check is being reviewed — deposits like this usually clear within 1–2 business days."
              : method === "card"
              ? `$${amount || "0.00"} was added from your card instantly.`
              : `$${amount || "0.00"} is on its way from your linked account — usually 1–3 business days.`}
          </div>
          <a href="/dashboard" className="btn-primary" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}>
            Back to dashboard
          </a>
        </div>
      )}

      {!success && method === "menu" && (
        <div className="method-list">
          <div className="method-row" onClick={() => setMethod("linked")}>
            <div className="method-icon"><IconBank /></div>
            <div className="method-body">
              <div className="method-label">Transfer from a linked account</div>
              <div className="method-hint">1–3 business days · no fee</div>
            </div>
            <span className="method-chevron"><IconChevron /></span>
          </div>
          <div className="method-row" onClick={() => setMethod("card")}>
            <div className="method-icon"><IconCard /></div>
            <div className="method-body">
              <div className="method-label">Add via debit card</div>
              <div className="method-hint">Instant · card fee may apply</div>
            </div>
            <span className="method-chevron"><IconChevron /></span>
          </div>
          <div className="method-row" onClick={() => setMethod("check")}>
            <div className="method-icon"><IconCamera /></div>
            <div className="method-body">
              <div className="method-label">Mobile check deposit</div>
              <div className="method-hint">1–2 business days to clear</div>
            </div>
            <span className="method-chevron"><IconChevron /></span>
          </div>
        </div>
      )}

      {!success && method === "linked" && (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>External account number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Routing number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="9-digit routing number"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              maxLength={9}
              required
            />
          </div>
          <div className="field">
            <label>Amount</label>
            <input
              className="amount-input"
              type="text"
              inputMode="decimal"
              placeholder="$0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Processing…" : "Transfer funds"}
          </button>
        </form>
      )}

      {!success && method === "card" && (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Card number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="•••• •••• •••• ••••"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Amount</label>
            <input
              className="amount-input"
              type="text"
              inputMode="decimal"
              placeholder="$0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Processing…" : "Add funds"}
          </button>
        </form>
      )}

      {!success && method === "check" && (
        <form onSubmit={handleSubmit}>
          <div className="check-illustration">
            <IconCamera />
            <div>Camera capture would go here — front and back of check</div>
          </div>
          <div className="field">
            <label>Check amount</label>
            <input
              className="amount-input"
              type="text"
              inputMode="decimal"
              placeholder="$0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Submitting…" : "Submit check"}
          </button>
        </form>
      )}
    </main>
  );
}