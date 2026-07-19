"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// First City Bank — Mobile auth flow (splash -> welcome -> login)
// Working name. On submit, route to /dashboard (or call your
// Supabase auth + balance fetch here instead of the mock timeout below).
// ---------------------------------------------------------------------------

const STEP = { SPLASH: 0, WELCOME: 1, LOGIN: 2 };

export default function AuthFlow() {
  const [step, setStep] = useState(STEP.SPLASH);
  const [accountNumber, setAccountNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (step !== STEP.SPLASH) return;
    const t = setTimeout(() => setStep(STEP.WELCOME), 1600);
    return () => clearTimeout(t);
  }, [step]);

  function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    // Replace with real Supabase auth call. Keeping a short mock delay
    // here just so the loading state has something to show in review.
    setTimeout(() => {
      setSubmitting(false);
      // router.push("/dashboard")
      alert("Would route to /dashboard here.");
    }, 900);
  }

  return (
    <main className="frame">
      <style>{`
        :root {
          --ink: #0F1B2D;
          --panel: #16263D;
          --panel-line: #26374E;
          --parchment: #ECE6D6;
          --parchment-dim: #A8AC9E;
          --brass: #B8925A;
          --credit: #6FA287;
          --debit: #C97B63;
        }
        * { box-sizing: border-box; }
        .frame {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--ink);
          color: var(--parchment);
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .display { font-family: 'Fraunces', Georgia, serif; }
        .mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; }

        .screen {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .screen.is-active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          position: relative;
        }

        /* Splash */
        .splash {
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 20px;
        }
        .splash__title {
          font-size: 22px;
          line-height: 1.4;
        }
        .splash__title strong { color: var(--brass); }

        /* Welcome */
        .welcome__hero {
          flex: 1;
          border-radius: 12px;
          background: radial-gradient(circle at 50% 30%, #1c2f4a 0%, var(--ink) 70%);
          border: 1px solid var(--panel-line);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 28px 22px;
          margin-top: 24px;
          position: relative;
          overflow: hidden;
        }
        .welcome__logo-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.16;
          pointer-events: none;
        }
        .welcome__logo-wrap img {
          width: 78%;
          height: auto;
        }
        .welcome__scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15,27,45,0) 30%, rgba(15,27,45,0.92) 78%);
        }
        .welcome__content {
          position: relative;
          z-index: 1;
        }
        .welcome__eyebrow {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--brass);
          margin-bottom: 12px;
        }
        .welcome__title {
          font-size: 30px;
          line-height: 1.15;
          margin-bottom: 12px;
        }
        .welcome__body {
          font-size: 14px;
          color: var(--parchment-dim);
          line-height: 1.5;
          margin-bottom: 4px;
        }
        .welcome__actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }
        .welcome__footnote {
          text-align: center;
          font-size: 11px;
          color: var(--parchment-dim);
          margin-top: 18px;
        }
        .btn-primary {
          padding: 15px;
          background: var(--brass);
          color: var(--ink);
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
        }
        .btn-secondary {
          padding: 15px;
          background: transparent;
          color: var(--parchment);
          border: 1px solid var(--panel-line);
          border-radius: 8px;
          font-size: 15px;
        }

        /* Login */
        .login__back {
          color: var(--brass);
          font-size: 20px;
          margin-bottom: 24px;
          cursor: pointer;
          width: fit-content;
        }
        .login__title {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .login__subtitle {
          font-size: 14px;
          color: var(--parchment-dim);
          margin-bottom: 28px;
        }
        .field { margin-bottom: 20px; }
        .field__label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .field__label a {
          color: var(--brass);
          text-decoration: none;
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
        .field input:focus {
          outline: none;
          border-color: var(--brass);
        }
        .login__submit {
          margin-top: 8px;
          padding: 15px;
          background: var(--brass);
          color: var(--ink);
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
        }
        .login__submit:disabled {
          opacity: 0.6;
        }
      `}</style>

      <div className={`screen splash ${step === STEP.SPLASH ? "is-active" : ""}`}>
        <Image src="/logo-transparent.png" alt="First City Bank" width={110} height={90} />
        <div className="splash__title display">
          Welcome to the
          <br />
          <strong>First City Bank</strong> app
        </div>
      </div>

      <div className={`screen ${step === STEP.WELCOME ? "is-active" : ""}`}>
        <div className="welcome__hero">
          <div className="welcome__logo-wrap">
            <Image src="/logo-transparent.png" alt="" width={400} height={330} />
          </div>
          <div className="welcome__scrim" />
          <div className="welcome__content">
            <div className="welcome__eyebrow">Banking, kept in the open</div>
            <div className="welcome__title display">
              Every deposit, recorded.
              <br />
              Every transfer, traceable.
            </div>
          </div>
        </div>
        <div className="welcome__actions">
          <button className="btn-primary" onClick={() => setStep(STEP.LOGIN)}>
            Log in
          </button>
          <button className="btn-secondary">Open an account</button>
        </div>
        <div className="welcome__footnote">
          First City Bank — working name, subject to change
        </div>
      </div>

      <div className={`screen ${step === STEP.LOGIN ? "is-active" : ""}`}>
        <div className="login__back" onClick={() => setStep(STEP.WELCOME)}>
          ←
        </div>
        <div className="login__title display">Welcome back</div>
        <div className="login__subtitle">Log in to your account</div>
        <form onSubmit={handleLogin}>
          <div className="field">
            <div className="field__label">
              <span>Account number</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter your account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <div className="field__label">
              <span>Passcode</span>
              <a href="#">Forgot passcode</a>
            </div>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter your passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />
          </div>
          <button className="login__submit" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}