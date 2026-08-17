"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Project, ProfileSettings, Experience, Education, Certification, Skill, supabase } from "@/lib/supabase";
import SplineViewer from "@/components/SplineViewer";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Mail, Calendar, MapPin, Phone, Award, BookOpen, Briefcase,
  ChevronRight, ChevronDown, ChevronLeft, FileText, ExternalLink,
  Clock, Send, Code, ShieldCheck, HeartPulse
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/BrandIcons";

// Fallback data seeded with user projects, experience, and skills
const FALLBACK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Dawnasyon: A Smart Relief Distribution System",
    description: "Architected and developed a community relief system alone. Features SQLite persistence, Face ID Biometrics, Email 2FA, QR Verification, and Gemini AI chatbot.",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    project_url: "#",
    github_url: "https://github.com",
    tags: ["React", "Node.js", "SQLite", "PHP", "Tailwind CSS", "Gemini API"],
  },
  {
    id: "2",
    title: "Kyusi Esports Community System",
    description: "Developed the responsive frontend portal for the school organization using HTML, CSS, JavaScript, and Bootstrap. Built pages for blogs, announcements, and events.",
    image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    project_url: "#",
    github_url: "https://github.com",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Git"],
  },
  {
    id: "3",
    title: "Supabase Admin Dashboard Integration",
    description: "A secure, modern, real-time database management interface featuring schema visualizations, activity logs, and instant CRUD operations.",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    project_url: "#",
    github_url: "https://github.com",
    tags: ["React", "Next.js", "Supabase", "Tailwind CSS"],
  },
];

const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: "1",
    role: "Full-Stack Developer Intern",
    company: "MGEN (Meralco PowerGen)",
    duration: "Sept 2025 - Feb 2026",
    description: [
      "Contributed to the MGEN Central Hub system, completing 160+ development tickets.",
      "Independently implemented Microsoft Single Sign-On (SSO) using Azure AD (Entra ID).",
      "Led database migration to Supabase, optimizing stable query performance.",
      "Designed and developed Role-Based Access Control (RBAC) permissions."
    ]
  }
];

const FALLBACK_EDUCATION: Education[] = [
  { id: "1", school: "Quezon City University", degree: "Bachelor of Science in IT (BSIT)", year: "Tertiary" },
  { id: "2", school: "International Christian College", degree: "Senior High School", year: "Graduated 2022" },
  { id: "3", school: "Doña Rosario High School", degree: "High School", year: "Graduated 2020" }
];

const FALLBACK_SKILLS: Skill[] = [
  { name: "Node.js", category: "Backend" },
  { name: "PHP", category: "Backend" },
  { name: "CodeIgniter", category: "Backend" },
  { name: "TypeScript", category: "Backend" },
  { name: "React", category: "Frontend" },
  { name: "Bootstrap", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "MySQL", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "SQLite", category: "Database" },
  { name: "Supabase", category: "Database" },
  { name: "Git/GitHub", category: "Tools" },
  { name: "SSO (Entra ID)", category: "General" },
  { name: "RBAC Controls", category: "General" },
];

export default function Home() {
  const [isWatercolor, setIsWatercolor] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeStr, setTimeStr] = useState("");

  // Autoplay Showcase Carousel States (rotating every 1 second)
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedTag, setSelectedTag] = useState("All");

  const [profile, setProfile] = useState<ProfileSettings>({
    name: "Jerwin B. Masagca",
    title: "Full-Stack Developer Intern",
    bio: "Full-Stack Developer Intern with hands-on experience building secure web, desktop, and mobile applications. Specializes in backend system structures, database migrations, SSO systems, and RBAC permissions.",
    spline_url: "https://my.spline.design/roomrelaxingcopy-dNXtjCuu7tPa7pG8yhZ5X4ct/",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "masagca.jerwin.bedro@gmail.com"
  });

  // Observe body class changes to detect active theme
  useEffect(() => {
    const checkTheme = () => {
      setIsWatercolor(document.body.classList.contains("theme-watercolor"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Mouse movement tracker to feed CSS spotlight variables
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      };
      setTimeStr(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch Profile
      try {
        const { data, error } = await supabase
          .from("profile_settings")
          .select("*")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data) setProfile(data);
      } catch (err) {
        console.warn("Failed to load profile, using fallback", err);
      }

      // Fetch Projects
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) setProjects(data);
        else setProjects(FALLBACK_PROJECTS);
      } catch (err) {
        setProjects(FALLBACK_PROJECTS);
      }

      // Fetch Experiences
      try {
        const { data, error } = await supabase
          .from("experiences")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) setExperiences(data);
        else setExperiences(FALLBACK_EXPERIENCES);
      } catch (err) {
        setExperiences(FALLBACK_EXPERIENCES);
      }

      // Fetch Education
      try {
        const { data, error } = await supabase
          .from("education")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) setEducationList(data);
        else setEducationList(FALLBACK_EDUCATION);
      } catch (err) {
        setEducationList(FALLBACK_EDUCATION);
      }

      // Fetch Skills
      try {
        const { data, error } = await supabase
          .from("skills")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) setSkills(data);
        else setSkills(FALLBACK_SKILLS);
      } catch (err) {
        setSkills(FALLBACK_SKILLS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      // 1. Direct Web3Forms submission
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "23877881-655b-43dc-bdcb-a9944279d51d",
          subject: `🚀 Portfolio Message from ${contactForm.name}`,
          from_name: `${contactForm.name} (Portfolio)`,
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
        }),
      }).catch((err) => console.warn("Direct Web3Forms client dispatch error:", err));

      // 2. Dispatch to server-side API (saves to Supabase + server-side email dispatch)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      if (!res.ok) {
        throw new Error("Server response was not ok");
      }

      setSuccessMessage("Thank you! Transmission received & sent to Jerwin's email.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.warn("Could not send via /api/contact, falling back to direct database insert:", err);
      try {
        const { error } = await supabase.from("contacts").insert([contactForm]);
        if (error) throw error;
        setSuccessMessage("Thank you! Message received.");
        setContactForm({ name: "", email: "", message: "" });
      } catch (dbErr: any) {
        try {
          const stored = localStorage.getItem("sim_contacts");
          const list = stored ? JSON.parse(stored) : [];
          list.push({
            id: Math.random().toString(),
            created_at: new Date().toISOString(),
            ...contactForm
          });
          localStorage.setItem("sim_contacts", JSON.stringify(list));
          setSuccessMessage("Message received.");
          setContactForm({ name: "", email: "", message: "" });
        } catch (storageErr) {
          console.error("Local storage fallback failed:", storageErr);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Array.from(new Set(skills.map(s => s.category)));

  // Dynamic tags filtering
  const allTags = ["All", ...Array.from(new Set(projects.flatMap(p => p.tags || [])))];
  const filteredProjects = selectedTag === "All"
    ? projects
    : projects.filter(p => p.tags?.includes(selectedTag));

  // Project carousel auto-advance (1 second)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (filteredProjects.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % filteredProjects.length);
  }, [filteredProjects.length]);

  const prevSlide = useCallback(() => {
    if (filteredProjects.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  }, [filteredProjects.length]);

  useEffect(() => {
    if (isCarouselPaused || filteredProjects.length <= 1) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide, isCarouselPaused, filteredProjects.length]);

  // Reset carousel index when filter changes
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedTag]);

  return (
    <div className="flex flex-col min-h-screen text-white bg-transparent font-sans selection:bg-cyan-500/20 relative overflow-hidden">

      {/* Dynamic Moving Volumetric Smoke Canvas with Fluid Turbulence */}
      {isWatercolor && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#0a1120]">
          {/* SVG Displacement Filter for Fluid Organic Dissolve */}
          <svg className="hidden" aria-hidden="true">
            <defs>
              <filter id="smokeTurbulence" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="4" result="noise" seed="42">
                  <animate attributeName="baseFrequency" dur="25s" values="0.012 0.018; 0.02 0.012; 0.012 0.018" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          {/* Background Layer 1: Volumetric base smoke with fluid displacement */}
          <div
            className="w-[125%] h-[125%] absolute -top-[12%] -left-[12%] bg-cover bg-center smoke-layer-base opacity-85"
            style={{
              backgroundImage: 'url("/watercolor_background.png")',
              filter: 'url(#smokeTurbulence)',
            }}
          />

          {/* Background Layer 2: Counter-drifting soft atmospheric plume */}
          <div
            className="w-[130%] h-[130%] absolute -top-[15%] -left-[15%] bg-cover bg-center smoke-layer-overlay opacity-60 mix-blend-screen"
            style={{
              backgroundImage: 'url("/watercolor_background.png")',
            }}
          />

          {/* Vignette depth darkening */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 via-transparent to-[#030712]/50 pointer-events-none" />
        </div>
      )}

      {/* Interactive mouse tracking spotlight */}
      <div className="mouse-spotlight pointer-events-none" />

      {/* Base faint dot grid */}
      <div className="bg-dot-grid pointer-events-none" />

      {/* Highlight grid revealed only around the cursor (Magnifying spotlight lens) */}
      <div className="bg-dot-grid-highlight pointer-events-none" />



      {/* Floating Background Glow Orbs */}
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="glow-orb-3" />

      {/* Scrollable Main Content Container */}
      <div className="relative z-10 flex-grow w-full">

        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section id="home" className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 lg:py-6">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Column: Bio, Call-to-actions (Identity Focus) */}
              <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start">
                {/* Available Badge */}
                <ScrollReveal variant="fadeInDown" delay={0}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {profile.availability_badge || "Available for Internships"}
                  </div>
                </ScrollReveal>

                {/* Big Typography Intro */}
                <ScrollReveal variant="fadeInUp" delay={100}>
                  <h1 className="font-syne text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white">
                    Hi, I'm{" "}
                    <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                      {profile.name}
                    </span>
                  </h1>
                </ScrollReveal>

                {/* Subtitle */}
                <ScrollReveal variant="fadeInUp" delay={200}>
                  <p className="text-xs sm:text-sm font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/5 border border-cyan-500/10 px-3 py-0.5 rounded-md">
                    {profile.title}
                  </p>
                </ScrollReveal>

                {/* Bio text */}
                <ScrollReveal variant="fadeInUp" delay={300}>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {profile.bio}
                  </p>
                </ScrollReveal>

                {/* Action Buttons */}
                <ScrollReveal variant="fadeInUp" delay={400}>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href="#projects"
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-2"
                    >
                      <span>Explore Work</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                    <a
                      href="#contact"
                      className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-cyan-400/40 bg-white/5 hover:bg-cyan-500/10 text-slate-200 hover:text-white font-medium text-sm transition-all duration-300 flex items-center gap-2"
                    >
                      Contact Me
                    </a>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Column: Profile Portrait Card with Futuristic Animated Border & Holographic Accents */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                <ScrollReveal variant="slideInRight" delay={200} duration={900}>
                  <div className="relative group w-full max-w-[340px] md:max-w-[360px] profile-card-container rounded-[2rem] p-[2px] overflow-hidden">

                    {/* Animated Conic Gradient Border (Contained exactly in the rounded parent) */}
                    <div className="absolute inset-[-150%] profile-border-glow -z-10 opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Main Card Container */}
                    <div className="p-4 rounded-[1.85rem] bg-slate-950/90 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden h-full">

                      {/* Tech Corner Decorative Brackets */}
                      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 rounded-tl pointer-events-none" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 rounded-tr pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 rounded-bl pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 rounded-br pointer-events-none" />

                      {/* Portrait photo box with holographic scanline */}
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner group/photo">
                        <img
                          src={profile.avatar_url || "/jerwin_gradpic.JPG"}
                          alt={profile.name}
                          className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-700 ease-out"
                        />

                        {/* Holographic Cyan Laser Scanline */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent profile-scanline pointer-events-none shadow-[0_0_12px_rgba(6,182,212,1)]" />

                        {/* Dynamic Vignette & Lighting */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                        {/* Top-Right Badge: Identity Verified */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold rounded-full bg-slate-950/70 backdrop-blur-md text-cyan-300 border border-cyan-400/30 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          VERIFIED
                        </div>

                        {/* Bottom-Left Status Pill */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 text-[9px] font-mono font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-lg">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          SYSTEM ACTIVE
                        </div>
                      </div>

                      {/* Card bottom details */}
                      <div className="pt-3.5 pb-1 px-1.5 flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-syne text-sm font-bold text-white tracking-wide">
                              {profile.name}
                            </h3>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          </div>
                          <p className="text-[9px] font-mono font-semibold text-cyan-400 uppercase tracking-widest leading-none">
                            {profile.title}
                          </p>
                        </div>

                        <div className="text-[9px] font-mono text-slate-400 text-right space-y-0.5 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-xl">
                          <div className="text-cyan-300 font-bold">QUEZON CITY // GMT+8</div>
                          <div className="text-[8px] text-slate-500">{timeStr ? timeStr.split(" ")[0] : "--:--"} PHT</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PROJECTS SECTION */}
        {/* ========================================================================= */}
        <section id="projects" className="py-20 md:py-28 border-t border-white/5 bg-slate-950/10">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <ScrollReveal variant="fadeInUp">
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/15 px-3 py-1 rounded-full">
                  Projects
                </span>
                <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Featured Work
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  A gallery of systems, applications, and tools I have engineered. Filter by technology to inspect my work.
                </p>
              </div>
            </ScrollReveal>

            {/* Filter Pills */}
            <ScrollReveal variant="fadeInUp" delay={100}>
              <div className="flex flex-wrap gap-2 justify-center mt-10 mb-12">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono border transition-all duration-300 ${selectedTag === tag
                      ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:border-cyan-500/30 hover:text-white"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Projects Carousel */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredProjects.length > 0 ? (
              <ScrollReveal variant="fadeInUp" delay={200}>
                <div
                  className="relative max-w-2xl mx-auto"
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                >
                  {/* Carousel viewport */}
                  <div className="overflow-hidden rounded-2xl">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                    >
                      {filteredProjects.map((project) => (
                        <div key={project.id} className="w-full flex-shrink-0 px-2">
                          <ProjectCard project={project} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {filteredProjects.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 border border-white/15 text-white hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all flex items-center justify-center backdrop-blur-md shadow-lg"
                        aria-label="Previous project"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 border border-white/15 text-white hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all flex items-center justify-center backdrop-blur-md shadow-lg"
                        aria-label="Next project"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}

                  {/* Dot Indicators */}
                  {filteredProjects.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {filteredProjects.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCarouselIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === carouselIndex
                            ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                            : "w-1.5 bg-white/20 hover:bg-white/40"
                            }`}
                          aria-label={`Go to project ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-sm">
                No projects found matching the selected criteria.
              </div>
            )}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXPERIENCE & EDUCATION SECTION */}
        {/* ========================================================================= */}
        <section id="experience" className="py-20 md:py-28 border-t border-white/5">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <ScrollReveal variant="fadeInUp">
              <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/15 px-3 py-1 rounded-full">
                  Timeline
                </span>
                <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Journey & Credentials
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  A historical overview of my professional experience and academic background.
                </p>
              </div>
            </ScrollReveal>

            {/* Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">

              {/* Experience Column */}
              <div className="space-y-8">
                <ScrollReveal variant="fadeInDown" delay={100}>
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className="font-syne text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                      Professional Experience
                    </h3>
                  </div>
                </ScrollReveal>

                <div className="relative pl-6 border-l-2 border-cyan-500/20 space-y-12 ml-4">
                  {experiences.map((exp, idx) => (
                    <ScrollReveal key={exp.id || idx} variant="fadeInUp" delay={150 + idx * 120} duration={800}>
                      <div className="relative group">
                        {/* Node circle */}
                        <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        </div>

                        <div className="space-y-3">
                          <span className="inline-block rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400 font-mono">
                            {exp.duration}
                          </span>

                          <div>
                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {exp.role}
                            </h4>
                            <p className="text-sm text-slate-400 font-medium">
                              {exp.company}
                            </p>
                          </div>

                          {Array.isArray(exp.description) ? (
                            <ul className="list-disc pl-5 text-sm text-slate-400 space-y-2 leading-relaxed">
                              {exp.description.map((item, dIdx) => (
                                <li key={dIdx} className="hover:text-slate-300 transition-colors">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Education Column */}
              <div className="space-y-8">
                <ScrollReveal variant="fadeInDown" delay={150}>
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h3 className="font-syne text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                      Education
                    </h3>
                  </div>
                </ScrollReveal>

                <div className="relative pl-6 border-l-2 border-cyan-500/20 space-y-12 ml-4">
                  {educationList.map((edu, idx) => (
                    <ScrollReveal key={edu.id || idx} variant="fadeInUp" delay={200 + idx * 120} duration={800}>
                      <div className="relative group">
                        {/* Node circle */}
                        <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        </div>

                        <div className="space-y-3">
                          <span className="inline-block rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400 font-mono">
                            {edu.year}
                          </span>

                          <div>
                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {edu.degree}
                            </h4>
                            <p className="text-sm text-slate-400 font-medium">
                              {edu.school}
                            </p>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SKILLS SECTION */}
        {/* ========================================================================= */}
        <section id="skills" className="py-20 md:py-28 border-t border-white/5 bg-slate-950/10">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <ScrollReveal variant="fadeInUp">
              <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/15 px-3 py-1 rounded-full">
                  Arsenal
                </span>
                <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Technical Expertise
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  Programming languages, frameworks, systems, and tools I build with.
                </p>
              </div>
            </ScrollReveal>

            {/* Skills Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <ScrollReveal key={idx} variant="fadeInUp" delay={idx * 100}>
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 h-full">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono font-extrabold text-cyan-400 uppercase tracking-widest">
                        {cat}
                      </span>
                      <h3 className="font-syne text-lg font-bold text-white">
                        {cat === "Backend" ? "Server & Logic Structures" :
                          cat === "Frontend" ? "User Interface Systems" :
                            cat === "Database" ? "Data Storage & Relational Design" :
                              cat === "Tools" ? "Development Utilities" : "Core Competencies"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {skills.filter(s => s.category === cat).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center rounded-xl bg-white/5 hover:bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/20 transition-all duration-300 cursor-default"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE 3D ROBOT CENTERPIECE SECTION */}
        {/* ========================================================================= */}
        <section id="workspace" className="py-20 md:py-28 border-t border-white/5 bg-slate-950/5">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <ScrollReveal variant="fadeInUp">
              <div className="text-center space-y-3 max-w-4xl mx-auto mb-16">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/15 px-3 py-1 rounded-full">
                  Interactive Centerpiece
                </span>
                <h2 className="font-syne text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white whitespace-nowrap">
                  3D Robot Companion
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  Explore an interactive 3D robot companion that tracks your cursor and responds to user interaction.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="zoomIn" delay={150}>
              <div className="max-w-5xl mx-auto w-full h-[460px] sm:h-[500px] lg:h-[540px] relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950/40 shadow-2xl group">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 border border-cyan-500/30 rounded-full px-3 py-1 text-[9px] font-mono text-cyan-300 font-bold pointer-events-none uppercase backdrop-blur-md shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  3D ROBOT // LIVE
                </div>

                <iframe
                  src="https://my.spline.design/r4xbotlet39sworktogetherversion-jdIpYzWb4LqQdvkLbeG64nuy/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 pointer-events-auto"
                  title="3D Robot Companion"
                />

                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 text-[9px] text-cyan-300 font-mono font-bold tracking-wider pointer-events-none uppercase bg-slate-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                  <span>Hover & Move Cursor Across Screen</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CONTACT SECTION */}
        {/* ========================================================================= */}
        <section id="contact" className="py-20 md:py-28 border-t border-white/5">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <ScrollReveal variant="fadeInUp">
              <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/15 px-3 py-1 rounded-full">
                  Connect
                </span>
                <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Sync Connection
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  Have an opportunity, project inquiry, or discussion? Send a direct transmission to my terminal.
                </p>
              </div>
            </ScrollReveal>

            {/* Content Grid: Clean 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">

              {/* Left Column: Terminal Info Card */}
              <div className="lg:col-span-5 flex flex-col justify-between glass-card p-8 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono font-bold uppercase tracking-wider mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    DIRECT TERMINAL SYNC
                  </div>
                  <h3 className="font-syne text-2xl font-bold text-white tracking-tight">
                    Let's Connect
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Available for software engineering roles, full-stack internships, and technical collaborations.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3.5 text-slate-300">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 flex-shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono font-semibold uppercase leading-none mb-1">E-Mail Address</div>
                      <a href={`mailto:${profile.email}`} className="text-sm font-semibold hover:text-cyan-400 transition-colors">
                        {profile.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 text-slate-300">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 flex-shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono font-semibold uppercase leading-none mb-1">Base Location</div>
                      <div className="text-sm font-semibold">Quezon City, Metro Manila, Philippines</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 text-slate-300">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 flex-shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono font-semibold uppercase leading-none mb-1">Local Coordinates</div>
                      <div className="text-sm font-semibold text-cyan-300">Manila (GMT+8) • {timeStr || "--:--"}</div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold font-mono shadow-sm"
                    >
                      <GithubIcon className="w-4 h-4 fill-current" />
                      <span>GITHUB</span>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold font-mono shadow-sm"
                    >
                      <LinkedinIcon className="w-4 h-4 fill-current" />
                      <span>LINKEDIN</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Contact form */}
              <form onSubmit={handleContactSubmit} className="lg:col-span-7 flex flex-col justify-between glass-card p-8 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl space-y-6">
                <div>
                  <h3 className="font-syne text-xl font-bold text-white">
                    Send Transmission
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-1 uppercase">
                    Direct Terminal Message
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Transmission Details</label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Enter project specifications or inquiries here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 resize-none"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Transmission</span>
                      </>
                    )}
                  </button>

                  {successMessage && (
                    <p className="text-xs text-emerald-400 text-center font-mono animate-fadeIn">
                      {successMessage}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Footer info branding */}
        <footer className="py-8 border-t border-white/5 bg-slate-950/20 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <span>© 2026 {profile.name} // ALL SYSTEM NODE RIGHTS RESERVED</span>
            <span>BUILT WITH NEXT.JS & SUPABASE</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
