"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Send Money
// Internal transfer (another First City Bank account) or external ACH
// transfer (routing + account number), with a review step before confirming.
// Blocks the form entirely if the account isn't active (frozen/closed).
// Submission is mocked — wire up to a real transfer/ledger endpoint later,
// and validate routing numbers server-side (ABA checksum) before trusting them.
// ---------------------------------------------------------------------------

const STEP = { FORM: 0, REVIEW: 1, SUCCESS: 2 };

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function SendMoney() {
  const router = useRouter();
  const supabase = createClient();
  const [accountStatus, setAccountStatus] = useState<"loading" | "active" | "restricted" | "error">("loading");

  const [step, setStep] = useState(STEP.FORM);
  const [recipientType, setRecipientType] = useState<"internal" | "external">("internal");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      const { data: acct } = await supabase
        .from("accounts")
        .select("status")
        .eq("user_id", user.id)
        .single();
      if (!acct) {
        setAccountStatus("error");
        return;
      }
      setAccountStatus(acct.status === "active" ? "active" : "restricted");
    }
    check();
  }, []);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setStep(STEP.REVIEW);
  }

  function handleConfirm() {
    setSubmitting(true);
    // Replace with a real transfer call. This should be a server-side
    // operation that debits the sender and credits the recipient inside
    // a single transaction, not two separate balance writes from the client.
    setTimeout(() => {
      setSubmitting(false);
      setStep(STEP.SUCCESS);
    }, 1000);
  }

  if (accountStatus === "loading") {
    return <main style={{ padding: 24 }}>Loading…</main>;
  }

  if (accountStatus === "restricted") {
    return (
      <main style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: "28px 20px" }}>
        <a href="/dashboard" style={{ color: "var(--brass)", fontSize: 20, textDecoration: "none" }}>←</a>
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontFamily: "'Fraunces', Georgia, serif", marginBottom: 10 }}>
            Account restricted
          </div>
          <div style={{ fontSize: 14, color: "var(--parchment-dim)", marginBottom: 28 }}>
            Sending money is currently unavailable on this account. Contact
            support if you believe this is a mistake.
          </div>
          <a
            href="/dashboard"
            className="btn-primary"
            style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}
          >
            Back to dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="send">
      <style>{`
        .send {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 28px 20px 60px;
        }
        .s-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .s-back {
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
        .s-title { font-size: 17px; font-weight: 600; }

        .toggle-group {
          display: flex;
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .toggle-option {
          flex: 1;
          text-align: center;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          border: none;
          background: none;
          color: var(--parchment-dim);
        }
        .toggle-option.is-active {
          background: var(--brass);
          color: var(--ink);
          font-weight: 600;
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
        .amount-input {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 28px !important;
          text-align: center;
        }

        .review-card {
          background: var(--panel);
          border: 1px solid var(--panel-line);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .review-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--panel-line);
          font-size: 14px;
        }
        .review-row:last-child { border-bottom: none; }
        .review-row__label { color: var(--parchment-dim); }
        .review-amount {
          text-align: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 32px;
          margin-bottom: 20px;
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

      {step !== STEP.SUCCESS && (
        <div className="s-header">
          <button
            className="s-back"
            onClick={() => (step === STEP.FORM ? window.history.back() : setStep(STEP.FORM))}
            aria-label="Back"
          >
            <IconBack />
          </button>
          <div className="s-title display">Send money</div>
        </div>
      )}

      {step === STEP.FORM && (
        <form onSubmit={handleContinue}>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-option ${recipientType === "internal" ? "is-active" : ""}`}
              onClick={() => setRecipientType("internal")}
            >
              First City Bank
            </button>
            <button
              type="button"
              className={`toggle-option ${recipientType === "external" ? "is-active" : ""}`}
              onClick={() => setRecipientType("external")}
            >
              Another bank (ACH)
            </button>
          </div>

          <div className="field">
            <label>Recipient account number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          {recipientType === "external" && (
            <div className="field">
              <label>Recipient routing number</label>
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
          )}

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

          <div className="field">
            <label>Note (optional)</label>
            <textarea
              rows={2}
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="btn-primary" type="submit" style={{ width: "100%" }}>
            Continue
          </button>
        </form>
      )}

      {step === STEP.REVIEW && (
        <div>
          <div className="review-amount mono">${amount || "0.00"}</div>
          <div className="review-card">
            <div className="review-row">
              <span className="review-row__label">To</span>
              <span className="mono">•••• {accountNumber.slice(-4)}</span>
            </div>
            <div className="review-row">
              <span className="review-row__label">Transfer type</span>
              <span>{recipientType === "internal" ? "First City Bank" : "External (ACH)"}</span>
            </div>
            {recipientType === "external" && (
              <div className="review-row">
                <span className="review-row__label">Routing number</span>
                <span className="mono">{routingNumber}</span>
              </div>
            )}
            {note && (
              <div className="review-row">
                <span className="review-row__label">Note</span>
                <span>{note}</span>
              </div>
            )}
            <div className="review-row">
              <span className="review-row__label">Arrives</span>
              <span>{recipientType === "internal" ? "Instantly" : "1–3 business days"}</span>
            </div>
          </div>
          <button className="btn-primary" onClick={handleConfirm} disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Sending…" : "Confirm & send"}
          </button>
        </div>
      )}

      {step === STEP.SUCCESS && (
        <div className="success-wrap">
          <IconCheck />
          <div className="success-title display">Money sent</div>
          <div className="success-body">
            ${amount || "0.00"} is on its way{recipientType === "external" ? " and should arrive within 1–3 business days" : ""}.
          </div>
          <a href="/dashboard" className="btn-primary" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}>
            Back to dashboard
          </a>
        </div>
      )}
    </main>
  );
}