import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  BookOpen,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CalendarDays,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  Camera,
  Info,
  School,
  Check,
} from "lucide-react";
import Shell from "./components/Shell.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import HelpCenter from "./components/HelpCenter.jsx";
import Profile from "./components/Profile.jsx";
import Balance from "./components/Balance.jsx";
import About from "./components/About.jsx";
import "./App.css";
import Booking from "./components/Booking.jsx";
import Ticket from "./components/Ticket.jsx";
import VerificationPage from "./components/VerificationPage.jsx";
import {
  Availability,
  Reservations,
  Verify,
  Accounts,
} from "./components/Staff.jsx";
import {
  api,
  post,
  setPreviewRole,
  demoAccounts,
  dateLabel,
  timeLabel,
  officeName,
  serviceName,
} from "./api.js";

export default function App() {
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("ccdi-appearance") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("ccdi-appearance", theme);
    } catch {}
  }, [theme]);
  const [bookingOffice, setBookingOffice] = useState("");
  function navigate(next) {
    setBookingOffice("");
    setPage(next);
  }
  function openOffice(id) {
    setBookingOffice(id);
    setPage("slots");
  }
  const [session, setSession] = useState(null),
    [role, setRole] = useState("student"),
    [data, setData] = useState(null),
    [page, setPage] = useState("dashboard"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [syncError, setSyncError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try {
      return localStorage.getItem("ccdi-profile-photo") || "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    const syncPhoto = (e) => {
      if (e.key === "ccdi-profile-photo" || e.key === null)
        setProfilePhoto(e.newValue || "");
    };
    window.addEventListener("storage", syncPhoto);
    return () => window.removeEventListener("storage", syncPhoto);
  }, []);
  const [profile, setProfileState] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("ccdi-demo-profile")) || {
          name: "Juan F. Smith",
          number: "2026-01-123",
          course: "BS Information Technology · 3rd Year",
        }
      );
    } catch {
      return {
        name: "Juan F. Smith",
        number: "2026-01-123",
        course: "BS Information Technology · 3rd Year",
      };
    }
  });
  const notify = useCallback((message) => setToast(message), []);
  const refresh = useCallback(async () => {
    const next = await api("/state");
    setData(next);
    if (next.currentProfile) setProfileState(next.currentProfile);
    setSyncError("");
    return next;
  }, []);
  useEffect(() => {
    api("/session")
      .then(async (s) => {
        if (s.user) {
          setSession(s);
          setRole(s.user.role);
          await refresh();
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!session) return;
    const update = () =>
      refresh().catch(() =>
        setSyncError(
          "Queue updates are paused. Displayed information may be out of date.",
        ),
      );
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    const interval = setInterval(update, 3000);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      clearInterval(interval);
    };
  }, [session, refresh]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  async function login(credentials) {
    const s = await post("/login", credentials);
    setSession(s);
    setRole(s.user.role);
    setPage("dashboard");
    await refresh();
  }
  async function logout() {
    await post("/logout", {});
    setSession(null);
    setData(null);
    setRole("student");
    setPage("dashboard");
  }
  async function changeRole(next) {
    setPreviewRole(next === "admin" ? "" : next);
    setRole(next);
    setPage("dashboard");
    await refresh();
  }
  async function setProfile(value) {
    try {
      await post("/profile", value);
      localStorage.setItem("ccdi-demo-profile", JSON.stringify(value));
      setProfileState(value);
      await refresh();
      return true;
    } catch {
      notify("Browser storage is unavailable.");
      return false;
    }
  }
  function saveProfilePhoto(value) {
    try {
      localStorage.setItem("ccdi-profile-photo", value);
      setProfilePhoto(value);
      return true;
    } catch {
      notify("The photo could not be saved. Try a smaller image.");
      return false;
    }
  }
  const queryToken = new URLSearchParams(window.location.search).get("token");
  if (window.location.pathname === "/verify")
    return (
      <VerificationPage
        role={session ? role : "visitor"}
        refresh={session ? refresh : async () => {}}
        notify={notify}
        initialToken={queryToken || ""}
        toast={toast}
      />
    );
  if (loading)
    return (
      <div className="loading-screen">
        <img
          src="/assets/ccdi-logo.png"
          alt="Computer Communication Development Institute logo"
          width="72"
        />
        <span className="spinner" />
        Loading your portal…
      </div>
    );
  if (!session && showHelp)
    return (
      <div className="reference-shell" data-theme={theme}>
        <div className="public-help-page">
          <header className="public-help-header">
            <a
              className="public-help-brand"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowHelp(false);
              }}
            >
              <img
                src="/assets/ccdi-logo.png"
                alt="Computer Communication Development Institute logo"
              />
              <span className="public-help-brand-copy">
                <strong>Computer Communication Development Institute</strong>
                <small>
                  Slot Management and Accounting Reservation Technology
                </small>
              </span>
            </a>
            <button
              className="button secondary"
              onClick={() => setShowHelp(false)}
            >
              Back to sign in
              <ArrowRight size={16} />
            </button>
          </header>
          <HelpCenter role="" onLogin={() => setShowHelp(false)} />
        </div>
      </div>
    );
  if (!session)
    return (
      <Login
        onLogin={login}
        onHelp={() => setShowHelp(true)}
        theme={theme}
        setTheme={setTheme}
      />
    );
  if (!data)
    return (
      <div className="loading-screen">
        <p>{error || "Loading data…"}</p>
        <button className="button secondary" onClick={logout}>
          Return to sign in
        </button>
      </div>
    );
  return (
    <Shell
      profilePhoto={role === "student" ? profilePhoto : ""}
      user={
        role === "student"
          ? { ...session.user, name: profile.name }
          : session.user
      }
      actualRole={session.actualRole}
      role={role}
      page={page}
      setPage={navigate}
      onRole={changeRole}
      onLogout={logout}
      theme={theme}
      setTheme={setTheme}
    >
      {syncError && (
        <div className="notice error ui-sync-notice" role="status">
          <span>{syncError}</span>
          <button
            className="button secondary small"
            onClick={() =>
              refresh().catch(() =>
                setSyncError(
                  "Updates are still unavailable. Try again shortly.",
                ),
              )
            }
          >
            Retry
          </button>
        </div>
      )}
      {page === "dashboard" && (
        <Dashboard
          data={data}
          user={
            role === "student"
              ? { ...session.user, name: profile.name }
              : session.user
          }
          role={role}
          setPage={navigate}
          onChooseOffice={openOffice}
        />
      )}
      {page === "slots" && (
        <Booking
          initialOffice={bookingOffice}
          data={data}
          refresh={refresh}
          profile={profile}
          notify={notify}
        />
      )}
      {page === "profile" && (
        <Profile
          profile={profile}
          email={session.user.email}
          setProfile={setProfile}
          photo={profilePhoto}
          onPhotoChange={saveProfilePhoto}
          notify={notify}
        />
      )}
      {(page === "reservations" || page === "queue") && (
        <Reservations
          data={data}
          role={role}
          refresh={refresh}
          notify={notify}
        />
      )}
      {page === "availability" && (
        <Availability
          data={data}
          role={role}
          refresh={refresh}
          notify={notify}
        />
      )}
      {page === "verify" && (
        <Verify role={role} refresh={refresh} notify={notify} />
      )}
      {page === "accounts" && (
        <Accounts data={data} refresh={refresh} notify={notify} />
      )}
      {page === "balance" && <Balance profile={profile} />}
      {page === "about" && <About />}
      {page === "help" && (
        <HelpCenter
          role={role}
          setPage={navigate}
          onChooseOffice={openOffice}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </Shell>
  );
}
