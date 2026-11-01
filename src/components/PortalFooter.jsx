import React from "react";
import { MapPin, Phone, Globe } from "lucide-react";
import "./PortalFooter.css";

export default function PortalFooter({
  onHelp,
  onAbout,
  onNavigate,
  role = "student",
}) {
  const student = role === "student";
  const links = student
    ? [
        ["slots", "Book an appointment"],
        ["reservations", "My reservations"],
        ["balance", "Balance inquiry"],
      ]
    : [
        ["queue", "Appointment queue"],
        ["availability", "Office availability"],
        ["verify", "Verify a ticket"],
      ];
  return (
    <footer className="institute-footer campus-footer">
      <div className="institute-footer-main">
        <div className="institute-footer-intro">
          <div className="footer-brand">
            <img
              src="/assets/ccdi-logo.png"
              alt="CCDI logo"
              width="48"
              height="56"
            />
            <strong>Computer Communication Development Institute</strong>
          </div>
          <span className="footer-campus">Sorsogon Campus</span>
          <p>
            Plan your campus visit, book Cashier and Accounting services, and
            keep your appointments in one place.
          </p>
        </div>
        <section className="footer-column">
          <h2>Student services</h2>
          <nav aria-label="Student services links">
            {onNavigate &&
              links.map(([page, label]) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                >
                  {label}
                </button>
              ))}
          </nav>
          <dl className="footer-office-list">
            <div>
              <dt>Cashier</dt>
              <dd>Payments & promissory notes</dd>
            </div>
            <div>
              <dt>Accounting</dt>
              <dd>Clearance, permits, uniform fabric & discounts</dd>
            </div>
          </dl>
        </section>
        <section className="footer-column">
          <h2>Help & portal</h2>
          <nav aria-label="Portal help links">
            {onHelp && (
              <button type="button" onClick={onHelp}>
                Help Center
              </button>
            )}
            {onAbout && (
              <button type="button" onClick={onAbout}>
                About the portal
              </button>
            )}
            <a
              href="https://www.ccdisorsogon.edu.ph"
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={15} />
              CCDI website
            </a>
          </nav>
        </section>
        <section className="footer-column footer-contact">
          <h2>Contact CCDI</h2>
          <address>
            <p>
              <MapPin size={16} />
              <span>
                <span className="footer-contact-label">Main Campus</span>
                Bitan-o, Rizal St., Sorsogon
              </span>
            </p>
            <p>
              <MapPin size={16} />
              <span>
                <span className="footer-contact-label">CCDI Annex</span>
                Executive Village, Tugos, Sorsogon City
              </span>
            </p>
            <a href="tel:+63562110378">
              <Phone size={15} />
              (56) 211-03-78
            </a>
            <a href="tel:+639178256892">
              <Phone size={15} />
              0917-825-6892
            </a>
          </address>
        </section>
      </div>
      <div className="institute-footer-bottom">
        <span>
          © {new Date().getFullYear()} Computer Communication Development
          Institute
        </span>
        <span>Student services · Sorsogon Campus</span>
      </div>
    </footer>
  );
}
