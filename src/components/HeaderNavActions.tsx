"use client";

import React, { useEffect, useState } from "react";
import { GithubIcon, LinkedinIcon } from "@/components/BrandIcons";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HeaderNavActions() {
  const [resumeUrl, setResumeUrl] = useState<string>("https://srlbrzvdhxigwytveqdh.supabase.co/storage/v1/object/public/portfolio/uploads/b8il1h0bz1r.pdf");
  const [githubUrl, setGithubUrl] = useState<string>("https://github.com/jerwinmasagca");
  const [linkedinUrl, setLinkedinUrl] = useState<string>("https://linkedin.com");

  const fetchProfileSettings = async () => {
    try {
      // 1. Check local storage if in simulator or fallback
      const simProfileStr = typeof window !== "undefined" ? localStorage.getItem("sim_profile") : null;
      if (simProfileStr) {
        try {
          const parsed = JSON.parse(simProfileStr);
          if (parsed.resume_url) setResumeUrl(parsed.resume_url);
          if (parsed.github) setGithubUrl(parsed.github);
          if (parsed.linkedin) setLinkedinUrl(parsed.linkedin);
        } catch (e) {
          console.warn("Could not parse sim_profile", e);
        }
      }

      // 2. Fetch from Supabase
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
      console.warn("Could not fetch profile settings for navbar:", err);
    }
  };

  useEffect(() => {
    fetchProfileSettings();

    // Listen for storage events (e.g. if updated in admin tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sim_profile") {
        fetchProfileSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCvClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!resumeUrl) {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
      alert("No resume PDF has been uploaded yet. Please upload your resume in the Admin Portal (Profile Info > Resume PDF Upload).");
      return;
    }

    if (resumeUrl.startsWith("data:")) {
      try {
        const parts = resumeUrl.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "application/pdf";
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        return;
      } catch (err) {
        console.error("Error opening base64 resume:", err);
      }
    }

    // Direct HTTP/HTTPS or relative URL
    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2 rounded-full p-1.5 px-2 border border-white/10 bg-slate-950/70 backdrop-blur-md shadow-xl">
      <a
        href={githubUrl || "https://github.com/jerwinmasagca"}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
        title="GitHub Profile"
      >
        <GithubIcon className="w-4 h-4 fill-current" />
      </a>
      <a
        href={linkedinUrl || "https://linkedin.com"}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
        title="LinkedIn Profile"
      >
        <LinkedinIcon className="w-4 h-4 fill-current" />
      </a>
      <button
        type="button"
        onClick={handleCvClick}
        className="px-3 py-1.5 rounded-full text-xs font-mono font-bold text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all flex items-center gap-1.5 border border-transparent hover:border-cyan-500/20 cursor-pointer"
        title="Hire / Resume"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>CV</span>
      </button>
    </div>
  );
}
