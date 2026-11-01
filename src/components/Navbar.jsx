import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";
import {
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function Navbar({
  activeTab = "overview",
  setActiveTab,
  user,
  role = "student",
  onRoleChange,
  onLogout,
  onOpenBooking,
  notifications = [],
  onClearNotifications,
  onNavigateToAuth,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  const navLinks = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "slots", label: "Slot Booking", icon: CalendarDays },
    { id: "queues", label: "Queues & Staff", icon: Users },
    { id: "activity", label: "Activity Logs", icon: Activity },
  ];

  const roles = [
    { id: "student", label: "Student", desc: "Book appointments & tickets" },
    { id: "cashier", label: "Cashier Staff", desc: "Process fee payments" },
    {
      id: "accounting",
      label: "Accounting Staff",
      desc: "Clearance & permits",
    },
    { id: "admin", label: "Administrator", desc: "Full campus oversight" },
  ];

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !e.target.closest(".nav-popover-dropdown") &&
        !e.target.closest(".nav-dropdown-trigger")
      ) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="navbar-header">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="navbar-pill"
      >
        {/* Left: Brand Logo & Title */}
        <button
          onClick={() => setActiveTab("overview")}
          className="navbar-brand-btn"
        >
          <div className="navbar-logo-badge">
            <div className="navbar-logo-inner">
              <img
                src="/assets/ccdi-logo.png"
                alt="CCDI Logo"
                className="navbar-logo-img"
              />
            </div>
          </div>
          <div className="navbar-brand-text">
            <div className="navbar-brand-title">
              <span>CCDI</span>
              <span className="navbar-brand-tag">Portal</span>
            </div>
            <span className="navbar-brand-subtitle">Slot Management Flow</span>
          </div>
        </button>

        {/* Center: Navigation Links */}
        <div className="navbar-links-track">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`nav-link-item ${isActive ? "active" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="nav-link-pill-active"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="nav-link-content">
                  <Icon size={14} />
                  <span>{link.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Utilities */}
        <div className="navbar-utilities">
          {/* Expanding Search Bar */}
          <div className="nav-search-wrapper">
            <motion.div
              animate={{ width: searchOpen ? 220 : 36 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`nav-search-pill ${searchOpen ? "expanded" : "collapsed"}`}
            >
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="nav-search-toggle-btn"
                aria-label="Toggle search"
              >
                <Search size={15} />
              </button>
              {searchOpen && (
                <div className="nav-search-input-box">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services, slots..."
                    className="nav-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="nav-search-clear-btn"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Notifications Dropdown */}
          <div className="nav-search-wrapper">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="nav-icon-btn nav-dropdown-trigger"
              aria-label="Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && <span className="nav-badge-dot" />}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="nav-popover-dropdown nav-notifications-popover"
                >
                  <div className="nav-popover-header">
                    <div className="nav-popover-title-row">
                      <span className="nav-popover-title">Notifications</span>
                      <span className="nav-badge-pill">{unreadCount} new</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="nav-mark-read-btn"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="nav-notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`nav-notif-item ${item.read ? "read" : ""}`}
                        >
                          <div className={`nav-notif-icon-box ${item.type}`}>
                            {item.type === "alert" ? (
                              <Shield size={13} />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                          </div>
                          <div>
                            <p className="nav-notif-title">{item.title}</p>
                            <span className="nav-notif-time">
                              <Clock size={10} />
                              {item.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "#888",
                        }}
                      >
                        No notifications at the moment
                      </div>
                    )}
                  </div>

                  <div className="nav-popover-footer">
                    <button
                      onClick={() => {
                        setActiveTab("activity");
                        setNotificationsOpen(false);
                      }}
                      className="nav-view-all-link"
                    >
                      View all activity logs <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Pill / Menu */}
          <div className="nav-search-wrapper">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="nav-profile-pill-btn nav-dropdown-trigger"
            >
              <div className="nav-avatar-circle">
                {user?.name ? user.name[0] : "U"}
              </div>
              <div className="nav-profile-info">
                <span className="nav-profile-name">
                  {user?.name || "Juan Smith"}
                </span>
                <span className="nav-profile-role">{role}</span>
              </div>
              <ChevronDown size={12} className="nav-chevron-icon" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="nav-popover-dropdown nav-profile-popover"
                >
                  <div className="nav-profile-popover-header">
                    <p className="nav-popover-user-name">
                      {user?.name || "Juan Smith"}
                    </p>
                    <p className="nav-popover-user-email">
                      {user?.email || "student@demo.local"}
                    </p>
                    <div className="nav-active-role-tag">
                      <Sparkles size={10} /> Active:{" "}
                      <span style={{ textTransform: "capitalize" }}>
                        {role}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="nav-popover-section-label">
                      Switch Role Preview
                    </span>
                    <div className="nav-role-options-list">
                      {roles.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            if (onRoleChange) onRoleChange(r.id);
                            setProfileOpen(false);
                          }}
                          className={`nav-role-item-btn ${role === r.id ? "selected" : ""}`}
                        >
                          <div>
                            <div>{r.label}</div>
                            <div className="nav-role-desc">{r.desc}</div>
                          </div>
                          {role === r.id && (
                            <CheckCircle2
                              size={13}
                              style={{ color: "var(--neon-sky)" }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="nav-profile-actions">
                    <button
                      onClick={() => {
                        if (onNavigateToAuth) onNavigateToAuth();
                        setProfileOpen(false);
                      }}
                      className="nav-action-btn"
                    >
                      <Layers size={13} />
                      <span>Preview Login/Signup View</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        setProfileOpen(false);
                      }}
                      className="nav-action-btn logout"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-mobile-toggle-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="nav-mobile-drawer"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`nav-mobile-link-btn ${isActive ? "active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
