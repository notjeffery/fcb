"use client";

export default function SettingsPage() {
  return (
    <main className="settings-page">
      <style>{`
        .settings-page {
          max-width: 420px;
          margin: 0 auto;
          min-height: 100vh;
          padding: 32px 24px;
        }
        .settings-title {
          font-size: 22px;
          margin-bottom: 24px;
        }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 0;
          border-bottom: 1px solid var(--panel-line);
        }
        .settings-row__label {
          font-size: 15px;
        }
        .settings-row__hint {
          font-size: 13px;
          color: var(--parchment-dim);
          margin-top: 2px;
        }
      `}</style>

      <h1 className="settings-title display">Settings</h1>

      {/* Add settings rows here as needed */}
    </main>
  );
}