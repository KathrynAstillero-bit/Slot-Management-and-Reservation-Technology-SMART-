import "./Ticket.css";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Printer,
  Copy,
  Download,
  Ticket as TicketIcon,
} from "lucide-react";
import Modal from "./Modal.jsx";
import { appointmentPassed, reservationLabel } from "../appointmentStatus.js";
import QueueProgress from "./QueueProgress.jsx";
import { dateLabel, timeLabel, officeName, serviceName } from "../api.js";
export default function Ticket({ booking, data, onClose }) {
  const [qr, setQr] = useState(""),
    [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  booking = data.bookings.find((b) => b.id === booking.id) || booking;
  const verificationUrl = `${window.location.origin}/verify?token=${encodeURIComponent(booking.token)}`;
  const status = reservationLabel(booking);
  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#061d33", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() =>
        setError("QR image could not load. Use the verification link below."),
      );
  }, [verificationUrl]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
    } catch {
      setError(
        "Copy is unavailable. Select and copy the verification link below.",
      );
    }
  }
  return (
    <Modal
      title="Your queue ticket"
      onClose={onClose}
      className="ticket-modal"
      footer={
        <>
          <button className="button secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Print ticket
          </button>
          <button className="button primary" onClick={onClose}>
            Done
            <Check size={16} />
          </button>
        </>
      }
    >
      <div className="ticket queue-ticket-layout">
        <div className="queue-ticket-success">
          <span>
            {booking.status === "booked" ? (
              <Check size={24} />
            ) : (
              <TicketIcon size={24} />
            )}
          </span>
          <h2>{status}</h2>
          <p>
            {appointmentPassed(booking)
              ? "Your appointment window has passed. Contact the office about your reservation."
              : booking.status === "booked"
                ? "Reservation confirmed. Join the physical line at your appointment time and present your QR ticket when you reach the counter."
                : booking.status === "checked-in"
                  ? "Being served. The office has admitted your ticket at the counter and is handling your service."
                  : booking.status === "completed"
                    ? "Your visit is complete. Keep this ticket for your records."
                    : "This reservation is cancelled. Book a new slot if you still need assistance."}
          </p>
        </div>
        <article
          className="queue-stub"
          aria-label={`Queue ticket ${booking.queueNumber}`}
        >
          <header className="queue-stub-number">
            <span>YOUR QUEUE NUMBER</span>
            <strong>{booking.queueNumber}</strong>
            <span>CCDI · {officeName(booking.officeId)}</span>
            <span className={`ticket-status-badge status-${booking.status}`}>
              <i />
              Status: {status}
            </span>
          </header>
          <dl className="queue-stub-info">
            <div>
              <dt>Office</dt>
              <dd>{officeName(booking.officeId)} · Sorsogon Campus</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>
                {serviceName(
                  data,
                  booking.officeId,
                  booking.serviceIds || booking.serviceId,
                )}
              </dd>
            </div>
            <div className="queue-stub-student">
              <span>
                <dt>Student</dt>
                <dd>{booking.studentName}</dd>
              </span>
              <span>
                <dt>Student ID</dt>
                <dd>{booking.studentNumber}</dd>
              </span>
            </div>
          </dl>
          <div className="queue-stub-perforation" aria-hidden="true" />
          <div className="queue-stub-bottom">
            <div>
              <span>Date & time</span>
              <strong>{dateLabel(booking.date)}</strong>
              <p>{timeLabel(booking.time)}</p>
              <small>Keep this ticket for your visit.</small>
            </div>
            {qr && (
              <img
                className="qr-code queue-stub-qr"
                src={qr}
                alt={`Verification QR for queue ${booking.queueNumber}`}
              />
            )}
          </div>
        </article>
        <QueueProgress booking={booking} data={data} />
        <div className="queue-ticket-tools">
          <button className="button secondary small" onClick={copy}>
            <Copy size={15} />
            {copied ? "Link copied" : "Copy ticket link"}
          </button>
          {qr && (
            <a
              className="button secondary small"
              href={qr}
              download={`${booking.queueNumber}-QR.png`}
            >
              <Download size={15} />
              Save QR
            </a>
          )}
        </div>
        <details className="queue-ticket-link">
          <summary>Verification link</summary>
          <a href={verificationUrl}>
            {verificationUrl}
          </a>
        </details>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
