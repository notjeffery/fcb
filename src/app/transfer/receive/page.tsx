"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// First City Bank — Receive Money
// Shows account + routing number for others to send an ACH/wire transfer
// to, plus a simple "request money" form (sends a request, doesn't move
// money itself). Mock data and mock submit — wire up real account numbers
// and a real notification/request record once the backend exists.
// ---------------------------------------------------------------------------

const mockAccount = {
  accountNumber: "2280515409",
  routingNumber: "084106768",
};

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
function IconCheck() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--credit)" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke="var(--credit)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReceiveMoney() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function copy(field: "account" | "routing", value: string) {
    navigator.clipboard?.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Replace with a real "create payment request" call — this just
    // records a request for the recipient to act on, it doesn't move funds.
    setTimeout(() => {
      setSubmitting(false);
      setRequestSent(true);
    }, 900);
  }

  return (
    <main className="receive">
      <style>{`
        .receive {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 60px;
        }
        .r-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .r-back {
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
        }
        .r-title { font-size: 17px; font-weight: 600; }

        .section-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--parchment-dim);
          margin: 24px 0 10px;
        }
        .section-label:first-of-type { margin-top: 0; }

        .details-card {
          background: linear-gradient(135deg, var(--panel) 0%, var(--ink) 100%);
          border: 1px solid var(--panel-line);
          border-radius: 14px;
          padding: 18px 20px;
        }
        .details-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--panel-line);
        }
        .details-row:last-child { border-bottom: none; }
        .details-label { font-size: 12px; color: var(--parchment-dim); }
        .details-value {
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
        }
        .copied-tag { font-size: 11px; color: var(--credit); }
        .details-hint {
          font-size: 12px;
          color: var(--parchment-dim);
          margin-top: 12px;
        }

        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 13px;
          color: var(--parchment-dim);
          margin-bottom: 8px;
        }
        .field input, .field textarea {
          width: 100%;
          padding: 14px;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 8px;
          color: var(--parchment);
          font-size: 15px;
          font-family: inherit;
        }
        .field input:focus, .field textarea:focus {
          outline: none;
          border-color: var(--brass);
        }

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

      <div className="r-header">
        <a href="/dashboard" className="r-back" aria-label="Back to dashboard">
          <IconBack />
        </a>
        <div className="r-title display">Receive money</div>
      </div>

      {!requestSent ? (
        <>
          <div className="section-label">Your account details</div>
          <div className="details-card">
            <div className="details-row">
              <span className="details-label">Account number</span>
              <span className="details-value">
                {mockAccount.accountNumber}
                <button className="copy-btn" onClick={() => copy("account", mockAccount.accountNumber)} aria-label="Copy account number">
                  <IconCopy />
                </button>
                {copiedField === "account" && <span className="copied-tag">Copied</span>}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Routing number</span>
              <span className="details-value">
                {mockAccount.routingNumber}
                <button className="copy-btn" onClick={() => copy("routing", mockAccount.routingNumber)} aria-label="Copy routing number">
                  <IconCopy />
                </button>
                {copiedField === "routing" && <span className="copied-tag">Copied</span>}
              </span>
            </div>
          </div>
          <div className="details-hint">
            Share these with anyone sending you a direct deposit, ACH, or wire transfer.
          </div>

          <div className="section-label">Or, request money from someone</div>
          <form onSubmit={handleRequest}>
            <div className="field">
              <label>Their email or phone</label>
              <input
                type="text"
                placeholder="name@email.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Amount</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="$0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Note (optional)</label>
              <textarea
                rows={2}
                placeholder="What's this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Sending request…" : "Send request"}
            </button>
          </form>
        </>
      ) : (
        <div className="success-wrap">
          <IconCheck />
          <div className="success-title display">Request sent</div>
          <div className="success-body">
            We&apos;ll let you know once {contact} responds to your request for ${amount || "0.00"}.
          </div>
          <a href="/dashboard" className="btn-primary" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}>
            Back to dashboard
          </a>
        </div>
      )}
    </main>
  );
}