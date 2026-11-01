import "./Login.css";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { demoAccounts } from "../api.js";
import Modal from "./Modal.jsx";
import CaptchaChallenge from "./Captcha.jsx";
import { passwordChecks } from "../passwordRules.js";
import AppearanceToggle from "./AppearanceToggle.jsx";

import "./LoginTheme.css";

const roleIcons = {
  student: BookOpen,
  cashier: Wallet,
  accounting: Calculator,
  admin: ShieldCheck,
};
const roleLabel = (role) => role.charAt(0).toUpperCase() + role.slice(1);

function PasswordGuide({ value }) {
  const rules = passwordChecks(value);
  const items = [
    ["Use at least 12 characters.", rules.longEnough],
    ["Include at least 1 uppercase letter.", rules.hasUppercase],
    ["Include at least 1 number or symbol.", rules.hasNumberOrSymbol],
  ];
  return (
    <div className="password-guidelines" id="ref-auth-password-rules">
      <strong>Password guidelines</strong>
      {items.map(([text, met]) => (
        <p
          key={text}
          className={met ? "is-met" : rules.longEnough ? "is-unmet" : ""}
        >
          <span aria-hidden="true">
            {met ? "✓" : rules.longEnough ? "✕" : "○"}
          </span>{" "}
          {text}
        </p>
      ))}
    </div>
  );
}
export default function Login({ onLogin, onHelp, theme, setTheme }) {
  const [mode, setMode] = useState("signin");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimer = useRef(null);
  const transitionLock = useRef(false);
  useEffect(() => () => clearTimeout(transitionTimer.current), []);
  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPreview, setRecoveryPreview] = useState(false);
  const [recoveryCaptchaVerified, setRecoveryCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] =
    useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState("");
  const [registration, setRegistration] = useState({
    name: "",
    studentId: "",
    email: "",
    password: "",
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationCaptchaVerified, setRegistrationCaptchaVerified] =
    useState(false);
  const account = demoAccounts.find((item) => item.role === role);
  const signingUp = mode === "signup";

  function chooseRole(value) {
    setRole(value);
    setIdentifier("");
    setPassword("");
    setError("");
  }
  function switchMode(value) {
    if (transitionLock.current || busy || value === mode) return;
    transitionLock.current = true;
    setIsTransitioning(true);
    setMode(value);
    setError("");
    setShowPassword(false);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 900;
    transitionTimer.current = setTimeout(() => {
      transitionLock.current = false;
      setIsTransitioning(false);
    }, duration);
  }
  function useDemo() {
    setIdentifier(role === "student" ? account.studentId : account.email);
    setPassword(account.password);
    setError("");
  }
  async function signIn(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onLogin({ identifier, password, role });
    } catch (failure) {
      setError(
        failure.message || "Check your username and password, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function openRecovery() {
    setRecoveryEmail(role === "student" ? "" : identifier);
    setRecoveryPreview(false);
    setRecoveryCaptchaVerified(false);
    setDialog("password");
  }
  function previewResetEmail(event) {
    event.preventDefault();
    if (!recoveryCaptchaVerified) return;
    setRecoveryPreview(true);
  }
  function previewRegistration(event) {
    event.preventDefault();
    setRegistrationError("");
    if (!registrationCaptchaVerified) {
      setRegistrationError("Complete the CAPTCHA before creating your account.");
      return;
    }
    if (!passwordChecks(registration.password).valid) {
      setRegistrationError(
        "Use at least 12 characters, at least 1 uppercase letter, and at least 1 number or symbol.",
      );
      return;
    }
    setRegistrationComplete(true);
    setRegistration((value) => ({ ...value, password: "" }));
  }
  function help() {
    if (onHelp) onHelp();
    else setDialog("help");
  }

  return (
    <main className="ref-auth-page" data-theme={theme}>
      <header className="ref-auth-topbar auth-desktop-header">
        <a
          className="ref-auth-wordmark"
          href="/"
          aria-label="Computer Communication Development Institute portal home"
        >
          <img src="/assets/ccdi-logo.png" alt="" />
          <div className="ref-auth-wordmark-copy">
            <strong>Computer Communication Development Institute</strong>
            <small>Slot Management and Accounting Reservation Technology</small>
          </div>
        </a>
        <div className="ref-auth-header-actions">
          <AppearanceToggle theme={theme} onChange={setTheme} />
          <button
            className="ref-auth-help"
            type="button"
            aria-label="Help Center"
            title="Help Center"
            onClick={help}
          >
            <HelpCircle size={17} />
            <span>Help Center</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      <section
        className={`ref-auth-card ${signingUp ? "ref-auth-is-signup" : ""} ${isTransitioning ? "ref-auth-transitioning" : ""}`}
        aria-label="Computer Communication Development Institute account access"
        aria-busy={isTransitioning}
      >
        {" "}
        <header className="ref-auth-topbar">
          <a
            className="ref-auth-wordmark"
            href="/"
            aria-label="Computer Communication Development Institute portal home"
          >
            <img src="/assets/ccdi-logo.png" alt="" />
            <div className="ref-auth-wordmark-copy">
              <strong>Computer Communication Development Institute</strong>
              <small>
                Slot Management and Accounting Reservation Technology
              </small>
            </div>
          </a>
          <div className="ref-auth-header-actions">
            <AppearanceToggle theme={theme} onChange={setTheme} />
            <button
              className="ref-auth-help"
              type="button"
              aria-label="Help Center"
              title="Help Center"
              onClick={help}
            >
              <HelpCircle size={17} />
              <span>Help Center</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </header>
        <div className="ref-auth-form-slider" inert={isTransitioning}>
          <div
            className="ref-auth-form-panel ref-auth-signin"
            aria-hidden={signingUp}
            inert={signingUp}
          >
            <div className="ref-auth-form-content">
              <h1>
                Welcome back<span>!</span>
              </h1>
              <p className="ref-auth-intro">
                {role === "student"
                  ? "Enter your student ID and password to access the portal."
                  : "Enter your username and password to access the portal."}
              </p>

              <div
                className="ref-auth-roles"
                role="group"
                aria-label="Account type"
                style={{
                  "--role-index": demoAccounts.findIndex(
                    (a) => a.role === role,
                  ),
                }}
              >
                <span className="auth-role-indicator" aria-hidden="true" />
                {demoAccounts.map((item) => {
                  const Icon = roleIcons[item.role];
                  return (
                    <button
                      type="button"
                      key={item.role}
                      aria-pressed={role === item.role}
                      className={
                        role === item.role ? "ref-auth-role-active" : ""
                      }
                      disabled={busy}
                      onClick={() => chooseRole(item.role)}
                    >
                      <Icon size={16} />
                      <span>{roleLabel(item.role)}</span>
                    </button>
                  );
                })}
              </div>

              <form key={role} className="ref-auth-form" onSubmit={signIn}>
                <div className="ref-auth-field">
                  <label htmlFor="ref-auth-identifier">
                    {role === "student" ? "Student ID" : "Username"}
                  </label>
                  <input
                    id="ref-auth-identifier"
                    name="username"
                    autoComplete="username"
                    type="text"
                    placeholder={
                      role === "student"
                        ? "Enter your student ID"
                        : "Enter your username"
                    }
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </div>
                <div className="ref-auth-field">
                  <label htmlFor="ref-auth-password">Password</label>
                  <div className="ref-auth-password">
                    <input
                      id="ref-auth-password"
                      aria-describedby="ref-auth-password-note"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <p id="ref-auth-password-note" className="password-login-note">
                  Passwords are case-sensitive. Enter the password linked to
                  your account.
                </p>
                <div className="ref-auth-form-meta">
                  <button type="button" onClick={openRecovery}>
                    Forgot password?
                  </button>
                </div>
                {error && (
                  <p
                    className="ref-auth-alert ref-auth-alert-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <button
                  className="ref-auth-submit"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? "Logging in…" : "Log in"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <aside className="ref-auth-demo" aria-label="Try a demo account">
                <span>Just looking around?</span>
                <button type="button" onClick={useDemo} disabled={busy}>
                  Try a demo account
                  <ArrowUpRight size={15} />
                </button>
              </aside>
              <p className="ref-auth-mode-link">
                New to the portal?{" "}
                <button
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => switchMode("signup")}
                >
                  Sign in
                  <ArrowRight size={13} />
                </button>
              </p>
            </div>
          </div>

          <div
            className="ref-auth-form-panel ref-auth-signup"
            aria-hidden={!signingUp}
            inert={!signingUp}
          >
            <div className="ref-auth-form-content">
              <h2>
                Sign in<span>.</span>
              </h2>
              <p className="ref-auth-intro">
                Create your student account to get started.
              </p>
              {registrationComplete ? (
                <div className="ref-auth-registration-complete" role="status">
                  <CheckCircle2 size={38} />
                  <h3>Thanks for trying it out.</h3>
                  <p>Return to log in and try a demo account.</p>
                  <small>This preview doesn’t create an account.</small>
                  <button
                    className="ref-auth-submit"
                    type="button"
                    onClick={() => {
                      chooseRole("student");
                      switchMode("signin");
                    }}
                  >
                    Return to log in
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="ref-auth-text-button"
                    type="button"
                    onClick={() => {
                      setRegistrationComplete(false);
                      setRegistrationCaptchaVerified(false);
                    }}
                  >
                    View registration form again
                  </button>
                </div>
              ) : (
                <>
                  <form
                    className="ref-auth-form ref-auth-registration"
                    onSubmit={previewRegistration}
                  >
                    <div className="ref-auth-field">
                      <label htmlFor="ref-auth-name">Full name</label>
                      <input
                        id="ref-auth-name"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={registration.name}
                        required
                        maxLength={100}
                        onChange={(event) =>
                          setRegistration({
                            ...registration,
                            name: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ref-auth-field">
                      <label htmlFor="ref-auth-student-id">Student ID</label>
                      <input
                        id="ref-auth-student-id"
                        autoComplete="off"
                        placeholder="e.g. 2026-01-123"
                        value={registration.studentId}
                        required
                        maxLength={30}
                        onChange={(event) =>
                          setRegistration({
                            ...registration,
                            studentId: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ref-auth-field">
                      <label htmlFor="ref-auth-registration-email">
                        Email address
                      </label>
                      <input
                        id="ref-auth-registration-email"
                        autoComplete="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={registration.email}
                        required
                        onChange={(event) =>
                          setRegistration({
                            ...registration,
                            email: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ref-auth-field">
                      <label htmlFor="ref-auth-new-password">Password</label>
                      <div className="ref-auth-password">
                        <input
                          id="ref-auth-new-password"
                          aria-describedby="ref-auth-password-rules"
                          autoComplete="new-password"
                          type={showRegistrationPassword ? "text" : "password"}
                          placeholder="At least 12 characters"
                          value={registration.password}
                          minLength={12}
                          required
                          onChange={(event) =>
                            setRegistration({
                              ...registration,
                              password: event.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          aria-label={
                            showRegistrationPassword
                              ? "Hide registration password"
                              : "Show registration password"
                          }
                          onClick={() =>
                            setShowRegistrationPassword((value) => !value)
                          }
                        >
                          {showRegistrationPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <PasswordGuide value={registration.password} />
                    <CaptchaChallenge
                      id="ref-auth-registration-captcha"
                      onVerify={setRegistrationCaptchaVerified}
                    />
                    {registrationError && (
                      <p
                        className="ref-auth-alert ref-auth-alert-error"
                        role="alert"
                      >
                        {registrationError}
                      </p>
                    )}
                    <button className="ref-auth-submit" type="submit">
                      Create account
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </>
              )}
              <p className="ref-auth-mode-link">
                Already have an account?{" "}
                <button
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => switchMode("signin")}
                >
                  Back to log in
                  <ArrowRight size={13} />
                </button>
              </p>
            </div>
          </div>
        </div>
        <div className="ref-auth-brand-depth">
          <aside className="ref-auth-brand">
            <span
              className="ref-auth-orb ref-auth-orb-one"
              aria-hidden="true"
            />
            <span
              className="ref-auth-orb ref-auth-orb-two"
              aria-hidden="true"
            />
            <div className="ref-auth-brand-content">
              <img
                className="ref-auth-brand-logo"
                src="/assets/ccdi-logo.png"
                alt="Computer Communication Development Institute logo"
              />
              <h2>
                {signingUp ? (
                  <>
                    Plan your next
                    <br />
                    <span>campus visit.</span>
                  </>
                ) : (
                  <>
                    Campus visits,
                    <br />
                    <span>made easier.</span>
                  </>
                )}
              </h2>
              <span className="ref-auth-brand-rule" />
              <p>Choose a service, book a time, and track your appointments.</p>
            </div>
          </aside>
        </div>
      </section>

      {dialog && (
        <Modal
          title={
            dialog === "password"
              ? recoveryPreview
                ? "Check your email"
                : "Forgot your password?"
              : "Need a hand?"
          }
          onClose={() => {
            if (!busy) setDialog("");
          }}
          className="ref-auth-security-modal"
        >
          <div className="ref-auth-dialog-content">
            {dialog === "password" ? (
              recoveryPreview ? (
                <div className="ref-auth-dialog-form" role="status">
                  <p className="ref-auth-reset-heading">
                    <CheckCircle2 size={23} />
                    Check your email for a password reset link.
                  </p>
                  <button
                    className="ref-auth-submit"
                    type="button"
                    onClick={() => setDialog("")}
                  >
                    Back to sign in
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="ref-auth-text-button"
                    type="button"
                    onClick={() => {
                      setRecoveryPreview(false);
                      setRecoveryCaptchaVerified(false);
                    }}
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form
                  className="ref-auth-dialog-form"
                  onSubmit={previewResetEmail}
                >
                  <p>Enter your registered email address.</p>
                  <label htmlFor="ref-auth-recovery-email">Email address</label>
                  <input
                    id="ref-auth-recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="yourname@gmail.com"
                    required
                    value={recoveryEmail}
                    onChange={(event) => setRecoveryEmail(event.target.value)}
                  />
                  <CaptchaChallenge
                    id="ref-auth-recovery-captcha"
                    onVerify={setRecoveryCaptchaVerified}
                  />
                  <button className="ref-auth-submit" type="submit">
                    Send reset link
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="ref-auth-text-button"
                    type="button"
                    onClick={() => setDialog("")}
                  >
                    Back to sign in
                  </button>
                </form>
              )
            ) : (
              <>
                <p>
                  Choose your account type, select{" "}
                  <strong>Try a demo account</strong>, and log in to explore the
                  portal.
                </p>
                <p>
                  Students can book appointments. Cashier and Accounting staff
                  can manage their queues.
                </p>
              </>
            )}
          </div>
        </Modal>
      )}
    </main>
  );
}
