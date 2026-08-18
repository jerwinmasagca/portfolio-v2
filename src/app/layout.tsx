import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import ChatBot from "@/components/ChatBot";
import NavbarScrollSpy from "@/components/NavbarScrollSpy";
import HeaderNavActions from "@/components/HeaderNavActions";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jerwinmasagca.dev"),
  title: "Jerwin Masagca | Full-Stack Developer",
  description: "Building practical applications across web and desktop, with a focus on backend systems, databases, and modern user experiences.",
  openGraph: {
    title: "Jerwin Masagca | Full-Stack Developer",
    description: "Building practical applications across web and desktop, with a focus on backend systems, databases, and modern user experiences.",
    url: "https://www.jerwinmasagca.dev",
    siteName: "Jerwin Masagca Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jerwin Masagca | Full-Stack Developer",
    description: "Building practical applications across web and desktop, with a focus on backend systems, databases, and modern user experiences.",
  },
};

import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
        {/* Smart Scroll-Aware Navigation Bar (Auto-Hides on Scroll Down, Reveals on Scroll Up) */}
        <HeaderWrapper>
          <div className="flex items-center justify-between gap-4">
            
            {/* Left Identity Badge */}
            <Link 
              href="/#home"
              className="flex items-center gap-2 sm:gap-3 rounded-full p-1.5 sm:px-4 sm:py-2 border border-white/10 bg-slate-950/70 backdrop-blur-md shadow-xl group hover:border-cyan-500/30 transition-all duration-300 select-none"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.65)] ring-1 ring-cyan-400/60 bg-gradient-to-b from-cyan-950/60 to-slate-950 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(6,182,212,0.9)] group-hover:ring-cyan-300 transition-all duration-300">
                <svg viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="jmBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0c1938" />
                      <stop offset="100%" stopColor="#030712" />
                    </linearGradient>
                    <linearGradient id="jmTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <linearGradient id="jmBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.8" />
                    </filter>
                  </defs>
                  <circle cx="18" cy="18" r="16" fill="url(#jmBgGradient)" stroke="url(#jmBorderGradient)" strokeWidth="1.8" />
                  <text 
                    x="50%" 
                    y="54%" 
                    dominantBaseline="middle" 
                    textAnchor="middle" 
                    fill="url(#jmTextGradient)" 
                    filter="url(#logoGlow)"
                    fontFamily="var(--font-syne), sans-serif" 
                    fontWeight="900" 
                    fontSize="13.5" 
                    letterSpacing="-0.5"
                  >
                    JM
                  </text>
                </svg>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 font-syne font-bold text-sm tracking-wider text-white">
                <span>JERWIN</span>
                <span className="text-cyan-400">MASAGCA</span>
              </div>
            </Link>

            {/* Center: Dynamic Scroll-Spy Capsule (Desktop) / Breadcrumb Dropdown (Mobile) */}
            <NavbarScrollSpy />

            {/* Right Side: Social Links (Desktop) & Theme Switcher (All Devices) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-3">
                <HeaderNavActions />
              </div>

              {/* Theme Switcher */}
              <ThemeToggle />
            </div>

          </div>
        </HeaderWrapper>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* AI Chatbot */}
        <ChatBot />
      </body>
    </html>
  );
}
