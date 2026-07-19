"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Admin login
// Deliberately NOT a shared password. Each admin signs in with their own
// Supabase account, then we check the admin_users table to confirm they're
// actually allowed in here. This keeps every admin action attributable to
// a specific person — important once this tool can create real accounts
// and post real transactions.
// ---------------------------------------------------------------------------

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!adminRow) {
      setError("This account doesn't have admin access.");
      await supabase.auth.signOut();
      setSubmitting(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="admin-login">
      <style>{`
        .admin-login {
          max-width: 400px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px;
        }
        .al-title { font-size: 22px; margin-bottom: 4px; }
        .al-subtitle { font-size: 13px; color: var(--parchment-dim); margin-bottom: 28px; }
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
      `}</style>

      <div className="al-title display">First City Bank — Admin</div>
      <div className="al-subtitle">Sign in with your admin account.</div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}