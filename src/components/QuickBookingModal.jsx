import React, { useState } from "react";
import { motion } from "framer-motion";
import "./QuickBookingModal.css";
import {
  CalendarDays,
  Clock,
  Building2,
  FileCheck,
  Check,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { post, dateLabel, timeLabel, officeName, serviceName } from "../api.js";

export default function QuickBookingModal({
  isOpen,
  onClose,
  data,
  refresh,
  notify,
  profile,
  onBookingSuccess,
}) {
  const [officeId, setOfficeId] = useState("cashier");
  const [serviceId, setServiceId] = useState("payment");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentOffice =
    data?.offices?.find((o) => o.id === officeId) || data?.offices?.[0];
  const services = currentOffice?.services?.filter((s) => s.enabled) || [];

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  async function handleBook(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await post("/bookings", {
        officeId,
        serviceId,
        date,
        time,
        studentName: profile?.name || "Juan F. Smith",
        studentNumber: profile?.number || "2026-01-123",
      });
      await refresh();
      notify("Appointment slot successfully reserved!");
      onClose();
      if (onBookingSuccess && res.booking) {
        onBookingSuccess(res.booking);
      }
    } catch (err) {
      setError(err.message || "Failed to book this slot.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="quick-booking-overlay">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="quick-booking-card"
      >
        <div className="quick-booking-header">
          <div className="quick-booking-title-group">
            <div className="quick-booking-icon-box">
              <CalendarDays size={20} />
            </div>
            <div>
              <span className="quick-booking-kicker">Express Reservation</span>
              <h3 className="quick-booking-title">Reserve a Campus Slot</h3>
            </div>
          </div>
          <button onClick={onClose} className="quick-booking-close-btn">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleBook} className="quick-booking-form">
          {/* Office Selection */}
          <div>
            <label className="quick-booking-field-label">
              <Building2 size={13} style={{ color: "var(--neon-sky)" }} />
              <span>1. Select Office Department</span>
            </label>
            <div className="quick-booking-dept-grid">
              {[
                {
                  id: "cashier",
                  name: "Cashier Office",
                  desc: "Fee payments & promissory notes",
                },
                {
                  id: "accounting",
                  name: "Accounting Office",
                  desc: "Clearance & exam permits",
                },
              ].map((office) => {
                const isSelected = officeId === office.id;
                return (
                  <button
                    key={office.id}
                    type="button"
                    onClick={() => {
                      setOfficeId(office.id);
                      const off = data?.offices?.find(
                        (o) => o.id === office.id,
                      );
                      if (off?.services?.[0]) setServiceId(off.services[0].id);
                    }}
                    className={`quick-booking-dept-card ${isSelected ? "selected" : ""}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 700 }}>
                        {office.name}
                      </span>
                      {isSelected && (
                        <Check size={14} style={{ color: "var(--neon-sky)" }} />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      {office.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="quick-booking-field-label">
              <FileCheck size={13} style={{ color: "var(--neon-crimson)" }} />
              <span>2. Choose Service</span>
            </label>
            <div className="quick-booking-service-grid">
              {services.map((svc) => {
                const isSelected = serviceId === svc.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setServiceId(svc.id)}
                    className={`quick-booking-service-chip ${isSelected ? "selected" : ""}`}
                  >
                    <span>{svc.name}</span>
                    {isSelected && (
                      <Check size={12} style={{ color: "var(--neon-sky)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="quick-booking-field-label">
              <CalendarDays size={13} style={{ color: "var(--neon-sky)" }} />
              <span>3. Select Appointment Date</span>
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="quick-booking-date-input"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="quick-booking-field-label">
              <Clock size={13} style={{ color: "var(--neon-crimson)" }} />
              <span>4. Pick Preferred Time Slot</span>
            </label>
            <div className="quick-booking-time-grid">
              {timeSlots.map((slot) => {
                const isSelected = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`quick-booking-time-pill ${isSelected ? "selected" : ""}`}
                  >
                    {timeLabel(slot)}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background: "rgba(244,63,94,0.15)",
                border: "1px solid rgba(244,63,94,0.3)",
                color: "#fda4af",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="quick-booking-actions-row">
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 16px",
                fontSize: "12px",
                color: "var(--text-muted)",
                background: "transparent",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                background: "var(--gradient-blue-red)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 20px rgba(2, 132, 199, 0.35)",
              }}
            >
              {busy ? (
                <span>Generating Ticket...</span>
              ) : (
                <>
                  <span>Confirm Slot Reservation</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
