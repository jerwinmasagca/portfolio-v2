"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Home, Briefcase, FileText, Cpu, Mail, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/BrandIcons";
import { supabase } from "@/lib/supabase";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/#home", icon: Home },
  { id: "projects", label: "Projects", href: "/#projects", icon: Briefcase },
  { id: "experience", label: "Experience", href: "/#experience", icon: FileText },
  { id: "skills", label: "Skills", href: "/#skills", icon: Cpu },
  { id: "contact", label: "Contact", href: "/#contact", icon: Mail },
];

export default function NavbarScrollSpy() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [resumeUrl, setResumeUrl] = useState<string>("https://srlbrzvdhxigwytveqdh.supabase.co/storage/v1/object/public/portfolio/uploads/b8il1h0bz1r.pdf");
  const [githubUrl, setGithubUrl] = useState<string>("https://github.com/jerwinmasagca");
  const [linkedinUrl, setLinkedinUrl] = useState<string>("https://www.linkedin.com/in/jerwin-masagca-889815340");
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic profile settings (updates automatically if uploaded in admin)
  const fetchProfileSettings = async () => {
    try {
      if (typeof window !== "undefined") {
        const simProfileStr = localStorage.getItem("sim_profile");
        if (simProfileStr) {
          try {
            const parsed = JSON.parse(simProfileStr);
            if (parsed.resume_url) setResumeUrl(parsed.resume_url);
            if (parsed.github) setGithubUrl(parsed.github);
            if (parsed.linkedin) setLinkedinUrl(parsed.linkedin);
          } catch (e) {}
        }
      }

      const { data, error } = await supabase
        .from("profile_settings")
        .select("resume_url, github, linkedin")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        if (data.resume_url) setResumeUrl(data.resume_url);
        if (data.github) setGithubUrl(data.github);
        if (data.linkedin) setLinkedinUrl(data.linkedin);
      }
    } catch (err) {
      console.warn("Could not fetch profile settings for mobile nav:", err);
    }
  };

  useEffect(() => {
    fetchProfileSettings();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sim_profile") fetchProfileSettings();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileOpen]);

  // ScrollSpy listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180; // offset threshold

      const sections = NAV_ITEMS.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return null;
        const top = el.offsetTop;
        const height = el.offsetHeight;
        return {
          id: item.id,
          top,
          bottom: top + height,
        };
      }).filter(Boolean);

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && scrollPosition >= sec.top) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nav-link-clicked"));
      if (window.location.pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${targetId}`);
          setActiveSection(targetId);
        }
      }
    }
    setIsMobileOpen(false);
  };

  const currentActiveItem = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP NAVIGATION CAPSULE (Visible on lg and above) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center rounded-full p-1.5 border border-white/10 bg-slate-950/70 backdrop-blur-md shadow-xl">
        <nav className="flex items-center space-x-1.5 whitespace-nowrap">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`rounded-full px-4.5 py-2 text-sm font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-950 shadow-md scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE EXPANDABLE BREADCRUMB BUTTON & DRAWER (Visible below lg) */}
      {/* ========================================================================= */}
      <div className="lg:hidden relative" ref={menuRef}>
        {/* Breadcrumb Trigger Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all duration-300 backdrop-blur-xl shadow-lg cursor-pointer select-none ${
            isMobileOpen
              ? "bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              : "bg-slate-950/80 border-white/15 text-slate-200 hover:border-cyan-500/40"
          }`}
          aria-label="Toggle navigation menu"
        >
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">Section:</span>
            <span className="text-cyan-300 capitalize">{currentActiveItem.label}</span>
          </div>

          <div className={`transition-transform duration-300 text-cyan-400 ${isMobileOpen ? "rotate-180" : ""}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {/* Expandable Glass Dropdown Menu */}
        {isMobileOpen && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[280px] sm:w-[320px] rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 z-50 animate-fadeIn space-y-1.5">
            {/* Header indicator */}
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400/80 border-b border-white/10 flex items-center justify-between">
              <span>Quick Navigation</span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 pt-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const IconComponent = item.icon;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-sky-500/10 border border-cyan-400/30 text-white font-bold shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Quick Actions at bottom of mobile menu */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all border border-white/5"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>View CV</span>
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-all border border-white/5"
                  aria-label="GitHub"
                >
                  <GithubIcon className="w-4 h-4 fill-current" />
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-all border border-white/5"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4 fill-current" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
