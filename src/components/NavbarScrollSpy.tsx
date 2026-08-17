"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "skills", label: "Skills", href: "/#skills" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export default function NavbarScrollSpy() {
  const [activeSection, setActiveSection] = useState<string>("home");

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

  return (
    <div className="mx-auto lg:mx-0 flex items-center gap-1.5 rounded-full p-2 border border-white/10 bg-slate-950/70 backdrop-blur-md shadow-xl">
      <nav className="flex items-center space-x-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`rounded-full px-4.5 py-2 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-white text-slate-950 shadow-md scale-105"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
