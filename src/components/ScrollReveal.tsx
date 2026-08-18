"use client";

import { useEffect, useRef, useState } from "react";

type AnimationVariant =
  | "fadeInUp"
  | "fadeInDown"
  | "fadeIn"
  | "slideInLeft"
  | "slideInRight"
  | "zoomIn";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number; // in ms
  duration?: number; // in ms
  className?: string;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  variant = "fadeInUp",
  delay = 0,
  duration = 700,
  className = "",
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--variant-${variant} ${isVisible ? `scroll-reveal--visible scroll-reveal--${variant}` : "scroll-reveal--hidden"} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
