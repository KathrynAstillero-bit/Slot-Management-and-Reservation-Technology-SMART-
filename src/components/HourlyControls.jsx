import React, { useState } from "react";
import { post, timeLabel, dateLabel } from "../api.js";
import { slotCapacity } from "../slotCapacity.js";

export default function HourlyControls({
  data,
  office,
  date,
  refresh,
  notify,
}) {
  const [time, setTime] = useState(data.times[0]),
    [limit, setLimit] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [name, setName] = useState(""),
    [number, setNumber] = useState(""),
    [service, setService] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  const missingWalkin = [
    ...(!name.trim() && !number.trim() ? ["a student name or student ID"] : []),
    ...(!office.services.some((s) => s.id === service && s.enabled)
      ? ["an available service"]
      : []),
    ...(!confirmed
      ? ["confirmation that staff can accommodate the walk-in"]
      : []),
  ];
  const current = slotCapacity(data, office.id, date, time);
  const count =
    data.slotCounts?.find(
      (s) => s.officeId === office.id && s.date === date && s.time === time,
    )?.count || 0;
  const invalid =
    !date ||
    date < data.today ||
    [0, 6].includes(new Date(date + "T12:00:00+08:00").getUTCDay()) ||
    new Date(`${date}T${time}:00+08:00`) <= new Date();
  const walkins = data.bookings.filter(
    (b) =>
      b.officeId === office.id && b.date === data.today && b.type === "walk-in",
  );
  async function save(event, reset = false) {
    event?.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await post("/slot-limits", {
        officeId: office.id,
        date,
        time,
        limit: reset ? 30 : Number(limit || current),
      });
      await refresh();
      setLimit("");
      notify("Hourly reservation limit saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function admit(event) {
    event.preventDefault();
    if (busy) return;
    if (missingWalkin.length || !office.enabled) {
      setError(
        "Complete the required walk-in details and confirmation before admitting a student.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      await post("/walkins", {
        officeId: office.id,
        studentName: name,
        studentNumber: number,
        serviceId: service,
      });
      await refresh();
      setName("");
      setNumber("");
      setConfirmed(false);
      notify("Walk-in admitted. Existing reservations keep priority.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hourly-controls">
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Hourly reservation limit</h2>
            <p>
              {office.name} · {dateLabel(date)} · Default: 30 reservations per
              hour
            </p>
          </div>
        </header>
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="capacity-hour">Hour</label>
              <select
                id="capacity-hour"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setLimit("");
                }}
              >
                {data.times.map((t) => (
                  <option key={t} value={t}>
                    {timeLabel(t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="capacity-limit">Reservation limit</label>
              <input
                id="capacity-limit"
                type="number"
                min={Math.max(1, count)}
                max="300"
                step="1"
                required
                value={limit || current}
                disabled={busy || invalid}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          </div>
          <p className="muted">
            {count} reserved · {Math.max(0, current - count)} remaining. Applies
            only to this office, date, and hour. Existing bookings are
            protected. Change the date above and choose a future hour to edit.
          </p>
          {invalid && (
            <p className="notice info">
              Select a future hourly slot on a weekday using the date above.
            </p>
          )}
          <div className="actions">
            <button
              className="button primary save-limit-button"
              disabled={busy || invalid}
            >
              Save limit
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy || invalid || count > 30 || current === 30}
              onClick={() => save(null, true)}
            >
              Reset to 30
            </button>
          </div>
        </form>
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Walk-in admission</h2>
            <p>
              {office.name} · Today · Enter a name or student ID. Accept only
              when staff have spare capacity.
            </p>
          </div>
        </header>
        <p className="notice info">
          Booked students keep priority. Walk-ins have a separate W queue number
          and do not consume online reservation slots.
        </p>
        <form onSubmit={admit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="walkin-name">Student name</label>
              <input
                id="walkin-name"
                value={name}
                maxLength="100"
                required={!number.trim()}
                placeholder="Name or student ID is enough"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="walkin-id">Student ID</label>
              <input
                id="walkin-id"
                value={number}
                maxLength="40"
                required={!name.trim()}
                placeholder="Optional if name is provided"
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="walkin-service">Service</label>
              <select
                id="walkin-service"
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">Choose a service</option>
                {office.services
                  .filter((s) => s.enabled)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <label className="walkin-confirm">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I have checked the booked queue and staff can accommodate this
              walk-in.
            </span>
          </label>
          <p id="walkin-requirements" className="notice info" role="status">
            {!office.enabled
              ? "Walk-in admission is unavailable while this office is closed."
              : missingWalkin.length
                ? "You cannot admit a walk-in yet. Please provide " +
                  missingWalkin.join(", ") +
                  "."
                : "Required details are complete. You can admit this walk-in."}
          </p>
          <button
            className="button primary admit-walkin-button"
            aria-describedby="walkin-requirements"
            disabled={busy || !office.enabled || missingWalkin.length > 0}
          >
            {busy ? "Admitting…" : "Admit walk-in"}
          </button>
        </form>
        <p className="muted">
          {walkins.length} walk-ins recorded today. Review and complete visits
          in Queue Management.
        </p>
      </section>
    </div>
  );
}
