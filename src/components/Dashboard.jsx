import "./Dashboard.css";
import "./DashboardOrganization.css";
import { appointmentPassed, reservationLabel } from "../appointmentStatus.js";
import React, { useState } from "react";
import QueueTicket from "./Ticket.jsx";
import Modal from "./Modal.jsx";
import CampusUpdates from "./CampusUpdates.jsx";
import {
  ChevronDown,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ReceiptText,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { dateLabel, timeLabel, officeName, serviceName } from "../api.js";

export default function Dashboard({
  data,
  user,
  role,
  setPage,
  onChooseOffice,
}) {
  const [queueTicket, setQueueTicket] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const student = role === "student";
  const active = data.bookings
    .filter((b) => ["booked", "checked-in"].includes(b.status) && b.date >= data.today && !appointmentPassed(b))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = active.filter(
    (b) =>
      new Date(`${b.date}T${b.time}:00+08:00`).getTime() >= Date.now() ||
      (b.status === "checked-in" && b.date >= data.today),
  );
  const today = data.bookings.filter((b) => b.date === data.today);
  const offices = data.offices.filter(
    (o) => student || role === "admin" || o.id === role,
  );
  const available = offices.filter((o) => o.enabled).length;
  const liveTicket =
    active.find((b) => b.id === selectedTicketId) ||
    active.find((b) => b.date === data.today && b.status === "checked-in") ||
    active.find((b) => b.date === data.today && !appointmentPassed(b)) ||
    active.find((b) => b.date > data.today) ||
    active.at(-1);
  const pastTicket = !!liveTicket && appointmentPassed(liveTicket);
  const futureTicket = !!liveTicket && liveTicket.date > data.today;
  const servingTicket = !!liveTicket && liveTicket.date === data.today && liveTicket.status === "checked-in";
const metrics = student
    ? [
        {
          label: "Upcoming visits",
          value: upcoming.length,
          Icon: CalendarDays,
          tone: "blue",
        },
        {
          label: "Completed visits",
          value: data.bookings.filter((b) => b.status === "completed").length,
          Icon: CheckCircle2,
          tone: "cyan",
        },
        {
          label: "Available offices",
          value: `${available} / ${offices.length}`,
          Icon: Wallet,
          tone: "blue",
        },
      ]
    : [
        {
          label: "Reserved today",
          value: today.filter((b) => b.status === "booked").length,
          Icon: Clock,
          tone: "amber",
        },
        {
          label: "Being served",
          value: today.filter((b) => b.status === "checked-in").length,
          Icon: Users,
          tone: "blue",
        },
        {
          label: "Completed today",
          value: today.filter((b) => b.status === "completed").length,
          Icon: CheckCircle2,
          tone: "cyan",
        },
      ];
  const recent = [...data.bookings]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 4);
  return (
    <div
      className={`ref-dashboard ref-dashboard-focused ${student ? "student-compact-dashboard" : ""} ${role === "admin" ? "admin-dashboard" : ""}`}
    >
      <div className="ref-dash-heading">
        <div>
          <h1 className="dashboard-welcome">
            Welcome,{" "}
            <span>
              {role === "accounting"
                ? "Mr. Edwin F. Llamera"
                : role === "cashier"
                  ? "Ma’am Jeanie Benzon"
                  : user.name.trim().split(/\s+/)[0]}
            </span>
            <span className="welcome-dot">!</span>
          </h1>
        </div>
        <span className="ref-date-pill">
          <CalendarDays size={18} />
          {dateLabel(data.today, true)}
        </span>
      </div>
      <section className="ref-summary-grid" aria-label="Dashboard overview">
        {metrics.map(({ label, value, Icon, tone }) => (
          <article className={`ref-summary-card ${tone}`} key={label}>
            <div className="ref-summary-top">
              <span className="ref-metric-icon">
                <Icon size={22} />
              </span>
              <span className="ref-summary-label">{label}</span>
            </div>
            <strong className="ref-summary-value">{value}</strong>
          </article>
        ))}
      </section>
      <div className="ref-dash-primary">
        <section className="ref-campus-hero">
          <div className="ref-hero-copy">
            <h2>{student ? "Book a campus visit" : "Manage today’s queue"}</h2>
            <p>
              {student
                ? "Choose a service and an available appointment time."
                : "Admit students at the counter and complete their visits."}
            </p>
            <button
              className="button primary"
              onClick={() => setPage(student ? "slots" : "queue")}
            >
              {student ? "Book a slot" : "Open queue"}
              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
        <section className="ref-office-section">
          <div className="ref-section-header">
            <h2>{student ? "Offices & services" : "Your service desks"}</h2>
          </div>
          <div className="ref-office-cards">
            {offices.map((o) => (
              <button
                disabled={!o.enabled && student}
                key={o.id}
                className="ref-office-link"
                onClick={() =>
                  student ? onChooseOffice(o.id) : setPage("availability")
                }
              >
                <span className={`ref-office-emblem ${o.id}`}>
                  {o.id === "cashier" ? (
                    <Wallet size={25} />
                  ) : (
                    <ReceiptText size={25} />
                  )}
                </span>
                <span className="ref-office-copy">
                  <strong>{o.name}</strong>
                  <small>{o.services.map((s) => s.name).join(" · ")}</small>
                  <span className={`chip ${o.enabled ? "green" : "gray"}`}>
                    <i />
                    {o.enabled ? "Available" : "Unavailable"}
                  </span>
                </span>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
        </section>
        {student && (
          <CampusUpdates data={data} offices={offices} showCounter={false} />
        )}
      </div>
      {queueTicket === "empty" ? (
        <Modal
          title="My service status"
          onClose={() => setQueueTicket(null)}
          footer={
            <button
              className="button primary"
              onClick={() => {
                setQueueTicket(null);
                setPage("slots");
              }}
            >
              Book a slot
            </button>
          }
        >
          <div className="empty-state">
            <Ticket size={32} />
            <h3>No active reservation</h3>
            <p>
              Book an appointment to see your status, your position, and the
              queue numbers ahead of you.
            </p>
          </div>
        </Modal>
      ) : (
        queueTicket && (
          <QueueTicket
            booking={queueTicket}
            data={data}
            onClose={() => setQueueTicket(null)}
          />
        )
      )}
      <div className="ref-dash-bottom">
        <section
          className={`ref-next-card ${student ? "" : "staff-office-availability"}`}
        >
          <header>
            <h2 className="live-queue-subheading">
              {student ? (servingTicket ? "My service status" : "My reservation") : "Office availability"}
            </h2>
            <Clock size={20} />
          </header>
          {student ? (
            liveTicket ? (
              <>
                {active.length > 1 && (
                  <div className="live-queue-picker">
                    <label htmlFor="dashboard-queue-ticket">
                      Your reservations
                    </label>
                    <div className="live-queue-select-wrap">
                      <select
                        id="dashboard-queue-ticket"
                        aria-label="Your reserved tickets"
                        value={liveTicket.id}
                        onChange={(e) => setSelectedTicketId(e.target.value)}
                      >
                        {active.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.queueNumber} · {dateLabel(b.date)} ·{" "}
                            {officeName(b.officeId)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={17} aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div className="live-queue-ticket-heading">
                  <span className="ref-next-queue">
                    {liveTicket.queueNumber}
                  </span>
                  <span className={`live-queue-status ${liveTicket.status}`}>
                    {reservationLabel(liveTicket)}
                  </span>
                </div>
                <div className="live-queue-appointment">
                  <div className="live-queue-service">
                    <h2>{officeName(liveTicket.officeId)}</h2>
                    <p>
                      {serviceName(
                        data,
                        liveTicket.officeId,
                        liveTicket.serviceIds || liveTicket.serviceId,
                      )}
                    </p>
                  </div>
                  <div className="ref-next-schedule">
                    <CalendarDays size={18} />
                    <span>
                      {dateLabel(liveTicket.date)}
                      <small>{timeLabel(liveTicket.time)}</small>
                    </span>
                  </div>
                </div>
                <div className="live-queue-counts"><p>{servingTicket
                  ? "Your ticket has been admitted at the counter. The office is handling your service."
                  : futureTicket ? "Reserved for " + dateLabel(liveTicket.date) + ". Join the physical line on your appointment date."
                  : "Join the physical line at your appointment time. Present your ticket when you reach the counter."}</p></div>
                <button
                  className="ref-text-button dashboard-view-action"
                  onClick={() => setQueueTicket(liveTicket)}
                >
                  {servingTicket ? "View service status" : "View reservation"}
                  <ArrowUpRight size={18} />
                </button>
              </>
            ) : (
              <>
                <h2>No active queue ticket</h2>
                <p>
                  Your ticket, status, and place in line will appear here after
                  you book an appointment.
                </p>
                <button
                  className="ref-text-button dashboard-view-action"
                  onClick={() => setQueueTicket("empty")}
                >
                  View my service status
                  <ArrowUpRight size={18} />
                </button>
              </>
            )
          ) : (
            <>
              <h2 className={available === 0 ? "office-unavailable" : ""}>
                {offices.length === 1
                  ? available
                    ? "Available"
                    : "Unavailable"
                  : available + " of " + offices.length + " offices open"}
              </h2>
              <p>
                {offices.reduce(
                  (n, o) =>
                    n +
                    (o.enabled
                      ? o.services.filter((s) => s.enabled).length
                      : 0),
                  0,
                )}{" "}
                services available for booking.
              </p>
              <button
                className="button secondary"
                onClick={() => setPage("availability")}
              >
                Manage availability
                <ArrowUpRight size={18} />
              </button>
            </>
          )}
        </section>
        <section className="ref-recent-card">
          <div className="ref-section-header">
            <h2>{student ? "Recent reservations" : "Recent queue activity"}</h2>
            <button
              className="ref-text-button"
              onClick={() => setPage(student ? "reservations" : "queue")}
            >
              View all
              <ArrowUpRight size={17} />
            </button>
          </div>
          {recent.length ? (
            <div className="ref-recent-list">
              {recent.map((b) => (
                <button
                  key={b.id}
                  className="ref-recent-row"
                  onClick={() =>
                    student ? setQueueTicket(b) : setPage("queue")
                  }
                >
                  <span className="ref-recent-symbol">
                    <Ticket size={20} />
                  </span>
                  <span>
                    <strong>
                      {officeName(b.officeId)} ·{" "}
                      {serviceName(
                        data,
                        b.officeId,
                        b.serviceIds || b.serviceId,
                      )}
                    </strong>
                    <small>
                      {dateLabel(b.date)} at {timeLabel(b.time)}
                    </small>
                  </span>
                  <span
                    className={
                      "ref-recent-status status-" +
                      (appointmentPassed(b) ? "passed" : b.status)
                    }
                  >
                    {reservationLabel(b)}
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="ref-recent-empty">
              <Ticket size={28} />
              <p>
                {student ? "No reservations yet." : "No queue activity yet."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
