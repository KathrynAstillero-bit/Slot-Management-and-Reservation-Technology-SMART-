import "./Shell.css";
import "./Appearance.css";
import AppearanceToggle from "./AppearanceToggle.jsx";
import "./DarkTheme.css";
import "./Readability.css";
import "./CampusGlass.css";
import "./SwitchControl.css";
import "./BalanceLedger.css";
import PortalFooter from "./PortalFooter.jsx";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  UserRound,
  CalendarDays,
  ReceiptText,
  Info,
  LogOut,
  Ticket,
  SlidersHorizontal,
  ScanLine,
  Users,
  Menu,
  X,
  ChevronsRight,
  ChevronsLeft,
  ChevronDown,
  LifeBuoy,
  Plus,
} from "lucide-react";
const studentNav = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["profile", "Student Profile", UserRound],
  ["slots", "Slot Management", CalendarDays],
  ["reservations", "My Reservations", Ticket],
  ["balance", "Balance Inquiry", ReceiptText],
  ["about", "About Us", Info],
  ["help", "Help Center", LifeBuoy],
];
const staffNav = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["queue", "Queue Management", Users],
  ["availability", "Availability", SlidersHorizontal],
  ["verify", "Verify Ticket", ScanLine],
];
export const pageTitles = {
  dashboard: "Dashboard",
  profile: "Student Profile",
  slots: "Slot Management",
  reservations: "My Reservations",
  balance: "Balance Inquiry",
  about: "About Us",
  queue: "Queue Management",
  availability: "Availability",
  verify: "Verify Ticket",
  accounts: "Account Management",
  help: "Help Center",
};
function Avatar({ photo, initials }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo]);
  return (
    <span className="avatar">
      {photo && !failed ? (
        <img src={photo} alt="" onError={() => setFailed(true)} />
      ) : (
        initials
      )}
    </span>
  );
}
export default function Shell({
  user,
  profilePhoto,
  actualRole,
  role,
  page,
  setPage,
  onRole,
  onLogout,
  theme,
  setTheme,
  children,
}) {
  const [open, setOpen] = useState(false),
    [expanded, setExpanded] = useState(() => {
      try {
        return localStorage.getItem("ccdi-navigation-expanded") === "true";
      } catch {
        return false;
      }
    }),
    [profileOpen, setProfileOpen] = useState(false);
  const [railTransitioning, setRailTransitioning] = useState(false),
    railTransitionTimer = useRef(null);
  useEffect(() => {
    try {
      localStorage.setItem("ccdi-navigation-expanded", String(expanded));
    } catch {}
  }, [expanded]);
  useEffect(() => () => clearTimeout(railTransitionTimer.current), []);
  function toggleExpanded() {
    clearTimeout(railTransitionTimer.current);
    setRailTransitioning(true);
    setExpanded((value) => !value);
    railTransitionTimer.current = setTimeout(
      () => setRailTransitioning(false),
      300,
    );
  }
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width:767px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width:767px)");
    const update = () => {
      setMobile(query.matches);
      setOpen(false);
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const profileRef = useRef(null),
    menuRef = useRef(null);
  const student = role === "student";
  const nav = student
    ? studentNav
    : [
        ...staffNav,
        ...(role === "admin"
          ? [["accounts", "Account Management", Users]]
          : []),
        ["help", "Help Center", LifeBuoy],
      ];
  const quickKeys = student
    ? ["dashboard", "reservations", "slots", "profile", "help"]
    : ["dashboard", "queue", "availability", "help"];
  const quickNav = quickKeys
    .map((key) => nav.find((item) => item[0] === key))
    .filter(Boolean);
  const ActiveSidebarIcon =
    nav.find((item) => item[0] === page)?.[2] || LayoutDashboard;
  const ActiveQuickIcon =
    quickNav.find((item) => item[0] === page)?.[2] || LayoutDashboard;
  const initials = (user.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const go = (key) => {
    setPage(key);
    setOpen(false);
    setProfileOpen(false);
  };
  useEffect(() => {
    const dismiss = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
        menuRef.current?.focus();
      }
    };
    const outside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [page, role]);
  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prior;
    };
  }, [open]);
  return (
    <div
      className={`app-shell reference-shell ${expanded ? "rail-expanded" : ""} ${railTransitioning ? "rail-transitioning" : ""}`}
      data-theme={theme}
    >
      {open && (
        <button
          className="reference-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        inert={mobile && !open}
        aria-hidden={mobile && !open ? true : undefined}
        id="reference-main-navigation"
        className={`sidebar reference-rail ${open ? "open" : ""}`}
        aria-label={`${role} workspace`}
      >
        <button
          className="brand reference-brand"
          aria-label="Computer Communication Development Institute portal home"
          onClick={() => go("dashboard")}
        >
          <img className="brand-logo" src="/assets/ccdi-logo.png" alt="" />
        </button>
        <button
          className="rail-toggle"
          type="button"
          onClick={toggleExpanded}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronsLeft size={17} /> : <ChevronsRight size={17} />}
        </button>
        <button
          className="drawer-close"
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X size={21} />
        </button>
        <nav
          className="reference-main-nav"
          aria-label="Main navigation"
          style={{
            "--nav-index": Math.max(
              0,
              nav.findIndex((item) => item[0] === page),
            ),
          }}
        >
          <span className="sidebar-active-bubble" aria-hidden="true">
            <ActiveSidebarIcon key={page} size={22} />
          </span>
          {nav.map(([key, label, Icon]) => (
            <button
              type="button"
              key={key}
              className={`nav-item ${page === key ? "active" : ""}`}
              aria-label={label}
              data-tooltip={label}
              title={label}
              aria-current={page === key ? "page" : undefined}
              onClick={() => go(key)}
            >
              <Icon size={21} />
              <span className="rail-label">{label}</span>
              {page === key && <i className="rail-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="sidebar-appearance">
            <AppearanceToggle theme={theme} onChange={setTheme} />
          </div>
          <div className="account-pill">
            <Avatar photo={profilePhoto} initials={initials} />
            <div className="rail-account-copy">
              <strong>{user.name}</strong>
              <small>
                {role.charAt(0).toUpperCase() + role.slice(1)} account
              </small>
            </div>
          </div>
          <button
            type="button"
            className="nav-item logout"
            aria-label="Log out"
            title="Log out"
            data-tooltip="Log out"
            onClick={onLogout}
          >
            <LogOut size={20} />
            <span className="rail-label">Log Out</span>
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar reference-topbar">
          <div className="reference-top-brand">
            <button
              className="reference-mobile-menu"
              ref={menuRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="reference-main-navigation"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>
            <img
              className="heading-logo"
              src="/assets/ccdi-logo.png"
              alt="Computer Communication Development Institute logo"
            />
            <div className="reference-heading">
              <strong>Computer Communication Development Institute</strong>
              <span>Slot Management and Accounting Reservation Technology</span>
            </div>
          </div>
          <div className="topbar-right reference-top-actions">
            {actualRole === "admin" && (
              <label className="preview-role">
                <span>View as</span>
                <select
                  aria-label="Preview account interface"
                  value={role}
                  onChange={(e) => onRole(e.target.value)}
                >
                  {["admin", "student", "cashier", "accounting"].map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="reference-profile" ref={profileRef}>
              <button
                className={`reference-profile-button ${profileOpen ? "active" : ""}`}
                type="button"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <Avatar photo={profilePhoto} initials={initials} />
                <ChevronDown size={13} />
              </button>
              {profileOpen && (
                <div
                  className="reference-profile-menu"
                  role="menu"
                  aria-label="Account options"
                >
                  <div className="profile-menu-heading">
                    <strong>{user.name}</strong>
                    <span>
                      {role.charAt(0).toUpperCase() + role.slice(1)} account
                    </span>
                  </div>
                  {student && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => go("profile")}
                    >
                      <UserRound size={17} />
                      Student Profile
                    </button>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => go("help")}
                  >
                    <LifeBuoy size={17} />
                    Help Center
                  </button>
                  <button
                    className="profile-menu-logout"
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    <LogOut size={17} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page reference-page">{children}</main>
        <PortalFooter
          role={role}
          onNavigate={go}
          onHelp={() => go("help")}
          onAbout={student ? () => go("about") : undefined}
        />
      </div>
      <nav
        className="reference-bottom-dock"
        aria-label="Quick navigation"
        style={{
          "--dock-count": quickNav.length,
          "--dock-index": Math.max(0, quickKeys.indexOf(page)),
          "--dock-visible": quickKeys.includes(page) ? 1 : 0,
        }}
      >
        <span className="dock-active-bubble" aria-hidden="true">
          <ActiveQuickIcon key={page} size={22} />
        </span>
        {quickNav.map(([key, label, Icon]) => (
          <button
            type="button"
            key={key}
            className={[page === key ? "active" : "", ""].join(" ")}
            aria-label={label}
            aria-current={page === key ? "page" : undefined}
            onClick={() => go(key)}
          >
            <Icon size={20} />
            <span>
              {key === "dashboard"
                ? "Home"
                : key === "slots"
                  ? "Book a slot"
                  : key === "reservations"
                    ? "Tickets"
                    : key === "queue"
                      ? "Queue"
                      : key === "availability"
                        ? "Availability"
                        : key === "profile"
                          ? "Profile"
                          : "Help"}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
