import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ViewSwitcher.css";
import {
  Layers,
  LayoutDashboard,
  LogIn,
  Sparkles,
  ChevronUp,
  X,
  RefreshCw,
} from "lucide-react";

export default function ViewSwitcher({
  currentView,
  setCurrentView,
  role,
  onRoleChange,
  onSeedDemoData,
}) {
  const [expanded, setExpanded] = useState(false);

  const roles = ["student", "cashier", "accounting", "admin"];

  return (
    <aside aria-label="Demo view switcher" className="view-switcher-dock">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="view-switcher-menu"
          >
            <div className="view-switcher-header">
              <span className="view-switcher-title">
                <Sparkles size={14} style={{ color: "var(--neon-sky)" }} />
                <span>Flow & View Controls</span>
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="view-switcher-close-btn"
              >
                <X size={14} />
              </button>
            </div>

            {/* Switch Views */}
            <div className="view-switcher-section">
              <span className="view-switcher-section-title">Active View</span>
              <button
                onClick={() => {
                  setCurrentView("auth");
                  setExpanded(false);
                }}
                className={`view-switcher-nav-btn ${currentView === "auth" ? "active" : ""}`}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <LogIn size={13} /> View 1: Login & Signup
                </span>
                {currentView === "auth" && (
                  <span style={{ fontSize: "10px" }}>Active</span>
                )}
              </button>

              <button
                onClick={() => {
                  setCurrentView("dashboard");
                  setExpanded(false);
                }}
                className={`view-switcher-nav-btn ${currentView === "dashboard" ? "active" : ""}`}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <LayoutDashboard size={13} /> View 2 & 3: Navbar + Dashboard
                </span>
                {currentView === "dashboard" && (
                  <span style={{ fontSize: "10px" }}>Active</span>
                )}
              </button>
            </div>

            {/* Switch Roles */}
            <div style={{ paddingTop: "10px" }}>
              <span className="view-switcher-section-title">Role Persona</span>
              <div className="view-switcher-role-grid">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      if (onRoleChange) onRoleChange(r);
                      setExpanded(false);
                    }}
                    className={`view-switcher-role-btn ${role === r ? "active" : ""}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {onSeedDemoData && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={() => {
                    onSeedDemoData();
                    setExpanded(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Seed Sample Campus Slots</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        className="view-switcher-pill"
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--neon-sky)",
            boxShadow: "0 0 8px rgba(14,165,233,0.8)",
          }}
        />
        <Layers size={14} style={{ color: "var(--neon-sky)" }} />
        <span>Preview Controls</span>
        <ChevronUp
          size={14}
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </motion.button>
    </aside>
  );
}
