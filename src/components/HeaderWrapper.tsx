"use client";

import React, { useEffect, useState, useRef } from "react";

interface HeaderWrapperProps {
  children: React.ReactNode;
}

/**
 * Pure Intent-Driven Smart Header (Senior Design Standard)
 * - Visible at the very top of the page.
 * - Hides smoothly on scroll-down (distraction-free reading).
 * - Reveals ONLY on intentional user gestures: scrolling up OR moving cursor to the top edge.
 * - Never interrupts stationary reading with auto-timers.
 */
export default function HeaderWrapper({ children }: HeaderWrapperProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isHoveredRef = useRef(false);
  const scrollThreshold = 8; // Delta threshold to avoid micro-jitter

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Always show when near the very top of page
      if (currentScrollY <= 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // 2. Protect from hiding if mouse is actively hovering the navbar
      if (isHoveredRef.current) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // 3. User Scrolling Down -> Hide Header (Calm reading mode)
      if (currentScrollY > lastScrollY.current + scrollThreshold) {
        setIsVisible(false);
      } 
      // 4. User Scrolling Up -> Reveal Header (Intent to navigate)
      else if (currentScrollY < lastScrollY.current - scrollThreshold) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // 5. Desktop Top-Edge Hover: Reveal if user moves cursor near the top edge (< 65px)
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 65) {
        setIsVisible(true);
      }
    };

    // 6. Navigation Link Clicked: Hide immediately during transition to target section
    const handleNavClickHide = () => {
      isHoveredRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("nav-link-clicked", handleNavClickHide);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("nav-link-clicked", handleNavClickHide);
    };
  }, []);

  return (
    <header
      onMouseEnter={() => {
        isHoveredRef.current = true;
        setIsVisible(true);
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-out py-3 sm:py-4 pointer-events-none ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pointer-events-auto">
        {children}
      </div>
    </header>
  );
}
