"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dashboard" | "watercolor">("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or default to dashboard
    const savedTheme = localStorage.getItem("portfolio-theme") as "dashboard" | "watercolor" | null;
    const initialTheme = savedTheme || "dashboard";
    setTheme(initialTheme);
    
    // Apply class to body
    if (initialTheme === "watercolor") {
      document.body.classList.add("theme-watercolor");
      document.body.classList.remove("theme-dashboard");
    } else {
      document.body.classList.add("theme-dashboard");
      document.body.classList.remove("theme-watercolor");
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dashboard" ? "watercolor" : "dashboard";
    setTheme(nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);

    if (nextTheme === "watercolor") {
      document.body.classList.add("theme-watercolor");
      document.body.classList.remove("theme-dashboard");
    } else {
      document.body.classList.add("theme-dashboard");
      document.body.classList.remove("theme-watercolor");
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-full border border-white/10 hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
      title={theme === "dashboard" ? "Switch to Watercolor Mode (Light)" : "Switch to Dashboard Mode (Dark)"}
    >
      {theme === "dashboard" ? (
        <>
          <Sun className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono font-bold tracking-wider">LIGHT</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono font-bold tracking-wider">DARK</span>
        </>
      )}
    </button>
  );
}
