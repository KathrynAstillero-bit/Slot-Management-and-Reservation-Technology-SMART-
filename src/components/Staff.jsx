import {compareReservations,reservationSortOptions} from '../reservationSort.js';
import './VerificationPage.css';
import {appointmentIsCurrent} from '../appointmentStatus.js';
import {
  appointmentPassed,
  reservationLabel,
  reservationState,
  manilaDate,
} from "../appointmentStatus.js";
import PriorityNotice from "./PriorityNotice.jsx";
import HourlyControls from "./HourlyControls.jsx";
import { slotCapacity } from "../slotCapacity.js";
import "./Staff.css";
import React, { useEffect, useState, useRef } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  Info,
  Pencil,
  QrCode,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  api,
  post,
  dateLabel,
  timeLabel,
  officeName,
  serviceName,
} from "../api.js";
import Modal from "./Modal.jsx";
import Ticket from "./Ticket.jsx";

const statusText = (status) =>
  ({
    booked: "Reserved",
    waiting: "Waiting",
    passed: "Appointment passed",
    "checked-in": "Being served",
    completed: "Completed",
    cancelled: "Cancelled",
  })[status] || status;
const statusColor = (status) =>
  ({
    booked: "blue",
    "checked-in": "amber",
    completed: "green",
    cancelled: "gray",
  })[status] || "gray";
const roles = ["student", "cashier", "accounting", "admin"];

function Heading({ eyebrow, title, description }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
    </div>
  );
}
function Toggle({ checked, disabled, label, onChange }) {
  return (
    <span className="availability-toggle">
      <span className="switch-state" aria-hidden="true">
        {checked ? "Enabled" : "Disabled"}
      </span>
      <button
        type="button"
        className={`switch ${checked ? "enabled" : ""}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-knob" />
      </button>
    </span>
  );
}

export function Availability({ data, role, refresh, notify }) {
  const offices = data.offices.filter((o) => role === "admin" || o.id === role);
  const [selectedOffice, setSelectedOffice] = useState(
    role === "admin" ? "cashier" : role,
  );
  const [date, setDate] = useState(data.today),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const office = offices.find((o) => o.id === selectedOffice) || offices[0];
  const dateBlocked =
    !!office &&
    data.blockedDates.some((x) => x.officeId === office.id && x.date === date);
  const weekend =
    !!date && [0, 6].includes(new Date(date + "T12:00:00+08:00").getUTCDay());
  const invalidDate = !date || date < data.today || weekend;
  async function change(payload) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await post("/availability", payload);
      await refresh();
      notify("availability updated in this browser.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!offices.length)
    return (
      <>
        <Heading
          eyebrow="Office controls"
          title="Availability"
          description="Office availability is available in the staff and administrator views."
        />
      </>
    );
  return (
    <div className="staff-availability">
      <Heading
        eyebrow="Office controls"
        title="Manage availability"
        description="Set which offices, services, dates, and times students can choose."
      />
      {error && (
        <div role="alert" className="notice error">
          {error}
        </div>
      )}
      <div className="availability-grid">
        {offices.map((item) => (
          <section className="availability-card" key={item.id}>
            <header className="panel-header">
              <div>
                <h2>{item.name}</h2>
                <p>
                  {item.id === "cashier"
                    ? "Payments and promissory notes"
                    : "Student accounting services"}
                </p>
              </div>
              <span className={`chip ${item.enabled ? "green" : "gray"}`}>
                {item.enabled ? "Available" : "Unavailable"}
              </span>
            </header>
            <div className="availability-row office-status">
              <div>
                <strong>Office availability</strong>
                <small>
                  Admin switch for all dates. Turning this off stops new
                  reservations; existing bookings remain.
                </small>
              </div>
              <Toggle
                checked={item.enabled}
                disabled={busy}
                label={`${item.name} office availability`}
                onChange={(enabled) =>
                  change({ kind: "office", officeId: item.id, enabled })
                }
              />
            </div>
            {item.services.map((service) => (
              <div className="availability-row" key={service.id}>
                <div>
                  <strong>{service.name}</strong>
                  <small>
                    {!item.enabled
                      ? "Enable the office to change its services."
                      : service.enabled
                        ? "Available for reservations"
                        : "Unavailable to students"}
                  </small>
                </div>
                <Toggle
                  checked={service.enabled}
                  disabled={busy || !item.enabled}
                  label={`${item.name}: ${service.name} availability`}
                  onChange={(enabled) =>
                    change({
                      kind: "service",
                      officeId: item.id,
                      serviceId: service.id,
                      enabled,
                    })
                  }
                />
              </div>
            ))}
          </section>
        ))}
      </div>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>
              <CalendarDays size={16} /> Date and time availability
            </h2>
            <p>Apply changes to one office and date at a time.</p>
          </div>
        </header>
        <div className="account-form">
          <div className="form-grid">
            {role === "admin" && (
              <div className="field">
                <label htmlFor="availability-office">Office</label>
                <select
                  id="availability-office"
                  value={office.id}
                  disabled={busy}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="availability-date">Date</label>
              <input
                id="availability-date"
                type="date"
                min={data.today}
                value={date}
                disabled={busy}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          {(!office.enabled || invalidDate || dateBlocked) && (
            <div className="notice info">
              <Info size={16} />
              <p>
                {!office.enabled
                  ? "This office is unavailable. Enable it above to manage date and time availability."
                  : invalidDate
                    ? "Choose today or a future weekday. Weekends are unavailable for appointments."
                    : "This date is unavailable. Enable the date to manage its time slots."}
              </p>
            </div>
          )}
          <div
            className="availability-row office-status"
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <div>
              <strong>Office availability on this date</strong>
              <small>
                {date ? dateLabel(date, true) : "Choose a date"} · {office.name}
              </small>
              <small>
                {dateBlocked
                  ? "Closed on this date only."
                  : "Open on this date unless the office admin switch is off."}
              </small>
            </div>
            <Toggle
              checked={!dateBlocked && !invalidDate}
              disabled={busy || !office.enabled || invalidDate}
              label={`${office.name} availability on ${date}`}
              onChange={(enabled) =>
                change({ kind: "date", officeId: office.id, date, enabled })
              }
            />
          </div>
          <div className="time-grid" style={{ marginTop: 18 }}>
            {data.times.map((time) => {
              const blocked = data.blockedTimes.some(
                (x) =>
                  x.officeId === office.id &&
                  x.date === date &&
                  x.time === time,
              );
              const past =
                !!date && new Date(`${date}T${time}:00+08:00`) <= new Date();
              const disabled =
                busy || !office.enabled || invalidDate || dateBlocked || past;
              const count =
                data.slotCounts?.find(
                  (x) =>
                    x.officeId === office.id &&
                    x.date === date &&
                    x.time === time,
                )?.count || 0;
              return (
                <button
                  type="button"
                  key={time}
                  className={`time-button ${!blocked && !disabled ? "selected" : ""}`}
                  disabled={disabled}
                  aria-pressed={!blocked}
                  aria-label={`${timeLabel(time)}, ${blocked ? "unavailable, click to enable" : "available, click to disable"}`}
                  onClick={() =>
                    change({
                      kind: "time",
                      officeId: office.id,
                      date,
                      time,
                      enabled: blocked,
                    })
                  }
                >
                  {timeLabel(time)}
                  <small>
                    {past ? "Past time" : blocked ? "Unavailable" : "Available"}{" "}
                    · {count}/{slotCapacity(data, office.id, date, time)}
                  </small>
                </button>
              );
            })}
          </div>
          <p className="muted" style={{ fontSize: 10, margin: "16px 0 0" }}>
            Click an available time to close it, or an unavailable time to
            reopen it. Existing reservations remain listed.
          </p>
        </div>
      </section>
      <HourlyControls
        key={office.id + date}
        data={data}
        office={office}
        date={date}
        refresh={refresh}
        notify={notify}
      />
    </div>
  );
}

export function Reservations({ data, role, refresh, notify }) {
  const student = role === "student";
 const [sortOrder,setSortOrder]=useState('appointment-oldest');
  const resultsRef = useRef(null),
    filterChanged = useRef(false);
  function updateFilter(field, value) {
    filterChanged.current = true;
    if (field === "date") setDate(value);
    if (field === "service") setService(value);
    if (field === "office") {
      setOffice(value);
      setService("");
    }
    if (field === "status") {
      setStatus(value);
      setDate("");
    }
  }
  const [date, setDate] = useState(""),
    [service, setService] = useState(""),
    [office, setOffice] = useState(""),
    [status, setStatus] = useState("");
  useEffect(() => {
    if (!filterChanged.current) return;
    filterChanged.current = false;
    resultsRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "instant",
    });
  }, [date, service, office, status, sortOrder]);
  const [ticket, setTicket] = useState(null),
    [action, setAction] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const services = data.offices
    .filter(
      (o) =>
        (student || role === "admin" || o.id === role) &&
        (!office || o.id === office),
    )
    .flatMap((o) => o.services.map((s) => ({ ...s, officeName: o.name })));
  const bookings = data.bookings
    .filter(
      (b) =>
        (!date || b.date === date) &&
        (!service || (b.serviceIds || [b.serviceId]).includes(service)) &&
        (!office || b.officeId === office) &&
        (!status || reservationState(b) === status),
    )
    .sort((a,b)=>compareReservations(sortOrder,a,b));
  async function confirmAction() {
    if (!action || busy) return;
    setBusy(true);
    setError("");
    try {
      if (action.status === "checked-in")
        await post("/checkin", { token: action.booking.token });
      else
        await post(`/bookings/${action.booking.id}/status`, {
          status: action.status,
        });
      await refresh();
      notify(
        action.status === "cancelled"
          ? "Reservation cancelled."
          : action.status === "checked-in"
            ? "Ticket admitted at the counter. Service has started."
            : "Appointment marked completed.",
      );
      setAction(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="reservations-page">
      <Heading
        eyebrow={student ? "Your appointments" : "Office queue"}
        title={student ? "My reservations" : "Reservations"}
        description={
          student
            ? "View your saved tickets and manage upcoming visits."
            : "Review reservations, check arrival status, and complete office visits."
        }
      />

      {student && <PriorityNotice />}
      <div className="toolbar">
        <div>
          <div className="field">
            <label htmlFor="reservation-date">Appointment date</label>
            <input
              id="reservation-date"
              type="date"
              value={date}
              onChange={(e) => updateFilter("date", e.target.value)}
            />
          </div>
          {role === "admin" && (
            <div className="field">
              <label htmlFor="reservation-office">Office</label>
              <select
                id="reservation-office"
                value={office}
                onChange={(e) => updateFilter("office", e.target.value)}
              >
                <option value="">All offices</option>
                {data.offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="reservation-service">Service</label>
            <select
              id="reservation-service"
              value={service}
              onChange={(e) => updateFilter("service", e.target.value)}
            >
              <option value="">All services</option>
              {services.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="reservation-status">Status</label>
            <select
              id="reservation-status"
              value={status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {[
                "booked",
                "waiting",
                "checked-in",
                "completed",
                "cancelled",
                "passed",
              ].map((s) => (
                <option key={s} value={s}>
                  {statusText(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="field"><label htmlFor="reservation-sort">Sort by</label><select id="reservation-sort" value={sortOrder} onChange={e=>{filterChanged.current=true;setSortOrder(e.target.value);}}>{reservationSortOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
        </div>
        <button
          className="button secondary small"
          onClick={() => {
            setDate("");
            setService("");
            setOffice("");
            setStatus("");
          }}
        >
          Clear filters
        </button>
      </div>
      {!student && (
        <div className="queue-date-shortcuts">
          {date && <span>{`Showing ${dateLabel(date)} appointments`}</span>}
          <button
            type="button"
            className="button secondary small"
            aria-pressed={date === data.today}
            onClick={() => updateFilter("date", data.today)}
          >
            Today only
          </button>
          <button
            type="button"
            className="button secondary small"
            aria-pressed={!date}
            onClick={() => updateFilter("date", "")}
          >
            All dates
          </button>
        </div>
      )}
      {!student && (
        <p className="notice info">
          Admit students when they reach the counter, then mark their visits complete. Walk-ins
          are admitted when their counter service begins.
        </p>
      )}
      <section
        className="panel reservation-results"
        ref={resultsRef}
        aria-label="Reservation results"
      >
        <header className="panel-header">
          <div>
            <h2>{student ? "Reservation history" : "Appointment queue"}</h2>
            <p role="status" aria-live="polite" aria-atomic="true">
              {bookings.length}{" "}
              {bookings.length === 1 ? "reservation" : "reservations"} shown
            </p>
          </div>
          <ClipboardList size={18} className="muted" />
        </header>
        {bookings.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Queue</th>
                  {!student && <th>Student</th>}
                  <th>Office & service</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="queue-number">{b.queueNumber}</span>
                      {b.type === "walk-in" && <small>Walk-in</small>}
                    </td>
                    {!student && (
                      <td>
                        <strong>{b.studentName || "Name not provided"}</strong>
                        <small>{b.studentNumber || "ID not provided"}</small>
                      </td>
                    )}
                    <td>
                      <strong
                        className={
                          "reservation-office-name office-" + b.officeId
                        }
                      >
                        {officeName(b.officeId)}
                      </strong>
                      <small>
                        {serviceName(
                          data,
                          b.officeId,
                          b.serviceIds || b.serviceId,
                        )}
                      </small>
                    </td>
                    <td>
                      <strong>{dateLabel(b.date)}</strong>
                      <small>{timeLabel(b.time)}</small>
                    </td>
                    <td>
                      <span
                        className={`chip ${appointmentPassed(b) ? "amber" : statusColor(b.status)}`}
                      >
                        {reservationLabel(b)}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="button secondary small"
                          onClick={() => setTicket(b)}
                          aria-label={`View ticket ${b.queueNumber}`}
                        >
                          <Eye size={14} />
                          Ticket
                        </button>
                        {!student && b.status === "booked" && (
                          <button
                            className="button secondary small"
                            disabled={!appointmentIsCurrent(b)}
                            title={
                              !appointmentIsCurrent(b)
                                ? "Being served is available only during the scheduled date and hour (Manila time)."
                                : "Admit this student at the counter"
                            }
                            onClick={() => {
                              setError("");
                              setAction({ booking: b, status: "checked-in" });
                            }}
                          >
                            Admit at counter
                          </button>
                        )}
                        {!student && (
                          <button
                            className="button secondary small"
                            disabled={b.status !== "checked-in"}
                            onClick={() => {
                              setError("");
                              setAction({ booking: b, status: "completed" });
                            }}
                            title={
                              b.status !== "checked-in"
                                ? "Admit this ticket at the counter before completing it."
                                : "Mark this visit completed"
                            }
                          >
                            <Check size={14} />
                            Complete
                          </button>
                        )}
                        {["booked", "checked-in"].includes(b.status) && (
                          <button
                            className="button danger small"
                            onClick={() => {
                              setError("");
                              setAction({ booking: b, status: "cancelled" });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <CalendarDays />
            </div>
            <h3>
              {data.bookings.length
                ? "No matching reservations"
                : "No reservations yet"}
            </h3>
            <p>
              {data.bookings.length
                ? "Try another date, service, or status, or clear your filters."
                : student
                  ? "Choose an office and service in Slot Management to create a reservation."
                  : "Create a reservation using the Student account to preview this queue."}
            </p>
          </div>
        )}
      </section>
      {ticket && (
        <Ticket
          booking={data.bookings.find((b) => b.id === ticket.id) || ticket}
          data={data}
          onClose={() => setTicket(null)}
        />
      )}
      {action && (
        <Modal
          title={
            action.status === "cancelled"
              ? "Cancel this reservation?"
              : action.status === "checked-in"
                ? "Admit this student at the counter?"
                : "Complete this appointment?"
          }
          onClose={() => {
            if (!busy) setAction(null);
          }}
          footer={
            <>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => setAction(null)}
              >
                Go back
              </button>
              <button
                className={`button ${action.status === "cancelled" ? "danger" : "primary"}`}
                disabled={
                  busy ||
                  (action.status === "checked-in" &&
                    !appointmentIsCurrent(action.booking))
                }
                onClick={confirmAction}
              >
                {busy
                  ? "Saving…"
                  : action.status === "cancelled"
                    ? "Cancel reservation"
                    : action.status === "checked-in"
                      ? "Admit at counter"
                      : "Mark completed"}
              </button>
            </>
          }
        >
          <p className="muted">
            <strong>{action.booking.queueNumber}</strong> ·{" "}
            {officeName(action.booking.officeId)}
            <br />
            {dateLabel(action.booking.date)} at {timeLabel(action.booking.time)}
          </p>
          <p className="notice info">
            {action.status === "cancelled"
              ? "The reservation will be cancelled and its slot will become available again."
              : action.status === "checked-in"
                ? "Confirm that the student is at your counter and you are starting their payment or requested service. Mark the visit completed when finished."
                : "This appointment will be marked completed in the browser queue."}
          </p>
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
        </Modal>
      )}
      <div className="ui-status-guide">
        <strong>Ticket status</strong>
        <span>Reserved · future appointment</span>
        <span>Reserved · service has not started</span>
        <span>Being served · admitted at the counter</span>
        <span>Appointment passed · window ended without check-in</span>
      </div>
    </div>
  );
}

function extractToken(value) {
  const text = value.trim();
  try {
    return (
      new URL(text, window.location.origin).searchParams.get("token") || text
    );
  } catch {
    return text;
  }
}
export function Verify({ role, refresh, notify, initialToken = "" }) {
  const [input, setInput] = useState(initialToken),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function inspect(value) {
    const token = extractToken(value);
    setError("");
    setResult(null);
    if (!token) {
      setError("Paste a booking token or its QR verification link.");
      return;
    }
    setBusy(true);
    try {
      setResult(await api(`/verify?token=${encodeURIComponent(token)}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (initialToken) {
      setInput(initialToken);
      void inspect(initialToken);
    }
  }, [initialToken]);
  const booking = result?.booking;
  const staff = ["admin", "cashier", "accounting"].includes(role);
  const rightOffice =
    !!booking && (role === "admin" || role === booking.officeId);
  async function checkin() {
    if (!booking || busy) return;
    setBusy(true);
    setError("");
    try {
      await post("/checkin", { token: booking.token });
      setResult(
        await api(`/verify?token=${encodeURIComponent(booking.token)}`),
      );
      await refresh?.();
      notify?.("Ticket admitted at the counter. Service has started.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="Reservation lookup"
        title="Verify Queue Ticket"
        description="Paste the token or link encoded in a reservation’s QR code."
      />

      <section className="panel verify-lookup-panel" style={{ padding: 24 }}>
        <h2 className="section-title">
          <QrCode size={18} /> Ticket Lookup
        </h2>
        <form className="verify-lookup-form"
          onSubmit={(e) => {
            e.preventDefault();
            void inspect(input);
          }}
          style={{ marginTop: 20 }}
        >
          <label htmlFor="verify-token">
            QR Verification Link Or Booking Token
          </label>
          <div className="verify-input" style={{ marginTop: 8 }}>
            <input
              id="verify-token"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a QR link or token"
              autoComplete="off"
              maxLength={2048}
              disabled={busy}
            />
            <button className="button primary verify-submit" disabled={busy || !input.trim()}>
              <Search size={16} />
              {busy ? "Checking…" : "Check Ticket"}
            </button>
          </div>
        </form>
        {error && (
          <div role="alert" className="notice error" style={{ marginTop: 18 }}>
            {error}
          </div>
        )}
        {result && (
          <div
            className={`verify-result ${!result.valid && !["checked-in", "completed"].includes(booking?.status) ? "invalid" : ""}`}
            aria-live="polite"
          >
            {result.valid ? (
              <ShieldCheck size={30} color="#398263" />
            ) : booking?.status === "checked-in" ? (
              <CheckCircle2 size={30} color="#9b7a38" />
            ) : (
              <XCircle size={30} color="#ae796d" />
            )}
            <h3>
              {result.valid
                ? "Ticket Found"
                : booking
                  ? `Ticket ${statusText(booking.status).toLowerCase()}`
                  : "No Ticket Found"}
            </h3>
            <p>
              {result.valid
                ? "This browser has an unused reservation matching the token."
                : booking
                  ? "This ticket cannot be admitted again."
                  : "Open this page in the browser where you created the reservation, or check the link and try again."}
            </p>
            {booking && (
              <>
                <div className="summary-row">
                  <span>Queue Number</span>
                  <strong>{booking.queueNumber}</strong>
                </div>
                <div className="summary-row">
                  <span>Office</span>
                  <strong>{officeName(booking.officeId)}</strong>
                </div>
                <div className="summary-row">
                  <span>Date</span>
                  <strong>{dateLabel(booking.date)}</strong>
                </div>
                <div className="summary-row">
                  <span>Time</span>
                  <strong>{timeLabel(booking.time)}</strong>
                </div>
                <div className="summary-row">
                  <span>Status</span>
                  <strong>{statusText(booking.status)}</strong>
                </div>
                {staff && (
                  <button
                    className="button primary"
                    style={{ marginTop: 18 }}
                    disabled={
                      busy ||
                      !result.valid ||
                      !rightOffice ||
                      !appointmentIsCurrent(booking)
                    }
                    onClick={checkin}
                  >
                    <Check size={16} />
                    Admit at counter
                  </button>
                )}
                {staff && !appointmentIsCurrent(booking) && (
                  <p className="notice info" style={{ marginTop: 12 }}>
                    Counter admission is available only on {dateLabel(booking.date)}, the
                    appointment date (Manila time).
                  </p>
                )}
                {staff && !rightOffice && (
                  <p style={{ marginTop: 12 }}>
                    Use the {officeName(booking.officeId)} account to admit
                    this ticket.
                  </p>
                )}
                {!staff && result.valid && (
                  <p style={{ marginTop: 12 }}>
                    The corresponding office account can mark this ticket
                    admitted at the counter to start service.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export function Accounts({ data, refresh, notify }) {
  const [form, setForm] = useState({ name: "", email: "", role: "student" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await post("/accounts", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      });
      await refresh();
      setForm({ name: "", email: "", role: "student" });
      notify("Account details saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-management-page">
      <Heading
        eyebrow="Administrator"
        title="Account management"
        description="Manage account display names and office roles."
      />

      <section className="panel" style={{ marginBottom: 22 }}>
        <header className="panel-header">
          <div>
            <h2>
              <Users size={17} /> Account list
            </h2>
            <p>{data.accounts.length} accounts</p>
          </div>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((account, index) => (
                <tr key={account.email || index}>
                  <td>
                    <strong>{account.name}</strong>
                  </td>
                  <td>{account.email}</td>
                  <td>
                    <span
                      className={`chip ${account.role === "admin" ? "amber" : "blue"}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className="button secondary small"
                      onClick={() => {
                        setForm({
                          name: account.name,
                          email: account.email,
                          role: account.role,
                        });
                        setError("");
                        document.getElementById("account-name")?.focus();
                      }}
                    >
                      <Pencil size={13} />
                      Edit details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>
              <Settings2 size={17} /> Add or update account details
            </h2>
            <p>
              Use an existing email to update display details. Sign-in
              credentials stay unchanged.
            </p>
          </div>
        </header>
        <form className="account-form" onSubmit={save}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="account-name">Full name</label>
              <input
                id="account-name"
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="account-email">Email address</label>
              <input
                id="account-email"
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="account-role">Role</label>
              <select
                id="account-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role[0].toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button
              className="button primary"
              disabled={busy || !form.name.trim() || !form.email.trim()}
            >
              <Check size={16} />
              {busy ? "Saving…" : "Save mapping"}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => {
                setForm({ name: "", email: "", role: "student" });
                setError("");
              }}
            >
              Clear form
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
