import { DEFAULT_CAPACITY } from "../slotCapacity.js";
import { searchHelp } from "../helpSearch.js";
import "./HelpCenter.css";
import React, { useId, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  Clock3,
  Info,
  LogIn,
  QrCode,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";

const categories = [
  {
    id: "Booking",
    icon: CalendarDays,
    title: "Booking a visit",
    description: "Offices, services, and reservations.",
  },
  {
    id: "Availability",
    icon: SlidersHorizontal,
    title: "Available slots",
    description: "Understand gray choices and office controls.",
  },
  {
    id: "Queue & QR",
    icon: QrCode,
    title: "Queue & QR tickets",
    description: "Find your ticket and review counter admission.",
  },
  {
    id: "Accounts",
    icon: UserRound,
    title: "Accounts & access",
    description: "sign-ins, roles, and browser storage.",
  },
];

const faqs = [
  {
    id: "reserve",
    category: "Booking",
    title: "How do I reserve a slot?",
    answer: [
      "Sign in with the Student account and open Slot Management.",
      "Choose Cashier or Accounting, then select a service, or turn on Select multiple to choose several services for the same office.",
      "The calendar and time choices appear after you choose a service.",
      "Pick an available date and time, review your name and student number, and confirm the reservation.",
    ].join(" "),
  },
  {
    id: "services",
    category: "Booking",
    title: "Which services belong to Cashier and Accounting?",
    answer: [
      "Cashier offers Payment and Promissory Note.",
      "Accounting offers Clearance, Permit, Uniform Fabric, and Discount.",
      "Select an office first to see its services.",
      "Only available offices and services can be selected.",
    ].join(" "),
  },
  {
    id: "calendar",
    category: "Booking",
    title: "Why can’t I see the calendar yet?",
    answer: [
      "The calendar and time slots appear after you select an available office and an available service.",
      "Choosing another office clears the earlier service, date, and time.",
      "Choosing another service clears the date and time so your reservation matches your latest choice.",
    ].join(" "),
  },
  {
    id: "cancel",
    category: "Booking",
    title: "Can I cancel a reservation?",
    answer: [
      "Open My Reservations, find the reservation, and choose Cancel.",
      "Review the confirmation dialog before cancelling.",
      "The browser marks the reservation cancelled and makes its slot available again.",
      "A cancelled ticket cannot be admitted at the counter.",
    ].join(" "),
  },
  {
    id: "gray",
    category: "Availability",
    title: "What do light gray choices mean?",
    answer: [
      "A light gray office, service, date, or time is unavailable and cannot be selected in the booking screen.",
      "An office may be closed, an individual service may be turned off, a date or time may be blocked, or a time slot may already be full.",
      "Choose another available option.",
    ].join(" "),
  },
  {
    id: "dates",
    category: "Availability",
    title: "Why are some dates and times unavailable?",
    answer: [
      "Weekends, past dates, and appointment times that have already passed cannot be booked.",
      "Staff can also close particular dates or times for their office.",
      "The booking calendar shows unavailable choices in light gray.",
      "The date and time schedule uses Philippine time.",
    ].join(" "),
  },
  {
    id: "manage",
    category: "Availability",
    title: "How can staff change availability?",
    answer: [
      "Use the matching Cashier or Accounting account and open Availability.",
      "Turn the office on or off, control individual services, and select a date to change date and hourly time availability.",
      "Enable a closed office before changing its services.",
      "Enable a blocked date before changing its times.",
      "The Admin view can manage both offices.",
    ].join(" "),
  },
  {
    id: "capacity",
    category: "Availability",
    title: "How many reservations fit in one time slot?",
    answer: [
      `The default is ${DEFAULT_CAPACITY} reservations per office per hour.`,
      "Staff can adjust the limit for individual slots.",
      "Full slots cannot be booked, and cancelling a reservation frees its place.",
    ].join(" "),
  },
  {
    id: "queue",
    category: "Queue & QR",
    title: "When do I receive a queue number?",
    answer: [
      "A queue number is generated after you confirm a reservation.",
      "The ticket shows the queue number, office, service, date, time, student details, and a QR code.",
      "You can reopen the ticket from My Reservations.",
    ].join(" "),
  },
  {
    id: "qr",
    category: "Queue & QR",
    title: "What does the QR code verify?",
    answer: [
      "The QR code contains a link with the booking token.",
      "Ticket lookup checks whether that token matches an unused reservation in the current browser’s storage.",
      "It does not verify real identity, authenticate a person, contact a school system, or confirm an official reservation.",
    ].join(" "),
  },
  {
    id: "checkin",
    category: "Queue & QR",
    title: "How does counter admission work?",
    answer: [
      "Open a saved reservation ticket and copy its verification link.",
      "In the corresponding office view, open Verify Ticket and paste the link or token.",
      "When the student reaches the counter, verify their ticket and choose Admit at counter to begin service.",
      "Only the matching office view or Admin can perform the action.",
      "An admitted ticket shows Being served. Staff marks it Completed after payment or the requested service is finished. Students wait in the physical line; the app does not track their arrival or position.",
    ].join(" "),
  },
  {
    id: "missing-ticket",
    category: "Queue & QR",
    title: "Why does a ticket link say no ticket was found?",
    answer: [
      "A link or QR image does not transfer the saved reservation to another browser or device.",
      "Open the link in the same browser profile where the reservation was created.",
      "Check that the entire link or token was copied.",
      "Clearing this website’s browser storage removes its saved reservations.",
    ].join(" "),
  },
];

const guides = {
  student: {
    title: "Your next visit, in three steps",
    description: "A quick guide to student services.",
    steps: [
      {
        title: "Choose your service",
        text: "Open Slot Management, choose an office, and select an available service.",
        page: "slots",
        action: "Open Slot Management",
      },
      {
        title: "Reserve a date and time",
        text: "Select an available slot and confirm your student details.",
        page: "slots",
        action: "Find an available slot",
      },
      {
        title: "Keep your queue ticket",
        text: "Open My Reservations to view your queue number and QR ticket.",
        page: "reservations",
        action: "View my reservations",
      },
    ],
  },
  cashier: {
    title: "Your cashier workspace, in three steps",
    description: "Manage Cashier availability and appointments.",
    steps: [
      {
        title: "Set office availability",
        text: "Manage Cashier, Payment, Promissory Note, and date or time choices.",
        page: "availability",
        action: "Manage availability",
      },
      {
        title: "Look up a ticket",
        text: "When the student reaches the counter, verify their ticket and admit it to start service.",
        page: "verify",
        action: "Open Verify Ticket",
      },
      {
        title: "Review the office queue",
        text: "Filter reservations and mark checked-in visits completed.",
        page: "queue",
        action: "Open Queue Management",
      },
    ],
  },
  accounting: {
    title: "Your accounting workspace, in three steps",
    description: "Manage Accounting availability and appointments.",
    steps: [
      {
        title: "Set office availability",
        text: "Manage Accounting services and their available dates and times.",
        page: "availability",
        action: "Manage availability",
      },
      {
        title: "Look up a ticket",
        text: "When the student reaches the counter, verify their ticket and admit it to start service.",
        page: "verify",
        action: "Open Verify Ticket",
      },
      {
        title: "Review the office queue",
        text: "Filter reservations and complete checked-in appointments.",
        page: "queue",
        action: "Open Queue Management",
      },
    ],
  },
  admin: {
    title: "Your admin workspace, in three steps",
    description: "Oversee both offices and account details.",
    steps: [
      {
        title: "Review both offices",
        text: "Manage Cashier and Accounting availability, services, dates, and times.",
        page: "availability",
        action: "Manage availability",
      },
      {
        title: "Review the queue",
        text: "Review office reservations and complete checked-in visits.",
        page: "queue",
        action: "Open Queue Management",
      },
      {
        title: "Review account details",
        text: "Update display names and roles; sign-in credentials stay unchanged.",
        page: "accounts",
        action: "Open account management",
      },
    ],
  },
};

export default function HelpCenter({ role = "student", setPage, onLogin }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [expanded, setExpanded] = useState([]);
  const instance = useId().replaceAll(":", "");
  const loggedIn = ["student", "cashier", "accounting", "admin"].includes(role);
  const guide = guides[role] || guides.student;
  const results = useMemo(
    () => searchHelp(faqs, query, category),
    [query, category],
  );
  const canNavigate = loggedIn
    ? typeof setPage === "function"
    : typeof onLogin === "function";
  const jump = (page) => {
    if (loggedIn && setPage) setPage(page);
    else onLogin?.();
  };
  const clear = () => {
    setQuery("");
    setCategory("All");
    setExpanded([]);
  };
  const navigationButton = (page, label, className = "help-action") =>
    canNavigate ? (
      <button type="button" className={className} onClick={() => jump(page)}>
        {loggedIn ? label : "Sign in to continue"}
        <ArrowRight size={16} />
      </button>
    ) : null;

  return (
    <div className="help-center">
      <section className="help-hero" aria-labelledby={`${instance}-title`}>
        <div className="help-hero-copy">
          <span className="help-eyebrow">
            <span />
            CCDI STUDENT SERVICES
          </span>
          <h1 id={`${instance}-title`}>How can we help?</h1>
          <p>
            Find a clear answer, follow a quick guide, and make your next visit
            easier.
          </p>
        </div>
        <div className="help-hero-mark" aria-hidden="true">
          <CircleHelp size={56} />
        </div>
        <form
          className="help-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor={`${instance}-search`}>Search the Help Center</label>
          <div className="help-search-box">
            <span className="help-search-symbol" aria-hidden="true">
              <Search size={25} />
            </span>
            <input
              id={`${instance}-search`}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setExpanded([]);
              }}
              placeholder="Try “unavailable” or “queue number”"
              aria-controls={`${instance}-results`}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={19} />
              </button>
            )}
          </div>
          <p>Search by keyword, such as “book”, “closed”, “cancel”, or “QR”.</p>
        </form>
      </section>

  <div className="help-report-shortcut">
   <a className="help-primary-action" href={`#${instance}-report`}><CircleAlert size={18} aria-hidden="true"/>Report an issue</a>
  </div>

      {!query.trim() && (
        <section
          className="help-topics"
          aria-labelledby={`${instance}-topics-title`}
        >
          <div className="help-section-heading">
            <div>
              <span className="help-eyebrow">START HERE</span>
              <h2 id={`${instance}-topics-title`}>Browse by topic</h2>
            </div>
          </div>
          <div className="help-topic-grid">
            {categories.map(({ id, icon: Icon, title, description }) => (
              <button
                type="button"
                key={id}
                className={`help-topic-card ${category === id ? "is-selected" : ""}`}
                aria-pressed={category === id}
                onClick={() => {
                  setQuery("");
                  setCategory(id);
                  setExpanded([]);
                  requestAnimationFrame(() =>
                    document
                      .getElementById(`${instance}-faq-title`)
                      ?.scrollIntoView({
                        block: "start",
                        behavior: window.matchMedia(
                          "(prefers-reduced-motion: reduce)",
                        ).matches
                          ? "instant"
                          : "smooth",
                      }),
                  );
                }}
              >
                <span className="help-topic-icon">
                  <Icon size={22} />
                </span>
                <span className="help-topic-text">
                  <strong>{title}</strong>
                  <span>{description}</span>
                </span>
                <ArrowRight size={17} className="help-topic-arrow" />
              </button>
            ))}
          </div>
        </section>
      )}

      {!query.trim() && category === "All" && (
        <section
          className="help-quick-guide"
          aria-labelledby={`${instance}-guide-title`}
        >
          <div className="help-section-heading">
            <div>
              <span className="help-eyebrow">
                {loggedIn ? `${role.toUpperCase()} QUICK GUIDE` : "QUICK GUIDE"}
              </span>
              <h2 id={`${instance}-guide-title`}>{guide.title}</h2>
              <p>{guide.description}</p>
            </div>
            <span className="help-small-symbol" aria-hidden="true">
              <BookOpen size={23} />
            </span>
          </div>
          <ol className="help-guide-grid">
            {guide.steps.map((step, index) => (
              <li key={step.title}>
                <span className="help-step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {navigationButton(step.page, step.action)}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section
        className="help-faq-section"
        aria-labelledby={`${instance}-faq-title`}
      >
        <div className="help-section-heading">
          <div>
            <span className="help-eyebrow">GOOD TO KNOW</span>
            <h2 id={`${instance}-faq-title`}>
              {query.trim()
                ? "Search results"
                : category !== "All"
                  ? `${category} answers`
                  : "Frequently asked questions"}
            </h2>
          </div>
          <span className="help-results-count" role="status" aria-live="polite">
            {results.length} {results.length === 1 ? "answer" : "answers"}
            {query.trim() ? " found" : ""}
          </span>
        </div>
        <div
          className="help-filter-chips"
          aria-label="Filter help questions by category"
        >
          {["All", ...categories.map((item) => item.id)].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              className={category === item ? "is-active" : ""}
              onClick={() => {
                setCategory(item);
                setExpanded([]);
              }}
            >
              {item}
              {category === item && <Check size={14} />}
            </button>
          ))}
        </div>
        <div id={`${instance}-results`} className="help-faq-list">
          {results.length ? (
            results.map((faq) => {
              const open = expanded.includes(faq.id);
              const questionId = `${instance}-question-${faq.id}`,
                answerId = `${instance}-answer-${faq.id}`;
              return (
                <article
                  className={`help-faq ${open ? "is-open" : ""}`}
                  key={faq.id}
                >
                  <h3>
                    <button
                      type="button"
                      id={questionId}
                      aria-expanded={open}
                      aria-controls={answerId}
                      onClick={() =>
                        setExpanded((current) =>
                          open
                            ? current.filter((id) => id !== faq.id)
                            : [...current, faq.id],
                        )
                      }
                    >
                      <span>
                        <small>{faq.category}</small>
                        {faq.title}
                      </span>
                      <ChevronDown size={19} aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="help-faq-answer"
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    hidden={!open}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="help-empty">
              <Search size={33} aria-hidden="true" />
              <h3>No matching answers yet</h3>
              <p>
                Try a shorter phrase, choose another topic, or clear your search
                to browse every answer.
              </p>
              <button
                type="button"
                className="help-primary-action"
                onClick={clear}
              >
                Clear search and filters
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

  <section id={`${instance}-report`} className="help-quick-guide help-report" aria-labelledby={`${instance}-report-title`} tabIndex={-1}>
   <div className="help-section-heading">
    <div><span className="help-eyebrow">TECHNICAL SUPPORT</span><h2 id={`${instance}-report-title`}>Report an issue</h2><p>If a page or feature in SMART isn’t working, try these steps first.</p></div>
    <span className="help-small-symbol" aria-hidden="true"><CircleAlert size={23}/></span>
   </div>
   <div className="help-report-grid">
    <div>
     <h3>Troubleshoot the issue</h3>
     <ol>
      <li>Save any unfinished work, then refresh the page.</li>
      <li>Check your internet connection.</li>
      <li>Try opening the same page in another browser or on another device.</li>
     </ol>
    </div>
    <div>
     <h3>What to include in your report</h3>
     <ul>
      <li>The page or feature where the issue occurred.</li>
      <li>What you were trying to do, what happened, and any error message.</li>
      <li>A screenshot, if available. Hide any personal details before sharing it.</li>
     </ul>
    </div>
   </div>
   <div className="help-report-contact">
    <h3>Contact the admin</h3>
    <p>If the issue persists, have the details above ready when contacting the admin.</p>
    <p><strong>Admin demo number</strong> 09XX XXX XXXX</p>
   </div>
  </section>

      <section className="help-more" aria-labelledby={`${instance}-more-title`}>
        <div className="help-more-icon" aria-hidden="true">
          <CircleHelp size={30} />
        </div>
        <div className="help-more-copy">
          <span className="help-eyebrow">KEEP EXPLORING</span>
          <h2 id={`${instance}-more-title`}>Need a little more help?</h2>
          <p>Open the service you need below.</p>
          <div className="help-more-actions">
            {navigationButton(
              loggedIn && role !== "student" ? "availability" : "slots",
              loggedIn && role !== "student"
                ? "Review availability"
                : "Book a slot",
              "help-primary-action",
            )}
            {loggedIn && setPage && (
              <button
                type="button"
                className="help-secondary-action"
                onClick={() =>
                  setPage(role === "student" ? "reservations" : "verify")
                }
              >
                {role === "student"
                  ? "Find my reservations"
                  : "Verify a ticket"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="help-browser-tip">
          <Clock3 size={20} />
          <strong>Saved tickets</strong>
          <p>
            Tickets are stored in this browser and do not sync across devices.
          </p>
        </div>
      </section>
    </div>
  );
}
