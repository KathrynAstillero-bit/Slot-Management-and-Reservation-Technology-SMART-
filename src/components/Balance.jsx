import "./Balance.css";
import React, { useState } from "react";
import { ChevronDown, BookOpen, SlidersHorizontal } from "lucide-react";
import {
  buildAssessment,
  summarizeBalance,
  paymentPeriods,
  peso,
} from "../balanceSchedule.js";
const subjects = [
  ["STC", "Science, Technology & Society"],
  ["ACCTNG", "Fundamentals of Accounting"],
  ["ITP 306", "Networking 1"],
  ["Humanities", "Art Appreciation"],
  ["ITP 302", "Systems Integration and Architecture 1"],
  ["ITP 303", "Information Assurance and Security 1"],
  ["ITP Elective 3", "Integrative Programming and Technologies"],
];
export default function Balance({ profile }) {
  const [period, setPeriod] = useState(2),
    [scenario, setScenario] = useState("unpaid"),
    [discounted, setDiscounted] = useState(false),
    [discountPercent, setDiscountPercent] = useState(40),
    [showControls, setShowControls] = useState(false);
  const assessment = buildAssessment(discounted ? discountPercent : 0),
    payments =
      scenario === "paid"
        ? assessment.schedule
        : scenario === "partial"
          ? [
              assessment.schedule[0],
              Math.round(assessment.schedule[1] / 2),
              0,
              0,
              0,
            ]
          : [],
    balance = summarizeBalance(assessment, payments, period);
  return (
    <div className="balance-page balance-compact">
      <div className="page-heading">
        <div>
          <h1>Balance Inquiry</h1>
          <p className="page-subtitle">
            Your matriculation and payment schedule at a glance.
          </p>
        </div>
        <span className="balance-record-label">Sample record</span>
      </div>
      <div className="balance-totals" aria-label="Balance overview">
        <article className="panel">
          <span>Remaining balance</span>
          <strong className={balance.remaining === 0 ? "balance-paid" : ""}>
            {peso(balance.remaining)}
          </strong>
          <small>Includes upcoming installments</small>
        </article>
        <article className="panel">
          <span>Due through {paymentPeriods[period]}</span>
          <strong className={balance.due > 0 ? "balance-due" : "balance-paid"}>
            {peso(balance.due)}
          </strong>
          <small>
            {balance.due > 0 ? "Unpaid amounts due now" : "No payment due"}
          </small>
        </article>
        <article className="panel">
          <span>Total paid</span>
          <strong className={balance.paid > 0 ? "balance-paid" : ""}>
            {peso(balance.paid)}
          </strong>
          <small>Of {peso(assessment.total)} assessed</small>
        </article>
      </div>
      <section
        className="panel matriculation compact-statement"
        aria-label="Certificate of matriculation"
      >
        <header className="statement-brand">
          <img src="/assets/ccdi-logo.png" alt="CCDI logo" />
          <div>
            <h2>Certificate of Matriculation</h2>
            <p>
              Computer Communication Development Institute · Sorsogon Campus
            </p>
          </div>
          <span className="statement-year">
            1st semester
            <br />
            2025–2026
          </span>
        </header>
        <dl className="matriculation-details">
          <div>
            <dt>Student</dt>
            <dd>{profile?.name || "Student"}</dd>
          </div>
          <div>
            <dt>Student ID</dt>
            <dd>{profile?.number || "—"}</dd>
          </div>
          <div>
            <dt>Course & year</dt>
            <dd>{profile?.course || "BS Information Technology · 3rd Year"}</dd>
          </div>
        </dl>
        <div className="statement-columns">
          <details className="statement-assessment">
            <summary>
              <span>
                Fees assessed <small>{peso(assessment.total)} total</small>
              </span>
              <ChevronDown size={18} />
            </summary>
            {[
              ["Tuition fee", assessment.tuition],
              ["Laboratory fee", assessment.laboratory],
              ["Miscellaneous fee", assessment.miscellaneous],
            ].map(([name, amount]) => (
              <div className="summary-row" key={name}>
                <span>{name}</span>
                <strong>{peso(amount)}</strong>
              </div>
            ))}
            <div className="summary-row assessment-total">
              <span>Total assessment</span>
              <strong>{peso(assessment.total)}</strong>
            </div>
            {discounted && (
              <p className="statement-note">
                {discountPercent}% tuition discount applied.
              </p>
            )}
            <p className="statement-note">
              Registration covers miscellaneous fees. Remaining fees: 30%
              Prelim, 30% Midterm, 25% Semi-final, 15% Final.
            </p>
          </details>
          <section className="statement-payments" aria-label="Payment schedule">
            <div className="statement-section-heading">
              <h3>Payment schedule</h3>
              <div className="statement-heading-actions">
                <label className="statement-period">
                  Current period
                  <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                  >
                    {paymentPeriods.map((name, index) => (
                      <option value={index} key={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="button secondary small statement-controls-button"
                  aria-expanded={showControls}
                  aria-controls="statement-presentation-controls"
                  onClick={() => setShowControls(!showControls)}
                >
                  <SlidersHorizontal size={16} />
                  Presentation controls
                </button>
              </div>
            </div>
            {showControls && (
              <div
                id="statement-presentation-controls"
                className="statement-presentation-controls"
              >
                <label>
                  Payment example
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                  >
                    <option value="unpaid">
                      Unpaid through current period
                    </option>
                    <option value="partial">
                      Registration paid · Prelim 50% paid
                    </option>
                    <option value="paid">All fees paid</option>
                  </select>
                </label>
                <label>
                  Fee assessment
                  <select
                    value={discounted ? "discounted" : "regular"}
                    onChange={(e) =>
                      setDiscounted(e.target.value === "discounted")
                    }
                  >
                    <option value="regular">Regular fees</option>
                    <option value="discounted">Discounted tuition</option>
                  </select>
                </label>
                {discounted && (
                  <label>
                    Tuition discount
                    <select
                      value={discountPercent}
                      onChange={(e) =>
                        setDiscountPercent(Number(e.target.value))
                      }
                    >
                      {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map(
                        (value) => (
                          <option key={value} value={value}>
                            {value}%
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                )}
                <p>
                  Tuition discount only. Laboratory and miscellaneous fees stay
                  unchanged.
                </p>
              </div>
            )}
            <table className="payment-schedule payment-schedule-table">
              <caption className="sr-only">
                Installment amounts, payments, remaining balance and payment
                status
              </caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Paid</th>
                  <th scope="col">Remaining</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {balance.rows.map((row, index) => (
                  <tr
                    className={`payment-period is-${row.status} ${index === period ? "is-current" : ""}`}
                    key={row.label}
                  >
                    <th scope="row">
                      <span>{index === 0 ? "Registration" : row.label}</span>
                      {index === period && (
                        <small className="current-period-label">Current</small>
                      )}
                    </th>
                    <td data-label="Amount">{peso(row.amount)}</td>
                    <td data-label="Paid">{peso(row.paid)}</td>
                    <td
                      data-label="Remaining"
                      className={`balance-${row.status}`}
                    >
                      {peso(row.remaining)}
                    </td>
                    <td className="payment-status-cell">
                      <span className={`balance-status balance-${row.status}`}>
                        {row.status === "due"
                          ? "Due"
                          : row.status === "paid"
                            ? "Paid"
                            : "Upcoming"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="payment-color-legend"
              role="note"
              aria-label="Payment status color legend"
            >
              <span className="payment-legend-title">Payment status</span>
              <span>
                <i className="legend-swatch balance-due" aria-hidden="true" />
                <strong>Red · Due</strong>
                <small>Unpaid through {paymentPeriods[period]}</small>
              </span>
              <span>
                <i className="legend-swatch balance-paid" aria-hidden="true" />
                <strong>Green · Paid</strong>
                <small>Fully settled</small>
              </span>
              <span>
                <i
                  className="legend-swatch balance-upcoming"
                  aria-hidden="true"
                />
                <strong>Neutral · Upcoming</strong>
                <small>Due in a later period</small>
              </span>
            </div>
          </section>
        </div>
        <details className="statement-subjects">
          <summary>
            <span>
              <BookOpen size={18} />
              Enrolled subjects <small>7 subjects · 21 units</small>
            </span>
            <ChevronDown size={18} />
          </summary>
          <div className="table-wrap">
            <table className="table matriculation-subjects">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Units</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(([code, title]) => (
                  <tr key={code}>
                    <td>{code}</td>
                    <td>{title}</td>
                    <td>3</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="2">Total units</th>
                  <td>21</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </details>
      </section>
    </div>
  );
}
