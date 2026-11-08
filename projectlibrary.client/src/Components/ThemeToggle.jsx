import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        color: "inherit",
        fontSize: "1.1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={theme === "light" ? "Qaranlıq rejimə keç" : "İşıqlı rejimə keç"}
    >
      {theme === "light" ? <FaMoon color="#4b5563" /> : <FaSun color="#f59e0b" />}
    </button>
  );
};

export default ThemeToggle;
