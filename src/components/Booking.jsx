import PriorityNotice from "./PriorityNotice.jsx";
import { slotCapacity } from "../slotCapacity.js";
import "./Booking.css";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  CalendarDays,
  Clock,
  Check,
  ShieldCheck,
  Info,
  ArrowRight,
} from "lucide-react";
import { post, dateLabel, timeLabel } from "../api.js";
import Modal from "./Modal.jsx";
import Ticket from "./Ticket.jsx";
export default function Booking({
  data,
  refresh,
  profile,
  notify,
  initialOffice = "",
}) {
  const [multiple, setMultiple] = useState(false);
  const [officeId, setOffice] = useState(() =>
      data.offices.some((o) => o.id === initialOffice && o.enabled)
        ? initialOffice
        : "",
    ),
    [serviceIds, setServices] = useState([]),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [month, setMonth] = useState(data.today.slice(0, 7)),
    [confirm, setConfirm] = useState(false),
    [ticket, setTicket] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [details, setDetails] = useState(profile);
  const office = data.offices.find((o) => o.id === officeId),
    services = office?.services.filter((s) => serviceIds.includes(s.id)) || [],
    serviceLabel = services.map((s) => s.name).join(", ");
  const dateOff = (d) =>
    d < data.today ||
    [0, 6].includes(new Date(d + "T12:00:00+08:00").getUTCDay()) ||
    data.blockedDates.some((x) => x.officeId === officeId && x.date === d);
  const count = (d, t) =>
    data.slotCounts?.find(
      (x) => x.officeId === officeId && x.date === d && x.time === t,
    )?.count || 0;
  const timeOff = (d, t) =>
    dateOff(d) ||
    data.blockedTimes.some(
      (x) => x.officeId === officeId && x.date === d && x.time === t,
    ) ||
    new Date(`${d}T${t}:00+08:00`) <= new Date() ||
    count(d, t) >= slotCapacity(data, officeId, d, t);
  const dayOff = (d) => dateOff(d) || data.times.every((t) => timeOff(d, t));
  useEffect(() => {
    if (office && !office.enabled) {
      setOffice("");
      setServices([]);
      setDate("");
      setTime("");
    } else if (
      serviceIds.some(
        (id) => !office?.services.some((s) => s.id === id && s.enabled),
      )
    ) {
      setServices((ids) =>
        ids.filter((id) =>
          office?.services.some((s) => s.id === id && s.enabled),
        ),
      );
      setDate("");
      setTime("");
    } else if (date && dayOff(date)) {
      setDate("");
      setTime("");
    } else if (date && time && timeOff(date, time)) setTime("");
  }, [data]);
  function chooseOffice(id) {
    setOffice(id);
    setMultiple(false);
    setServices([]);
    setDate("");
    setTime("");
    setError("");
  }
  function chooseService(id) {
    setServices((ids) =>
      multiple
        ? ids.includes(id)
          ? ids.filter((value) => value !== id)
          : [...ids, id]
        : [id],
    );
    setDate("");
    setTime("");
    setError("");
  }
  const [year, mo] = month.split("-").map(Number),
    first = new Date(Date.UTC(year, mo - 1, 1)).getUTCDay(),
    days = new Date(Date.UTC(year, mo, 0)).getUTCDate();
  function changeMonth(amount) {
    const next = new Date(Date.UTC(year, mo - 1 + amount, 1));
    setMonth(
      `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  }
  const complete =
    office?.enabled &&
    services.length > 0 &&
    services.every((s) => s.enabled) &&
    date &&
    time &&
    !timeOff(date, time);
  const currentStep = time ? 3 : serviceIds.length ? 2 : officeId ? 1 : 0;
  async function reserve(e) {
    e.preventDefault();
    if (busy || !complete) return;
    setBusy(true);
    setError("");
    try {
      const r = await post("/bookings", {
        officeId,
        serviceIds,
        date,
        time,
        studentName: details.name.trim(),
        studentNumber: details.number.trim(),
      });
      await refresh();
      setConfirm(false);
      setTicket(r.booking);
      setDate("");
      setTime("");
      notify("Your slot has been reserved.");
    } catch (e) {
      setError(e.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="reservation-booking">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLAN YOUR CAMPUS VISIT</div>
          <h1>Slot Management</h1>
          <p className="page-subtitle">
            Choose your office and services, then find a time that works for
            you.
          </p>
        </div>
      </div>
      <PriorityNotice />
      <div className="stepper">
        {[
          "Choose office",
          "Select services",
          "Pick date & time",
          "Get queue ticket",
        ].map((label, i) => (
          <div
            className={`step ${i === currentStep ? "active" : ""} ${i < currentStep ? "done" : ""}`}
            key={label}
          >
            <span className="step-circle">
              {i < currentStep ? <Check size={14} /> : i + 1}
            </span>
            <span>{label}</span>
            {i < 3 && <ChevronRight size={15} />}
          </div>
        ))}
      </div>
      <div className="booking-layout">
        <section className="panel office-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">STEP 01</div>
              <h2>Select an office</h2>
            </div>
          </div>
          <div className="office-grid">
            {data.offices.map((o) => (
              <button
                disabled={!o.enabled}
                className={`office-card ${officeId === o.id ? "selected" : ""}`}
                key={o.id}
                onClick={() => chooseOffice(o.id)}
                aria-pressed={officeId === o.id}
              >
                <span className="office-icon">
                  {o.id === "cashier" ? (
                    <Wallet size={24} />
                  ) : (
                    <FileText size={24} />
                  )}
                </span>
                <span className="office-text">
                  <strong>{o.name}</strong>
                  <small>
                    {o.id === "cashier"
                      ? "Payments & promissory notes"
                      : "Documents & student requests"}
                  </small>
                  <span className={`chip ${o.enabled ? "green" : "gray"}`}>
                    <i />
                    {o.enabled ? "Available" : "Unavailable"}
                  </span>
                </span>
                <ChevronRight className="arrow" size={18} />
              </button>
            ))}
          </div>
          <p className="muted office-help">
            <Info size={14} />
            Gray options are currently unavailable.
          </p>
        </section>
        {office ? (
          <section
            className="panel service-panel"
            role="dialog"
            aria-modal="false"
            aria-label={`${office.name} service categories`}
          >
            <div className="panel-header">
              <div>
                <div className="eyebrow">
                  STEP 02 · {office.name.toUpperCase()}
                </div>
                <h2>What can we help you with?</h2>
              </div>
              <button
                className="button ghost"
                aria-label="Close service categories"
                onClick={() => chooseOffice("")}
              >
                <X size={18} />
              </button>
            </div>
            <div className="service-selection-toolbar">
              <p className="muted">
                {multiple
                  ? "Select all services you need for this office visit."
                  : "Choose a service, or turn on multiple selection."}
              </p>
              <button
                type="button"
                className={`button secondary small ${multiple ? "is-multiple" : ""}`}
                aria-pressed={multiple}
                onClick={() => {
                  setMultiple(!multiple);
                  setServices((ids) => (multiple ? ids.slice(0, 1) : ids));
                  setDate("");
                  setTime("");
                }}
              >
                {multiple ? <Check size={16} /> : null}Select multiple
              </button>
            </div>
            <fieldset className="service-grid service-checklist">
              <legend className="service-selection-legend">
                {multiple
                  ? `Services needed · ${serviceIds.length} selected`
                  : "Service needed"}
              </legend>
              {office.services.map((s) => (
                <label
                  key={s.id}
                  className={`service-card ${serviceIds.includes(s.id) ? "selected" : ""} ${!s.enabled ? "unavailable" : ""}`}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name="booking-service"
                    checked={serviceIds.includes(s.id)}
                    disabled={!s.enabled || !office.enabled}
                    onChange={() => chooseService(s.id)}
                  />
                  <span className="service-option-copy">
                    <strong>{s.name}</strong>
                    <small>
                      {s.enabled
                        ? s.id === "discount"
                          ? "Ask Accounting about discount availability. No discount is applied."
                          : "Available for booking"
                        : "Currently unavailable"}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        ) : (
          <section className="panel selection-placeholder">
            <span className="empty-icon">
              <ArrowRight size={27} />
            </span>
            <h2>Let’s get you to the right office</h2>
            <p>Choose Cashier or Accounting to view its services.</p>
          </section>
        )}
      </div>
      {services.length > 0 && (
        <div className="booking-bottom">
          <section className="panel schedule-panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">STEP 03</div>
                <h2>Choose your date & time</h2>
              </div>
              <span className="chip blue">{serviceLabel}</span>
            </div>
            <div className="schedule-grid">
              <div className="calendar">
                <div className="calendar-head">
                  <h3>
                    {new Intl.DateTimeFormat("en-PH", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(Date.UTC(year, mo - 1, 1)))}
                  </h3>
                  <div>
                    <button
                      className="button ghost small"
                      aria-label="Previous month"
                      disabled={month <= data.today.slice(0, 7)}
                      onClick={() => changeMonth(-1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className="button ghost small"
                      aria-label="Next month"
                      onClick={() => changeMonth(1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <div className="calendar-week">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <span key={d}>{d}</span>
                    ),
                  )}
                </div>
                <div className="calendar-days">
                  {Array.from({ length: first }, (_, i) => (
                    <span key={"blank" + i} />
                  ))}
                  {Array.from({ length: days }, (_, i) => {
                    const d = `${month}-${String(i + 1).padStart(2, "0")}`;
                    return (
                      <button
                        key={d}
                        className={`date-button ${d === date ? "selected" : ""} ${d === data.today ? "today" : ""}`}
                        disabled={dayOff(d)}
                        aria-label={`${dateLabel(d, true)}${dayOff(d) ? ", unavailable" : ""}`}
                        aria-pressed={d === date}
                        onClick={() => {
                          setDate(d);
                          setTime("");
                        }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="legend">
                  <span>
                    <i className="legend-dot" />
                    Available
                  </span>
                  <span>
                    <i className="legend-dot selected" />
                    Selected
                  </span>
                  <span>
                    <i className="legend-dot disabled" />
                    Unavailable
                  </span>
                </div>
              </div>
              <div className="times-panel">
                <h3>
                  <Clock size={17} />
                  Available time slots
                </h3>
                <p className="muted">
                  {date
                    ? dateLabel(date, true)
                    : "Choose a date to view available times."}
                </p>
                {date ? (
                  <>
                    <div className="time-grid">
                      {data.times.map((t) => (
                        <button
                          key={t}
                          disabled={timeOff(date, t)}
                          className={`time-button ${t === time ? "selected" : ""}`}
                          aria-pressed={t === time}
                          onClick={() => setTime(t)}
                        >
                          <strong>{timeLabel(t)}</strong>
                          <small>
                            {timeOff(date, t)
                              ? "Unavailable"
                              : `${Math.max(0, slotCapacity(data, officeId, date, t) - count(date, t))} slots left`}
                          </small>
                        </button>
                      ))}
                    </div>
                    <p className="muted">
                      Reservation limits vary by office, date, and hour.
                    </p>
                  </>
                ) : (
                  <div className="empty-state compact">
                    <CalendarDays size={32} />
                    <p>Your available times will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
          <aside className="panel summary-panel">
            <div className="eyebrow">YOUR VISIT</div>
            <h2>Reservation summary</h2>
            <div className="summary-row">
              <span>Office</span>
              <strong>{office.name}</strong>
            </div>
            <div className="summary-row">
              <span>Services</span>
              <strong>{serviceLabel}</strong>
            </div>
            <div className="summary-divider" />
            <div className="summary-row">
              <span>
                <CalendarDays size={14} />
                Date
              </span>
              <strong>{date ? dateLabel(date) : "Not selected"}</strong>
            </div>
            <div className="summary-row">
              <span>
                <Clock size={14} />
                Time
              </span>
              <strong>{time ? timeLabel(time) : "Not selected"}</strong>
            </div>
            <button
              className="button primary"
              disabled={!complete}
              onClick={() => {
                setDetails(profile);
                setError("");
                setConfirm(true);
              }}
            >
              Reserve slot
              <ArrowRight size={16} />
            </button>
            <p className="muted">
              <ShieldCheck size={14} />
              Receive a queue number and verification QR after reserving.
            </p>
          </aside>
        </div>
      )}
      {confirm && (
        <Modal
          className="confirm-reservation-modal"
          title="Confirm your reservation"
          onClose={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <form onSubmit={reserve}>
            <p className="muted">
              {office.name} · {serviceLabel}
              <br />
              {dateLabel(date)} at {timeLabel(time)}
            </p>
            <div className="field">
              <label htmlFor="student-name">Full name</label>
              <input
                id="student-name"
                value={details.name}
                required
                maxLength={100}
                onChange={(e) =>
                  setDetails({ ...details, name: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="student-number">Student number</label>
              <input
                id="student-number"
                value={details.number}
                required
                maxLength={40}
                placeholder="e.g. 2026-01-123"
                onChange={(e) =>
                  setDetails({ ...details, number: e.target.value })
                }
              />
            </div>
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <p className="notice info">
              Your queue ticket will be generated when your reservation is
              saved.
            </p>
            <div className="modal-footer">
              <button
                type="button"
                disabled={busy}
                className="button danger"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
              <button className="button primary" disabled={busy || !complete}>
                {busy ? "Reserving…" : "Confirm reservation"}
                <Check size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {ticket && (
        <Ticket booking={ticket} data={data} onClose={() => setTicket(null)} />
      )}
    </div>
  );
}
