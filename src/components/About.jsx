import "./About.css";
import React from "react";
import { Wallet, FileText, Ticket as TicketIcon } from "lucide-react";

export default function About() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MADE FOR A BETTER CAMPUS DAY</div>
          <h1>About Us</h1>
          <p className="page-subtitle">
            A more convenient connection to student services.
          </p>
        </div>
      </div>
      <section className="panel about-panel">
        <img src="/assets/ccdi-logo.png" alt="CCDI logo" width="90" />
        <h2>Welcome to CCDI Portal</h2>
        <p>
          Plan your visit to Cashier and Accounting, choose a service, and keep
          your appointment details in one place.
        </p>
        <div className="stats-grid">
          {[
            [Wallet, "Cashier", "Payment and Promissory Note"],
            [
              FileText,
              "Accounting",
              "Clearance, Permit, Uniform Fabric, and Discount",
            ],
            [
              TicketIcon,
              "Queue ticket",
              "Reservation summary and a verification QR",
            ],
          ].map(([Icon, title, text]) => (
            <div className="stat-card" key={title}>
              <Icon size={26} />
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
