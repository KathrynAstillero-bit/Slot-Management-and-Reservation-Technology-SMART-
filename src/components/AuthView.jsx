import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AuthView.css";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Ticket,
  Clock,
  Zap,
  ChevronRight,
  Check,
} from "lucide-react";
import { demoAccounts } from "../api.js";

export default function AuthView({
  onLogin,
  initialMode = "signin",
  onSkipToDashboard,
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'signup'
  const [selectedRole, setSelectedRole] = useState("student");
  const [identifier, setIdentifier] = useState("2026-01-123");
  const [password, setPassword] = useState("SlotStudent!2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    accountType: "student",
    agreeTerms: true,
  });
  const [signupSuccess, setSignupSuccess] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "#334155" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "#f43f5e" };
    if (score === 2) return { score: 50, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 75, label: "Good", color: "#0ea5e9" };
    return { score: 100, label: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(signupData.password);

  function handleSelectRole(r) {
    setSelectedRole(r);
    const acc = demoAccounts.find((a) => a.role === r);
    if (acc) {
      setIdentifier(r === "student" ? acc.studentId : acc.email);
      setPassword(acc.password);
    }
    setError("");
  }

  async function handleSignInSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onLogin({ identifier, password, role: selectedRole });
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please verify your credentials.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleSignUpSubmit(e) {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!signupData.agreeTerms) {
      setError("Please agree to campus terms to proceed.");
      return;
    }

    setBusy(true);
    setError("");
    setBusy(false);
    setError(
      "Account creation is not available in this browser demo. Choose a demo role under Sign in.",
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glow-layer">
        <div className="auth-glow-blue-orb" />
        <div className="auth-glow-red-orb" />
        <div className="auth-glow-center-mesh" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="auth-card-container"
      >
        <motion.div
          className="auth-sliding-blade"
          initial={false}
          animate={{ x: authMode === "signup" ? 22 : -22 }}
          transition={{ type: "spring", stiffness: 150, damping: 22 }}
          aria-hidden="true"
        />
        {/* Left: Branding Panel */}
        <div className="auth-branding-section">
          <div>
            <div className="auth-brand-header">
              <div className="auth-brand-logo-frame">
                <div className="auth-brand-logo-inner">
                  <img
                    src="/assets/ccdi-logo.png"
                    alt="CCDI Campus Logo"
                    className="auth-brand-logo-img"
                  />
                </div>
              </div>
              <div>
                <span className="auth-brand-kicker">Campus Automation</span>
                <h1 className="auth-brand-name">CCDI PORTAL</h1>
              </div>
            </div>

            <div>
              <div className="auth-theme-badge">
                <Zap size={13} style={{ color: "var(--neon-crimson)" }} />
                <span>Vibrant Blue & Red Gradient Theme</span>
              </div>
              <h2 className="auth-hero-title">
                Less waiting. <br />
                <span className="auth-gradient-text">More possibilities.</span>
              </h2>
              <p className="auth-hero-desc">
                A seamless glassmorphic campus suite. Reserve your office slots,
                verify tickets in seconds, and track live office capacity with
                zero friction.
              </p>
            </div>

            <div className="auth-features-list">
              {[
                {
                  icon: CalendarDays,
                  text: "Instant appointment booking for Cashier & Accounting",
                },
                {
                  icon: Ticket,
                  text: "Real-time verified QR queue tickets with priority status",
                },
                {
                  icon: Clock,
                  text: "Live wait-time analytics & automated throughput tracking",
                },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className="auth-feature-item">
                    <div className="auth-feature-icon-box">
                      <Icon size={14} />
                    </div>
                    <span className="auth-feature-text">{feat.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="auth-branding-footer">
            <div className="auth-security-tag">
              <ShieldCheck
                size={16}
                style={{ color: "var(--status-emerald)" }}
              />
              <span>Campus Protected UI Demo</span>
            </div>
            {onSkipToDashboard && (
              <button
                type="button"
                onClick={onSkipToDashboard}
                className="auth-skip-btn"
              >
                <span>Skip to Dashboard</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Authentication Card */}
        <div className="auth-form-section">
          <div className="auth-form-header-group">
            <span className="auth-form-eyebrow">Welcome to CCDI Portal</span>
            <h3 className="auth-form-headline">
              {authMode === "signin"
                ? "Sign in to your account"
                : "Create a student or staff account"}
            </h3>

            <div className="auth-tab-track">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError("");
                }}
                className={`auth-tab-pill-btn ${authMode === "signin" ? "active" : ""}`}
              >
                {authMode === "signin" && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="auth-tab-active-indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 10 }}>
                  Sign in
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                className={`auth-tab-pill-btn ${authMode === "signup" ? "active" : ""}`}
              >
                {authMode === "signup" && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="auth-tab-active-indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 10 }}>
                  Create account
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {authMode === "signin" ? (
              <motion.div
                key="signin-view"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                {/* 1-Click Demo Credentials */}
                <div className="auth-demo-picker-wrap">
                  <div className="auth-demo-picker-header">
                    <span style={{ color: "var(--text-muted)" }}>
                      Quick Demo Credentials:
                    </span>
                    <span style={{ color: "var(--neon-sky)", fontWeight: 700 }}>
                      1-Click Fill
                    </span>
                  </div>
                  <div className="auth-demo-grid">
                    {demoAccounts.map((acc) => {
                      const isSelected = selectedRole === acc.role;
                      return (
                        <button
                          key={acc.role}
                          type="button"
                          onClick={() => handleSelectRole(acc.role)}
                          className={`auth-demo-pill ${isSelected ? "selected" : ""}`}
                        >
                          <span>{acc.role}</span>
                          {isSelected && (
                            <Check
                              size={12}
                              style={{ color: "var(--neon-sky)" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSignInSubmit} className="auth-form">
                  <div className="auth-field-group">
                    <label className="auth-field-label">
                      {selectedRole === "student"
                        ? "Student ID or Email"
                        : "Staff Email Address"}
                    </label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon">
                        {selectedRole === "student" ? (
                          <User size={16} />
                        ) : (
                          <Mail size={16} />
                        )}
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === "student"
                            ? "e.g. 2026-01-123"
                            : "name@demo.local"
                        }
                        required
                        className="auth-input-control"
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <div className="auth-field-label-row">
                      <label className="auth-field-label">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="auth-forgot-link"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your security password"
                        required
                        className="auth-input-control"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-eye-toggle-btn"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="auth-remember-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ display: "none" }}
                      />
                      <div
                        className={`auth-custom-checkbox ${rememberMe ? "checked" : ""}`}
                      >
                        {rememberMe && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span>Remember me</span>
                    </label>
                    <span
                      style={{ fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      Encrypted token session
                    </span>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="auth-error-box"
                    >
                      <ShieldCheck
                        size={14}
                        style={{ color: "var(--neon-crimson)", flexShrink: 0 }}
                      />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="auth-submit-action-btn"
                  >
                    {busy ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup-view"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                {signupSuccess ? (
                  <div style={{ padding: "48px 0", textAlign: "center" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        margin: "0 auto 16px",
                        borderRadius: "50%",
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "var(--status-emerald)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <CheckCircle2 size={32} />
                    </div>
                    <h4
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      Account Created Successfully!
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginTop: "6px",
                      }}
                    >
                      Redirecting you to sign in with your new credentials...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignUpSubmit} className="auth-form">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Full Name</label>
                      <div className="auth-input-wrapper">
                        <div className="auth-input-icon">
                          <User size={15} />
                        </div>
                        <input
                          type="text"
                          value={signupData.fullName}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Juan F. Smith"
                          required
                          className="auth-input-control"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <div className="auth-field-group">
                        <label className="auth-field-label">
                          Email Address
                        </label>
                        <div className="auth-input-wrapper">
                          <div className="auth-input-icon">
                            <Mail size={15} />
                          </div>
                          <input
                            type="email"
                            value={signupData.email}
                            onChange={(e) =>
                              setSignupData({
                                ...signupData,
                                email: e.target.value,
                              })
                            }
                            placeholder="student@demo.local"
                            required
                            className="auth-input-control"
                          />
                        </div>
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-field-label">
                          Student or Staff ID
                        </label>
                        <input
                          type="text"
                          value={signupData.studentId}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              studentId: e.target.value,
                            })
                          }
                          placeholder="2026-01-123"
                          required
                          className="auth-input-control"
                          style={{ paddingLeft: "16px" }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <div className="auth-field-group">
                        <label className="auth-field-label">Password</label>
                        <input
                          type="password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          placeholder="At least 8 chars"
                          required
                          className="auth-input-control"
                          style={{ paddingLeft: "16px" }}
                        />
                      </div>
                      <div className="auth-field-group">
                        <label className="auth-field-label">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Re-enter password"
                          required
                          className="auth-input-control"
                          style={{ paddingLeft: "16px" }}
                        />
                      </div>
                    </div>

                    {signupData.password && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>
                            Password strength:
                          </span>
                          <span
                            style={{ fontWeight: 700, color: strength.color }}
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "6px",
                            background: "#1e293b",
                            borderRadius: "9999px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${strength.score}%`,
                              height: "100%",
                              background: strength.color,
                              transition: "all 0.3s",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={signupData.agreeTerms}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            agreeTerms: e.target.checked,
                          })
                        }
                        style={{ display: "none" }}
                      />
                      <div
                        className={`auth-custom-checkbox ${signupData.agreeTerms ? "checked" : ""}`}
                      >
                        {signupData.agreeTerms && (
                          <Check size={11} strokeWidth={3} />
                        )}
                      </div>
                      <span>
                        I agree to the CCDI Campus Terms and Data Privacy Policy
                      </span>
                    </label>

                    {error && <div className="auth-error-box">{error}</div>}

                    <button
                      type="submit"
                      disabled={busy}
                      className="auth-submit-action-btn"
                    >
                      {busy ? "Creating Account..." : "Complete Registration"}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="auth-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="auth-modal-dialog"
            >
              <div className="auth-modal-header">
                <h4 className="auth-modal-title">Reset Account Password</h4>
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setResetSent(false);
                  }}
                  className="auth-modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {resetSent ? (
                <div style={{ padding: "24px 0", textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      margin: "0 auto 12px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "var(--status-emerald)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle2 size={26} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: "#ffffff" }}>
                    Reset Link Dispatched
                  </h5>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginTop: "6px",
                    }}
                  >
                    If an account matches{" "}
                    <span style={{ color: "var(--neon-sky)" }}>
                      {forgotEmail}
                    </span>
                    , instructions have been sent.
                  </p>
                  <button
                    onClick={() => {
                      setForgotModalOpen(false);
                      setResetSent(false);
                    }}
                    style={{
                      marginTop: "16px",
                      padding: "8px 20px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <div style={{ padding: "16px 0" }}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginBottom: "12px",
                    }}
                  >
                    Enter the email associated with your portal account to
                    receive recovery instructions.
                  </p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@demo.local"
                    className="auth-input-control"
                    style={{ paddingLeft: "16px" }}
                  />
                  <div className="auth-modal-btn-row">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (forgotEmail) setResetSent(true);
                      }}
                      className="auth-submit-action-btn"
                      style={{
                        width: "auto",
                        marginTop: 0,
                        padding: "8px 20px",
                      }}
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
