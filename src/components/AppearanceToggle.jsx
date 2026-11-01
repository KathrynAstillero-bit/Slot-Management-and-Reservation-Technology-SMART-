import React from "react";
import { Moon, Sun } from "lucide-react";
import "./AppearanceToggle.css";

export default function AppearanceToggle({ theme, onChange }) {
  return (
    <div
      className="appearance-toggle"
      data-theme={theme}
      role="group"
      aria-label="Appearance"
    >
      <span className="appearance-toggle-thumb" aria-hidden="true" />
      <button
        type="button"
        aria-label="Light mode"
        title="Light mode"
        aria-pressed={theme === "light"}
        onClick={() => onChange("light")}
      >
        <Sun size={21} />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        title="Dark mode"
        aria-pressed={theme === "dark"}
        onClick={() => onChange("dark")}
      >
        <Moon size={21} />
      </button>
    </div>
  );
}
