import React, { useState } from "react";
import { motion } from "framer-motion";
import "./VerifyTicketModal.css";
import { ShieldCheck, CheckCircle2, XCircle, X, Check } from "lucide-react";
import { api, dateLabel, officeName, post } from "../api.js";

export default function VerifyTicketModal({
  isOpen,
  onClose,
  data,
  refresh,
  notify,
}) {
  const [tokenInput, setTokenInput] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleVerify(e) {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const res = await api(
        `/verify?token=${encodeURIComponent(tokenInput.trim())}`,
      );
      setResult(res);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckIn(token) {
    try {
      await post("/checkin", { token });
      await refresh();
      notify("Ticket successfully checked in!");
      handleVerify();
    } catch (err) {
      notify(err.message || "Could not check in");
    }
  }

  return (
    <div className="verify-modal-overlay">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="verify-modal-dialog"
      >
        <div className="verify-modal-header">
          <div className="verify-modal-title-wrap">
            <div className="verify-modal-icon-frame">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="verify-modal-eyebrow">
                Security & Authentication
              </span>
              <h3 className="verify-modal-headline">Ticket QR Verification</h3>
            </div>
          </div>
          <button onClick={onClose} className="verify-modal-close-icon">
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleVerify}
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Enter Ticket Security Token or UUID:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token string or ticket hash..."
                className="verify-search-input-field"
              />
              <button
                type="submit"
                disabled={busy || !tokenInput}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  background: "var(--gradient-blue-red)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: busy || !tokenInput ? 0.5 : 1,
                }}
              >
                {busy ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>

          {data?.bookings && data.bookings.length > 0 && (
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Sample Tokens from Active Queues:
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  maxHeight: "96px",
                  overflowY: "auto",
                }}
              >
                {data.bookings.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setTokenInput(b.token)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--neon-sky)",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{b.queueNumber}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      ({b.token.slice(0, 8)}...)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(244,63,94,0.15)",
                border: "1px solid rgba(244,63,94,0.35)",
                color: "#fda4af",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(23, 23, 23, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {result.valid ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--status-emerald)",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Valid Campus Ticket Verified!</span>
                  </div>

                  {result.booking && (
                    <div
                      style={{
                        marginTop: "12px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        fontSize: "12px",
                        background: "rgba(0,0,0,0.4)",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            display: "block",
                          }}
                        >
                          Queue Number:
                        </span>
                        <strong style={{ color: "#fff", fontSize: "16px" }}>
                          {result.booking.queueNumber}
                        </strong>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            display: "block",
                          }}
                        >
                          Status:
                        </span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            background: "rgba(16,185,129,0.2)",
                            color: "#6ee7b7",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {result.booking.status}
                        </span>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            display: "block",
                          }}
                        >
                          Office:
                        </span>
                        <strong style={{ color: "#fff" }}>
                          {officeName(result.booking.officeId)}
                        </strong>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            display: "block",
                          }}
                        >
                          Scheduled:
                        </span>
                        <strong style={{ color: "#fff" }}>
                          {dateLabel(result.booking.date)}
                        </strong>
                      </div>
                    </div>
                  )}

                  {result.booking?.status === "booked" && (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(result.booking.token)}
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "10px",
                        borderRadius: "12px",
                        background: "var(--status-emerald)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Check size={14} />
                      <span>Check In This Student Now</span>
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--neon-crimson)",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  <XCircle size={18} />
                  <span>
                    Ticket Token Not Found or Invalid in this browser session.
                  </span>
                </div>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
