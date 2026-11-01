import React from "react";
import { Radio, ShieldCheck } from "lucide-react";
export default function CampusUpdates({
  data,
  offices,
  showCounter = true,
  showPolicies = true,
}) {
  return (
    <div className="campus-updates">
      {showCounter && (
        <section className="campus-updates-panel">
          <header>
            <h2>
              <Radio size={20} />
              Counter service status
            </h2>
            <p>
              Today · {data.today} · Refreshes every 3 seconds in this browser
            </p>
            <small>
              Updated{" "}
              {new Date(data.queueUpdatedAt).toLocaleTimeString("en-PH", {
                timeZone: "Asia/Manila",
              })}
            </small>
          </header>
          <div className="campus-updates-grid">
            {offices.map((o) => {
              const q = data.queueSummary?.find((q) => q.officeId === o.id);
              return (
                <article key={o.id}>
                  <div className="counter-office">
                    <strong>{o.name} Department</strong>
                    <span className={"chip " + (o.enabled ? "green" : "gray")}>
                      {o.enabled ? "Open" : "Unavailable"}
                    </span>
                  </div>
                  <p>Tickets currently being served</p>
                  <strong className="counter-number">
                    {q?.checkedIn[0] || "No tickets being served"}
                  </strong>
                  <div className="counter-counts">
                    <span>
                      Reserved: <b>{q?.reserved ?? 0}</b>
                    </span>
                    <span>
                      Being served: <b>{q?.checkedIn.length ?? 0}</b>
                    </span>
                  </div>
                  <p>
                    {o.enabled
                      ? "Join the physical line. Present your ticket when you reach the counter."
                      : "Office is currently unavailable. Check availability before visiting."}
                  </p>
                </article>
              );
            })}
          </div>
          <p>
            Reserved tickets have not started service. Being served means staff has admitted the ticket at the counter. The physical waiting line is not tracked.
          </p>
        </section>
      )}
      {showPolicies && (
        <section className="campus-updates-panel campus-policy-panel">
          <header>
            <h2>
              <ShieldCheck size={20} />
              Campus notices & department policies
            </h2>
            <p>Prepare for your Accounting or Cashier visit</p>
          </header>
          <div className="campus-updates-grid">
            <article className="policy-accounting">
              <span className="ref-card-kicker">Accounting policy</span>
              <h3>Examination permit booking</h3>
              <p>
                Before booking an examination permit, ensure that prior-term
                tuition holds are settled or that an authorized promissory note
                has been submitted. Ask Accounting to confirm your clearance and
                required documents.
              </p>
              <details className="policy-more">
                <summary>What to bring</summary>
                <p>
                  Bring your student ID, payment receipt or approved promissory
                  note, and queue ticket. A reservation does not confirm permit
                  eligibility.
                </p>
              </details>
            </article>
            <article className="policy-capacity">
              <span className="ref-card-kicker">
                Hourly capacity & check-in
              </span>
              <h3>Reserve an available hourly window</h3>
              <p>
                The default limit is {data.capacity} reservations per office per
                hour. Staff may adjust capacity; the booking calendar shows
                current availability. If a window is full, choose another
                available time.
              </p>
              <details className="policy-more">
                <summary>Arrival & check-in</summary>
                <p>
                  Arrive within your reserved window and present your QR ticket
                  for check-in. Stay nearby afterward and wait for staff to call
                  your number. Contact the office for help with a missed
                  appointment.
                </p>
              </details>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}
