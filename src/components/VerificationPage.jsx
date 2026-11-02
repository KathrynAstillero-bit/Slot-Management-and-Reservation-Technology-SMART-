import './VerificationPage.css';
import {returnToPreviousScreen} from '../verificationNavigation.js';
import React, { useState, useEffect } from "react";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { Verify } from "./Staff.jsx";
export default function VerificationPage({
  role,
  refresh,
  notify,
  initialToken,
  toast,
}) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("ccdi-appearance") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("ccdi-appearance", theme);
    } catch {}
  }, [theme]);
  return (
    <div className="reference-shell verification-portal" data-theme={theme}>
      <div className="verification-surface">
        <header className="verification-topbar">
          <a href="/" className="verification-brand">
            <img src="/assets/ccdi-logo.png" alt="CCDI logo" />
            <span>
              CCDI Student Services
              <small>Computer Communication Development Institute</small>
            </span>
          </a>
          <button
            type="button"
            className="button secondary"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>
        <main className="reference-page verification-content">
          <Verify
            role={role}
            refresh={refresh}
            notify={notify}
            initialToken={initialToken}
          />
          <button type="button" className="button secondary verification-back" onClick={returnToPreviousScreen}>
            <ArrowLeft size={16} />
            Back to previous screen
          </button>
        </main>
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
