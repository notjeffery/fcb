"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Sign up
// Creates a real Supabase Auth user, then creates the matching accounts row
// (account number + routing number). The profiles row is created
// automatically by the database trigger from schema.sql.
//
// Note on email confirmation: if your Supabase project has "Confirm email"
// turned on (Authentication > Providers > Email in the dashboard — on by
// default), signUp() won't return a usable session until the user clicks
// the confirmation link in their inbox. This page handles both cases.
// ---------------------------------------------------------------------------

const BANK_ROUTING_NUMBER = "084106768"; // kept here only for reference — account creation now happens via the database trigger

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (passcode !== confirmPasscode) {
      setError("Passcodes don't match.");
      return;
    }
    if (passcode.length < 6) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: passcode,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }

      if (!data.session || !data.user) {
        // Email confirmation is required before a session exists.
        setNeedsConfirmation(true);
        setSubmitting(false);
        return;
      }

      // Update phone on the auto-created profile row. The account row
      // (account number, routing number) is created automatically by the
      // database trigger — no client-side step needed for it.
      if (phone) {
        await supabase.from("profiles").update({ phone }).eq("id", data.user.id);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="signup">
      <style>{`
        .signup {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 32px 24px;
        }
        .su-title { font-size: 24px; margin-bottom: 4px; }
        .su-subtitle { font-size: 14px; color: var(--parchment-dim); margin-bottom: 28px; }
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
        .error-box {
          background: rgba(201, 123, 99, 0.12);
          border: 1px solid var(--debit);
          color: var(--debit);
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 18px;
        }
        .confirm-box {
          text-align: center;
          padding-top: 60px;
        }
        .confirm-title { font-size: 20px; margin-bottom: 10px; }
        .confirm-body { font-size: 14px; color: var(--parchment-dim); }
        .signin-link {
          text-align: center;
          font-size: 13px;
          color: var(--parchment-dim);
          margin-top: 20px;
        }
        .signin-link a { color: var(--brass); text-decoration: none; }
      `}</style>

      {needsConfirmation ? (
        <div className="confirm-box">
          <div className="confirm-title display">Check your email</div>
          <div className="confirm-body">
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then come back and log in.
          </div>
        </div>
      ) : (
        <>
          <div className="su-title display">Open an account</div>
          <div className="su-subtitle">It only takes a minute.</div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="field">
              <label>Create a passcode</label>
              <input
                type="password"
                inputMode="numeric"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="field">
              <label>Confirm passcode</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Creating account…" : "Open account"}
            </button>
          </form>

          <div className="signin-link">
            Already have an account? <a href="/">Log in</a>
          </div>
        </>
      )}
    </main>
  );
}