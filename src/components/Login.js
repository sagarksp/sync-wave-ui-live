import React, { useState } from "react";

const ACCOUNTS = [
  { id: "user_sagar", name: "Sagar", avatar: "S" },
  { id: "user_alex", name: "Alex", avatar: "A" },
  { id: "user_demo", name: "Demo", avatar: "D" },
];

const DEVICES = ["Living Room", "Bedroom", "Office", "Mobile", "Laptop"];

export default function Login({ onLogin }) {
  const [acc, setAcc] = useState(null);
  const [device, setDevice] = useState("Mobile");
  const [custom, setCustom] = useState("");

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-mark">SW</span>
          <span className="logo-name">SyncWave</span>
        </div>
        <p className="login-sub">Real music. All devices. In sync.</p>

        <div className="lsection">
          <div className="lsection-label">Account</div>
          {ACCOUNTS.map((a) => (
            <button key={a.id} className={`acc-row ${acc?.id === a.id ? "sel" : ""}`} onClick={() => setAcc(a)}>
              <span className="acc-av">{a.avatar}</span>
              <span className="acc-name">{a.name}</span>
              {acc?.id === a.id && <span className="acc-check">Selected</span>}
            </button>
          ))}
        </div>

        <div className="lsection">
          <div className="lsection-label">This device</div>
          <div className="device-chips">
            {DEVICES.map((d) => (
              <button
                key={d}
                className={`chip ${device === d && !custom ? "sel" : ""}`}
                onClick={() => {
                  setDevice(d);
                  setCustom("");
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <input
            className="custom-input"
            placeholder="Custom name..."
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </div>

        <button
          className={`login-btn ${!acc ? "disabled" : ""}`}
          disabled={!acc}
          onClick={() => acc && onLogin(acc.id, custom || device)}
        >
          Connect
        </button>

        <p className="login-hint">Tip: open in 3 tabs with the same account to test real-time sync</p>
      </div>
    </div>
  );
}
