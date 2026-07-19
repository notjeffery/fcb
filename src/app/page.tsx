"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// First City Bank — root route (splash -> welcome -> login)
// This is now the app's entry point, since the app is meant to be saved
// to a home screen and opened like a native app rather than a website.
// The marketing/landing content lives at /about instead.
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

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Replace with real Supabase auth call.
    setTimeout(() => {
      setSubmitting(false);
      // router.push("/dashboard")
      alert("Would route to /dashboard here.");
    }, 900);
  }

  return (
    <main className="frame">
      <style>{`
        .frame {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .screen {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity 0.45s ease, transform 0.45s ease;
          min-height: 100vh;
        }
        .screen.is-active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          position: relative;
        }
        .splash {
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 20px;
        }
        .splash__title { font-size: 22px; line-height: 1.4; }
        .splash__title strong { color: var(--brass); }

        .welcome__hero {
          flex: 1;
          border-radius: 12px;
          background: radial-gradient(circle at 50% 30%, var(--panel) 0%, var(--ink) 70%);
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
          opacity: 0.9;
          pointer-events: none;
        }
        .welcome__logo-wrap img { width: 78%; height: auto; }
        .welcome__scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 30%, var(--ink) 90%);
          opacity: 0.92;
        }
        .welcome__content { position: relative; z-index: 1; }
        .welcome__eyebrow {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--brass);
          margin-bottom: 12px;
        }
        .welcome__title { font-size: 30px; line-height: 1.15; }
        .welcome__actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }
        .welcome__actions button { width: 100%; }
        .welcome__footnote {
          text-align: center;
          font-size: 11px;
          color: var(--parchment-dim);
          margin-top: 18px;
        }

        .login__back {
          color: var(--brass);
          font-size: 20px;
          margin-bottom: 24px;
          cursor: pointer;
          width: fit-content;
          background: none;
          border: none;
        }
        .login__title { font-size: 24px; margin-bottom: 4px; }
        .login__subtitle { font-size: 14px; color: var(--parchment-dim); margin-bottom: 28px; }
        .field { margin-bottom: 20px; }
        .field__label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .field__label a { color: var(--brass); text-decoration: none; }
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
        .login__submit { width: 100%; margin-top: 8px; }
        .login__submit:disabled { opacity: 0.6; }
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
            <Image src="/logo-transparent.png" alt="First City Bank" width={280} height={230} />
          </div>
        </div>
        <div className="welcome__actions">
          <button className="btn-primary" onClick={() => setStep(STEP.LOGIN)}>
            Log in
          </button>
          <a href="/signup" className="btn-secondary" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>Open an account</a>
        </div>
      </div>

      <div className={`screen ${step === STEP.LOGIN ? "is-active" : ""}`}>
        <button className="login__back" onClick={() => setStep(STEP.WELCOME)}>
          ←
        </button>
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
          <button className="login__submit btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}