"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// First City Bank — Profile
// Real data now: profile + account info from Supabase. Full name, email,
// and password are editable directly by the signed-in user. Email changes
// go through Supabase's normal confirmation-email flow — the new address
// isn't active until the user clicks the link sent to it.
// ---------------------------------------------------------------------------

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

function EditableRow({
  label,
  value,
  editing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  saving,
  inputType = "text",
}: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  inputType?: string;
}) {
  if (editing) {
    return (
      <div className="row row--editing">
        <div className="row__edit-form">
          <label className="row__edit-label">{label}</label>
          <input
            className="row__edit-input"
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <div className="row__edit-actions">
            <button className="row__edit-save" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="row__edit-cancel" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="row" onClick={onEdit} role="button">
      <div className="row__left">
        <div className="row__label">{label}</div>
        <div className="row__hint">{value || "Not set"}</div>
      </div>
      <span className="row__chevron"><IconChevron /></span>
    </div>
  );
}

export default function Profile() {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountType, setAccountType] = useState("");

  const [editingField, setEditingField] = useState<"name" | "email" | "phone" | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [savingField, setSavingField] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const [passwordMode, setPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [copied, setCopied] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone, member_since")
      .eq("id", user.id)
      .single();

    const { data: account } = await supabase
      .from("accounts")
      .select("account_number, routing_number, account_type")
      .eq("user_id", user.id)
      .single();

    if (!profile || !account) {
      setStatus("error");
      return;
    }

    setFullName(profile.full_name);
    setEmail(profile.email);
    setPhone(profile.phone ?? "");
    setMemberSince(new Date(profile.member_since).getFullYear().toString());
    setAccountNumber(account.account_number);
    setRoutingNumber(account.routing_number);
    setAccountType(account.account_type);
    setStatus("ready");
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(field: "name" | "email" | "phone", currentValue: string) {
    setEditingField(field);
    setDraftValue(currentValue);
    setFieldError("");
  }

  async function saveField() {
    setSavingField(true);
    setFieldError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (editingField === "name") {
        const { error } = await supabase.from("profiles").update({ full_name: draftValue }).eq("id", user.id);
        if (error) throw error;
        setFullName(draftValue);
      } else if (editingField === "phone") {
        const { error } = await supabase.from("profiles").update({ phone: draftValue }).eq("id", user.id);
        if (error) throw error;
        setPhone(draftValue);
      } else if (editingField === "email") {
        // This sends a confirmation link to the new address — the email
        // doesn't actually change until the user clicks it.
        const { error } = await supabase.auth.updateUser({ email: draftValue });
        if (error) throw error;
        alert("Check your new email address for a confirmation link — the change won't apply until you click it.");
      }
      setEditingField(null);
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Couldn't save that change.");
    } finally {
      setSavingField(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
    setPasswordMode(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function copyAccountNumber() {
    navigator.clipboard?.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (status === "loading") return <main style={{ padding: 24 }}>Loading…</main>;
  if (status === "error") return <main style={{ padding: 24 }}>Couldn&apos;t load your profile.</main>;

  return (
    <main className="profile">
      <style>{`
        .profile { max-width: 420px; margin: 0 auto; min-height: 100vh; padding: 28px 20px 100px; }
        .p-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .p-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--panel); border: 1px solid var(--panel-line);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', Georgia, serif; font-size: 22px; color: var(--brass);
        }
        .p-name { font-size: 17px; font-weight: 600; }
        .p-since { font-size: 12px; color: var(--parchment-dim); }

        .account-card {
          background: linear-gradient(135deg, var(--panel) 0%, var(--ink) 100%);
          border: 1px solid var(--panel-line); border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;
        }
        .account-card__type { font-size: 12px; color: var(--parchment-dim); margin-bottom: 10px; text-transform: capitalize; }
        .account-card__line { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
        .account-card__label { font-size: 12px; color: var(--parchment-dim); }
        .account-card__value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .copy-btn { background: none; border: none; color: var(--brass); cursor: pointer; display: flex; align-items: center; }
        .copied-tag { font-size: 11px; color: var(--credit); }

        .section-label {
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--parchment-dim); margin: 24px 0 8px;
        }
        .section-label:first-of-type { margin-top: 0; }

        .list { background: var(--panel); border: 1px solid var(--panel-line); border-radius: 12px; overflow: hidden; }
        .row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--panel-line); cursor: pointer; }
        .row:last-child { border-bottom: none; }
        .row__label { font-size: 14px; }
        .row__hint { font-size: 12px; color: var(--parchment-dim); margin-top: 2px; }
        .row__chevron { color: var(--parchment-dim); display: flex; }

        .row--editing { padding: 14px 16px; border-bottom: 1px solid var(--panel-line); cursor: default; }
        .row__edit-form { width: 100%; }
        .row__edit-label { display: block; font-size: 12px; color: var(--parchment-dim); margin-bottom: 6px; }
        .row__edit-input {
          width: 100%; padding: 10px 12px; background: var(--ink); border: 1px solid var(--panel-line);
          border-radius: 6px; color: var(--parchment); font-size: 14px; margin-bottom: 10px;
        }
        .row__edit-input:focus { outline: none; border-color: var(--brass); }
        .row__edit-actions { display: flex; gap: 10px; }
        .row__edit-save {
          background: var(--brass); color: var(--ink); border: none; border-radius: 6px;
          padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .row__edit-cancel {
          background: none; color: var(--parchment-dim); border: 1px solid var(--panel-line);
          border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer;
        }
        .field-error { font-size: 12px; color: var(--debit); margin-top: 8px; }

        .toggle {
          position: relative; width: 44px; height: 26px; border-radius: 999px;
          background: var(--panel-line); border: none; cursor: pointer; transition: background 0.2s ease; flex-shrink: 0;
        }
        .toggle[data-on="true"] { background: var(--brass); }
        .toggle__knob {
          position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
          border-radius: 50%; background: var(--parchment); transition: transform 0.2s ease;
        }
        .toggle[data-on="true"] .toggle__knob { transform: translateX(18px); }

        .password-form { padding: 14px 16px; }
        .password-form input {
          width: 100%; padding: 10px 12px; background: var(--ink); border: 1px solid var(--panel-line);
          border-radius: 6px; color: var(--parchment); font-size: 14px; margin-bottom: 10px;
        }
        .password-success { font-size: 12px; color: var(--credit); padding: 0 16px 14px; }

        .signout { width: 100%; margin-top: 28px; padding: 14px; background: transparent; border: 1px solid var(--debit); color: var(--debit); border-radius: 10px; font-size: 15px; cursor: pointer; }
        .app-version { text-align: center; font-size: 11px; color: var(--parchment-dim); margin-top: 20px; }

        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; max-width: 420px; margin: 0 auto;
          background: var(--panel); border-top: 1px solid var(--panel-line);
          display: flex; justify-content: space-around; padding: 14px 0 18px;
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--parchment-dim); font-size: 11px; background: none; border: none; cursor: pointer; text-decoration: none; }
        .nav-item.is-active { color: var(--brass); }
      `}</style>

      <div className="p-header">
        <div className="p-avatar">{fullName.charAt(0)}</div>
        <div>
          <div className="p-name">{fullName}</div>
          <div className="p-since">Member since {memberSince}</div>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card__type">{accountType} account</div>
        <div className="account-card__line">
          <span className="account-card__label">Account number</span>
          <span className="account-card__value">
            {accountNumber}
            <button className="copy-btn" onClick={copyAccountNumber} aria-label="Copy account number">
              <IconCopy />
            </button>
            {copied && <span className="copied-tag">Copied</span>}
          </span>
        </div>
        <div className="account-card__line">
          <span className="account-card__label">Routing number</span>
          <span className="account-card__value">{routingNumber}</span>
        </div>
      </div>

      <div className="section-label">Personal information</div>
      <div className="list">
        <EditableRow
          label="Full name"
          value={fullName}
          editing={editingField === "name"}
          onEdit={() => startEdit("name", fullName)}
          onChange={setDraftValue}
          onSave={saveField}
          onCancel={() => setEditingField(null)}
          saving={savingField}
        />
        {editingField === "name" && fieldError && <div className="field-error" style={{ padding: "0 16px 10px" }}>{fieldError}</div>}

        <EditableRow
          label="Email"
          value={email}
          editing={editingField === "email"}
          onEdit={() => startEdit("email", email)}
          onChange={setDraftValue}
          onSave={saveField}
          onCancel={() => setEditingField(null)}
          saving={savingField}
          inputType="email"
        />
        {editingField === "email" && fieldError && <div className="field-error" style={{ padding: "0 16px 10px" }}>{fieldError}</div>}

        <EditableRow
          label="Phone number"
          value={phone}
          editing={editingField === "phone"}
          onEdit={() => startEdit("phone", phone)}
          onChange={setDraftValue}
          onSave={saveField}
          onCancel={() => setEditingField(null)}
          saving={savingField}
        />
      </div>

      <div className="section-label">Security</div>
      <div className="list">
        {!passwordMode ? (
          <div className="row" onClick={() => { setPasswordMode(true); setPasswordSuccess(false); }}>
            <div className="row__left">
              <div className="row__label">Change password</div>
            </div>
            <span className="row__chevron"><IconChevron /></span>
          </div>
        ) : (
          <form className="password-form" onSubmit={savePassword}>
            {passwordError && <div className="field-error" style={{ marginBottom: 10 }}>{passwordError}</div>}
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="row__edit-save" type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Saving…" : "Save"}
              </button>
              <button
                className="row__edit-cancel"
                type="button"
                onClick={() => { setPasswordMode(false); setNewPassword(""); setConfirmPassword(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {passwordSuccess && <div className="password-success">Password updated.</div>}
        <div className="row">
          <div className="row__left">
            <div className="row__label">Biometric login</div>
          </div>
          <button className="toggle" data-on={biometric} onClick={() => setBiometric((b) => !b)} aria-pressed={biometric}>
            <span className="toggle__knob" />
          </button>
        </div>
      </div>

      <div className="section-label">Banking</div>
      <div className="list">
        <div className="row" onClick={() => router.push("/wallet")}>
          <div className="row__left"><div className="row__label">Cards & wallet</div></div>
          <span className="row__chevron"><IconChevron /></span>
        </div>
        <div className="row">
          <div className="row__left"><div className="row__label">Push notifications</div></div>
          <button className="toggle" data-on={pushNotifs} onClick={() => setPushNotifs((p) => !p)} aria-pressed={pushNotifs}>
            <span className="toggle__knob" />
          </button>
        </div>
      </div>

      <div className="section-label">Preferences</div>
      <div className="list">
        <div className="row" onClick={() => router.push("/settings")}>
          <div className="row__left">
            <div className="row__label">App settings</div>
            <div className="row__hint">Theme, display</div>
          </div>
          <span className="row__chevron"><IconChevron /></span>
        </div>
      </div>

      <button className="signout" onClick={handleSignOut}>Sign out</button>
      <div className="app-version">First City Bank — v0.1.0 (working build)</div>

      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item"><IconHome />Home</a>
        <a href="/analytics" className="nav-item"><IconAnalytics />Analytics</a>
        <a href="/wallet" className="nav-item"><IconWallet />Wallet</a>
        <a href="/profile" className="nav-item is-active"><IconProfile />Profile</a>
      </nav>
    </main>
  );
}