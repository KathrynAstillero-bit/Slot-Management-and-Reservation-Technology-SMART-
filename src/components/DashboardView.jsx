import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DashboardView.css";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
  Ticket,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Plus,
  QrCode,
  ChevronRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import { dateLabel, timeLabel, officeName, serviceName, post } from "../api.js";

export default function DashboardView({
  data,
  user,
  role = "student",
  refresh,
  notify,
  onOpenBooking,
  onOpenTicket,
  onOpenVerify,
}) {
  const [activeTab, setActiveTab] = useState("throughput");
  const [timeRange, setTimeRange] = useState("today");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const upcomingBookings = (data?.bookings || [])
    .filter((b) => b.status === "booked" || b.status === "checked-in")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const completedCount = (data?.bookings || []).filter(
    (b) => b.status === "completed",
  ).length;
  const activeQueuesCount = upcomingBookings.length;

  async function handleRefresh() {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
    notify("Dashboard metrics refreshed");
  }

  async function handleCheckIn(booking) {
    try {
      await post("/checkin", { token: booking.token });
      await refresh();
      notify(`Checked in queue ticket ${booking.queueNumber}`);
    } catch (err) {
      notify(err.message || "Check-in failed");
    }
  }

  async function handleComplete(booking) {
    try {
      await post(`/bookings/${booking.id}/status`, { status: "completed" });
      await refresh();
      notify(`Completed ticket ${booking.queueNumber}`);
    } catch (err) {
      notify(err.message || "Could not complete ticket");
    }
  }

  const hourlyData = [
    { hour: "08:00", arrivals: 12, height: 40 },
    { hour: "09:00", arrivals: 28, height: 75 },
    { hour: "10:00", arrivals: 42, height: 100 },
    { hour: "11:00", arrivals: 34, height: 85 },
    { hour: "13:00", arrivals: 18, height: 50 },
    { hour: "14:00", arrivals: 36, height: 90 },
    { hour: "15:00", arrivals: 29, height: 72 },
    { hour: "16:00", arrivals: 15, height: 45 },
  ];

  return (
    <div className="dash-layout-container">
      {/* 1. Header Greeting Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="dash-header-panel"
      >
        <div className="dash-header-glow-blue" />
        <div className="dash-header-glow-red" />

        <div className="dash-header-content-row">
          <div>
            <div className="dash-meta-pills-row">
              <span className="dash-status-node-pill">
                <span className="dash-pulse-dot" />
                Live Campus Node
              </span>
              <span className="dash-date-text">
                {dateLabel(data?.today, true)}
              </span>
              <span className="dash-role-view-badge">{role} View</span>
            </div>

            <h1 className="dash-headline-greeting">
              {getGreeting()},{" "}
              <span className="dash-headline-gradient-name">
                {user?.name ? user.name.split(" ")[0] : "Campus User"}
              </span>{" "}
              👋
            </h1>
            <p className="dash-header-subcopy">
              {role === "student"
                ? "Check your queue priority, reserve open office slots, and streamline your campus day."
                : "Oversee student queue velocity, verify tickets in real-time, and manage office capacities."}
            </p>
          </div>

          <div className="dash-header-actions-group">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="dash-action-icon-btn"
              title="Refresh Data"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>

            {onOpenVerify && (
              <button
                onClick={onOpenVerify}
                className="dash-action-btn-secondary"
              >
                <QrCode size={16} style={{ color: "var(--neon-sky)" }} />
                <span>Verify Ticket</span>
              </button>
            )}

            <button onClick={onOpenBooking} className="dash-action-btn-primary">
              <Plus size={16} />
              <span>Reserve New Slot</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Metrics & Stats Cards */}
      <div className="dash-stats-grid-wrapper">
        {/* Card 1: Active Queue */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="dash-stat-glass-card blue-hover"
        >
          <div className="dash-stat-top-row">
            <span className="dash-stat-label-title">Active Queue Waiters</span>
            <div className="dash-stat-icon-wrapper blue">
              <Users size={18} />
            </div>
          </div>
          <div className="dash-stat-figure-row">
            <span className="dash-stat-main-number">{activeQueuesCount}</span>
            <span className="dash-stat-badge-positive">
              <ArrowUpRight size={13} /> +14.2%
            </span>
          </div>
          <span className="dash-stat-footnote">Students queued today</span>

          <div className="dash-stat-mini-chart">
            {[35, 55, 80, 60, 45, 90, 75, 65].map((val, idx) => (
              <div
                key={idx}
                className="dash-spark-bar"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </motion.div>

        {/* Card 2: Completed Visits */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="dash-stat-glass-card red-hover"
        >
          <div className="dash-stat-top-row">
            <span className="dash-stat-label-title">Completed Visits</span>
            <div className="dash-stat-icon-wrapper red">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="dash-stat-figure-row">
            <span className="dash-stat-main-number">
              {completedCount + 138}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--neon-sky)",
              }}
            >
              98.4% on-time
            </span>
          </div>
          <span className="dash-stat-footnote">
            Across Cashier & Accounting
          </span>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              <span>Fulfillment</span>
              <span style={{ fontWeight: 700, color: "#fda4af" }}>98.4%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "#1e293b",
                borderRadius: "9999px",
                marginTop: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "98.4%",
                  height: "100%",
                  background: "var(--gradient-blue-red)",
                  borderRadius: "9999px",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Avg Processing Time */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="dash-stat-glass-card blue-hover"
        >
          <div className="dash-stat-top-row">
            <span className="dash-stat-label-title">Avg Processing Time</span>
            <div className="dash-stat-icon-wrapper blue">
              <Clock size={18} />
            </div>
          </div>
          <div className="dash-stat-figure-row">
            <span className="dash-stat-main-number">7.8 min</span>
            <span className="dash-stat-badge-positive">
              <ArrowDownRight size={13} /> -2.4m
            </span>
          </div>
          <span className="dash-stat-footnote">Optimal queue velocity</span>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg
              viewBox="0 0 100 24"
              style={{ width: "100%", height: "28px", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="neonSparkCurve" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00a2ff" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              <path
                d="M 0,20 Q 25,6 50,14 T 100,5"
                fill="none"
                stroke="url(#neonSparkCurve)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 4: Office Utilization */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="dash-stat-glass-card red-hover"
        >
          <div className="dash-stat-top-row">
            <span className="dash-stat-label-title">Capacity Utilization</span>
            <div className="dash-stat-icon-wrapper red">
              <Building2 size={18} />
            </div>
          </div>
          <div className="dash-stat-figure-row">
            <span className="dash-stat-main-number">84%</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--neon-crimson)",
              }}
            >
              High Demand
            </span>
          </div>
          <span className="dash-stat-footnote">
            Peak hour: 10:00 - 11:00 AM
          </span>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              <span>Cashier: 88%</span>
              <span>Accounting: 78%</span>
            </div>
            <div style={{ display: "flex", gap: "6px", height: "6px" }}>
              <div
                style={{
                  width: "50%",
                  background: "#1e293b",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "88%",
                    height: "100%",
                    background: "var(--neon-sky)",
                  }}
                />
              </div>
              <div
                style={{
                  width: "50%",
                  background: "#1e293b",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "78%",
                    height: "100%",
                    background: "var(--neon-crimson)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Next Upcoming Appointment Banner (if any) */}
      {upcomingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="dash-upcoming-banner"
        >
          <div className="dash-upcoming-left-group">
            <div className="dash-upcoming-ticket-icon-box">
              <Ticket size={24} />
            </div>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    background: "rgba(14, 165, 233, 0.2)",
                    color: "var(--neon-sky)",
                    border: "1px solid rgba(14, 165, 233, 0.3)",
                  }}
                >
                  Next Upcoming Reservation
                </span>
                <span className="dash-upcoming-queue-badge">
                  Queue #{upcomingBookings[0].queueNumber}
                </span>
              </div>
              <h3 className="dash-upcoming-service-title">
                {officeName(upcomingBookings[0].officeId)} ·{" "}
                {serviceName(
                  data,
                  upcomingBookings[0].officeId,
                  upcomingBookings[0].serviceId,
                )}
              </h3>
              <div className="dash-upcoming-details-row">
                <span>📅 {dateLabel(upcomingBookings[0].date)}</span>
                <span>⏰ {timeLabel(upcomingBookings[0].time)}</span>
                <span>👤 {upcomingBookings[0].studentName}</span>
              </div>
            </div>
          </div>

          <div className="dash-upcoming-btn-group">
            {upcomingBookings[0].status === "booked" && (
              <button
                onClick={() => handleCheckIn(upcomingBookings[0])}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#6ee7b7",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Check In Now
              </button>
            )}
            {upcomingBookings[0].status === "checked-in" && (
              <button
                onClick={() => handleComplete(upcomingBookings[0])}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "rgba(14, 165, 233, 0.2)",
                  border: "1px solid rgba(14, 165, 233, 0.4)",
                  color: "var(--neon-sky)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Mark Completed
              </button>
            )}
            <button
              onClick={() => onOpenTicket(upcomingBookings[0])}
              className="dash-action-btn-primary"
            >
              <span>View QR Pass</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Reports & Analytics Section */}
      <div className="dash-reports-panel">
        <div className="dash-reports-header-row">
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--neon-sky)",
              }}
            >
              Campus Intelligence
            </span>
            <h2 className="dash-reports-title">Reports & Analytics Section</h2>
          </div>

          <div className="dash-tabs-bar">
            {[
              {
                id: "throughput",
                label: "Throughput & Peak Hours",
                icon: TrendingUp,
              },
              { id: "breakdown", label: "Office Breakdown", icon: Building2 },
              { id: "activity", label: "Live Queue Stream", icon: Activity },
              { id: "schedule", label: "Active Slots", icon: CalendarDays },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`dash-tab-pill-button ${isActive ? "active" : ""}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAnalyticsTab"
                      className="dash-tab-pill-active-bg"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="dash-tab-btn-inner">
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: "24px" }}>
          <AnimatePresence mode="wait">
            {activeTab === "throughput" && (
              <motion.div
                key="tab-throughput"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Time Range Selector */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "12px", color: "var(--text-muted)" }}
                    >
                      View timeframe:
                    </span>
                    <div
                      style={{
                        display: "inline-flex",
                        padding: "2px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {["today", "week", "month"].map((tr) => (
                        <button
                          key={tr}
                          onClick={() => setTimeRange(tr)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            background:
                              timeRange === tr
                                ? "rgba(14, 165, 233, 0.25)"
                                : "transparent",
                            color:
                              timeRange === tr
                                ? "var(--neon-sky)"
                                : "var(--text-muted)",
                          }}
                        >
                          {tr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: "16px", fontSize: "12px" }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: "var(--neon-sky)",
                        }}
                      />{" "}
                      Arrivals
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: "var(--neon-crimson)",
                        }}
                      />{" "}
                      Completed
                    </span>
                  </div>
                </div>

                {/* SVG Visual Graph */}
                <div className="dash-chart-card-box">
                  <div className="dash-chart-bars-container">
                    {hourlyData.map((d, i) => (
                      <div key={i} className="dash-chart-col">
                        <div className="dash-chart-bars-dual">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${d.height}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="dash-bar-arrival"
                          />
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{
                              height: `${Math.round(d.height * 0.88)}%`,
                            }}
                            transition={{
                              duration: 0.5,
                              delay: i * 0.05 + 0.1,
                            }}
                            className="dash-bar-completed"
                          />
                        </div>
                        <span className="dash-chart-label">{d.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "breakdown" && (
              <motion.div
                key="tab-breakdown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* Cashier Department */}
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    background: "rgba(23, 23, 23, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div className="dash-stat-icon-wrapper blue">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, color: "#fff" }}>
                          Cashier Department
                        </h4>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Financial services
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#6ee7b7",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      Online
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Tuition & Assessment Payment</span>
                        <strong style={{ color: "var(--neon-sky)" }}>
                          142 slots (68%)
                        </strong>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#1e293b",
                          borderRadius: "9999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "68%",
                            height: "100%",
                            background: "var(--neon-sky)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Promissory Note Endorsement</span>
                        <strong style={{ color: "var(--neon-sky)" }}>
                          67 slots (32%)
                        </strong>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#1e293b",
                          borderRadius: "9999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "32%",
                            height: "100%",
                            background: "var(--neon-sky)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accounting Department */}
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    background: "rgba(23, 23, 23, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "12px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div className="dash-stat-icon-wrapper red">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, color: "#fff" }}>
                          Accounting Department
                        </h4>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Clearance & permits
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#6ee7b7",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      Online
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Exam Permit Validation</span>
                        <strong style={{ color: "var(--neon-crimson)" }}>
                          98 slots (45%)
                        </strong>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#1e293b",
                          borderRadius: "9999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "45%",
                            height: "100%",
                            background: "var(--neon-crimson)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Academic Clearance Release</span>
                        <strong style={{ color: "var(--neon-crimson)" }}>
                          64 slots (29%)
                        </strong>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#1e293b",
                          borderRadius: "9999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "29%",
                            height: "100%",
                            background: "var(--neon-crimson)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "activity" && (
              <motion.div
                key="tab-activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  {
                    title: "Student checked in at Cashier Counter 2",
                    desc: "Queue ticket #C-042 verified and assigned to staff lane.",
                    time: "2 mins ago",
                    badge: "Checked In",
                    color: "rgba(14, 165, 233, 0.2)",
                  },
                  {
                    title: "Permit validation completed",
                    desc: "Accounting ticket #A-019 signed off with verified stamp.",
                    time: "6 mins ago",
                    badge: "Completed",
                    color: "rgba(16, 185, 129, 0.2)",
                  },
                  {
                    title: "New slot reserved for Promissory Note",
                    desc: "Student ID 2026-01-123 reserved tomorrow 10:00 AM slot.",
                    time: "12 mins ago",
                    badge: "Reserved",
                    color: "rgba(99, 102, 241, 0.2)",
                  },
                ].map((act, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      background: "rgba(23, 23, 23, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h5
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#ffffff",
                        }}
                      >
                        {act.title}
                      </h5>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        {act.desc}
                      </p>
                      <span
                        style={{ fontSize: "10px", color: "var(--text-muted)" }}
                      >
                        {act.time}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: act.color,
                        color: "#ffffff",
                      }}
                    >
                      {act.badge}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "schedule" && (
              <motion.div
                key="tab-schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {upcomingBookings.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {upcomingBookings.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          padding: "16px",
                          borderRadius: "16px",
                          background: "rgba(23, 23, 23, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              background: "var(--gradient-blue-red)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: "12px",
                            }}
                          >
                            {b.queueNumber}
                          </div>
                          <div>
                            <h5
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#ffffff",
                              }}
                            >
                              {officeName(b.officeId)} ·{" "}
                              {serviceName(data, b.officeId, b.serviceId)}
                            </h5>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--text-muted)",
                              }}
                            >
                              {dateLabel(b.date)} at {timeLabel(b.time)} ·{" "}
                              {b.studentName}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => onOpenTicket(b)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "10px",
                              background: "rgba(255,255,255,0.08)",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            View Pass
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "48px 0",
                      textAlign: "center",
                      background: "rgba(23, 23, 23, 0.4)",
                      borderRadius: "16px",
                    }}
                  >
                    <CalendarDays
                      size={36}
                      style={{
                        margin: "0 auto 12px",
                        color: "var(--text-muted)",
                      }}
                    />
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      No Upcoming Reservations Yet
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      Reserve an appointment slot for Cashier or Accounting in
                      just a few clicks.
                    </p>
                    <button
                      onClick={onOpenBooking}
                      className="dash-action-btn-primary"
                      style={{ margin: "16px auto 0" }}
                    >
                      Reserve a Slot Now
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
