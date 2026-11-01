import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import "./TicketModal.css";
import { Printer, Copy, ShieldCheck, Download, X } from "lucide-react";
import { dateLabel, timeLabel, officeName, serviceName } from "../api.js";

export default function TicketModal({ booking, data, onClose }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!booking) return null;

  const verificationUrl = `${window.location.origin}/verify?token=${encodeURIComponent(booking.token || "")}`;

  useEffect(() => {
    if (booking.token) {
      QRCode.toDataURL(verificationUrl, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#030d1a",
          light: "#ffffff",
        },
      })
        .then(setQr)
        .catch(() => setError("QR image could not load. Use the link below."));
    }
  }, [booking, verificationUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy automatically. Select link to copy.");
    }
  }

  return (
    <div className="ticket-modal-overlay">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="ticket-pass-container"
      >
        <div className="ticket-glow-halo-blue" />
        <div className="ticket-glow-halo-red" />

        <button
          onClick={onClose}
          className="ticket-close-icon-btn"
          aria-label="Close pass dialog"
        >
          <X size={15} />
        </button>

        <div className="ticket-brand-header">
          <div className="ticket-brand-logo-frame">
            <div className="ticket-brand-logo-inner">
              <img
                src="/assets/ccdi-logo.png"
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
          <span className="ticket-brand-name">CCDI Campus Pass</span>
        </div>

        <div>
          <span className="ticket-priority-badge">
            {booking.status === "checked-in" ? "Checked In" : "Confirmed Slot"}
          </span>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Queue Priority Number
          </div>
          <div className="ticket-queue-number-headline">
            {booking.queueNumber || "C-001"}
          </div>
        </div>

        <div className="ticket-qr-box">
          {qr ? (
            <img
              src={qr}
              alt={`QR Ticket for ${booking.queueNumber}`}
              className="ticket-qr-img"
            />
          ) : (
            <div
              style={{
                width: "176px",
                height: "176px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Generating secure QR...
            </div>
          )}
        </div>

        <div className="ticket-meta-grid-box">
          <div>
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                display: "block",
              }}
            >
              Department:
            </span>
            <strong style={{ color: "#fff" }}>
              {officeName(booking.officeId)}
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
              Service:
            </span>
            <strong style={{ color: "#fff" }}>
              {data
                ? serviceName(data, booking.officeId, booking.serviceId)
                : booking.serviceId}
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
              Date:
            </span>
            <strong style={{ color: "#fff" }}>{dateLabel(booking.date)}</strong>
          </div>
          <div>
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                display: "block",
              }}
            >
              Time:
            </span>
            <strong style={{ color: "#fff" }}>{timeLabel(booking.time)}</strong>
          </div>
          <div
            style={{
              gridColumn: "span 2",
              paddingTop: "6px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              Student:{" "}
              <strong style={{ color: "#fff" }}>
                {booking.studentName || "Juan F. Smith"}
              </strong>
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              ID:{" "}
              <strong style={{ color: "#fff" }}>
                {booking.studentNumber || "2026-01-123"}
              </strong>
            </span>
          </div>
        </div>

        <div className="ticket-actions-btn-group">
          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              padding: "8px 14px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Printer size={13} />
            <span>Print Pass</span>
          </button>

          {qr && (
            <a
              href={qr}
              download={`${booking.queueNumber}-Pass.png`}
              style={{
                padding: "8px 14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Download size={13} />
              <span>Save</span>
            </a>
          )}

          <button
            onClick={handleCopy}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              background: "rgba(14, 165, 233, 0.2)",
              border: "1px solid rgba(14, 165, 233, 0.4)",
              color: "var(--neon-sky)",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Copy size={13} />
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "10px",
            color: "var(--text-muted)",
          }}
        >
          <ShieldCheck size={12} style={{ color: "var(--status-emerald)" }} />
          <span>Demo verification saved in browser state.</span>
        </div>
      </motion.div>
    </div>
  );
}
