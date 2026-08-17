"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { Project, ProfileSettings, Experience, Education, Certification, Skill, supabase } from "@/lib/supabase";
import {
  Plus, Trash2, Globe, AlertTriangle, CheckCircle, Database,
  Upload, User, Briefcase, FileText, Link, Mail, Award, BookOpen, Key, Loader2, Edit2, X
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/BrandIcons";

type TabType = "projects" | "profile" | "experience" | "education" | "skills" | "certifications" | "messages";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Authentication & session state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSimulatedLoggedIn, setIsSimulatedLoggedIn] = useState(false);

  const isDatabaseActive = dbStatus === "connected" && !isSimulatedLoggedIn;

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);

  // Data lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // 1. Projects form state
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    image_url: "",
    video_url: "",
    project_url: "",
    github_url: "",
    tags: "",
  });

  // 2. Profile Settings form state
  const [profileForm, setProfileForm] = useState<ProfileSettings>({
    name: "",
    title: "",
    bio: "",
    availability_badge: "Available for Internships",
    spline_url: "",
    resume_url: "",
    avatar_url: "",
    github: "",
    linkedin: "",
    email: "",
  });

  // 3. Experience form state
  const [experienceForm, setExperienceForm] = useState({
    role: "",
    company: "",
    duration: "",
    descriptionLines: "",
  });

  // 4. Education form state
  const [educationForm, setEducationForm] = useState({
    school: "",
    degree: "",
    year: "",
  });

  // 5. Skills form state
  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "Backend", // Backend, Frontend, Database, Tools, General
  });

  // 6. Certifications form state
  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
  });

  // Editing state for projects, experience, and education
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);

  // Cropping Modal states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropTargetField, setCropTargetField] = useState<"image_url" | "avatar_url">("avatar_url");
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const router = useRouter();

  // Verify database connection & check auth session
  useEffect(() => {
    async function checkConnection() {
      try {
        // Direct URL protection: Only allow entry if triggered from secret chatbot command or existing valid session
        const hasChatbotKey = typeof window !== "undefined" && sessionStorage.getItem("admin_portal_access") === "unlocked";
        const wasSimLoggedIn = typeof window !== "undefined" && localStorage.getItem("sim_logged_in") === "true";

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (!hasChatbotKey && !currentSession && !wasSimLoggedIn) {
          router.replace("/");
          return;
        }

        const { error } = await supabase.from("projects").select("id").limit(1);
        if (error) throw error;
        setDbStatus("connected");

        // Check if we were previously logged in via simulator
        if (wasSimLoggedIn) {
          setIsSimulatedLoggedIn(true);
          loadSimulatedData();
        } else if (currentSession) {
          await fetchDatabaseData();
        }
      } catch (err) {
        console.warn("Database connection could not be verified. Showing simulator mode.", err);
        setDbStatus("disconnected");
        // In simulator mode, check if we were previously logged in
        const wasSimLoggedIn = typeof window !== "undefined" && localStorage.getItem("sim_logged_in") === "true";
        if (wasSimLoggedIn) {
          setIsSimulatedLoggedIn(true);
          loadSimulatedData();
        }
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    }

    checkConnection();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchDatabaseData();
      } else {
        // Reset state on sign out
        setProjects([]);
        setExperiences([]);
        setEducationList([]);
        setSkills([]);
        setCertifications([]);
        setMessages([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Monitor simulated logged in state
  useEffect(() => {
    if (isSimulatedLoggedIn) {
      localStorage.setItem("sim_logged_in", "true");
      loadSimulatedData();
    } else {
      localStorage.setItem("sim_logged_in", "false");
    }
  }, [isSimulatedLoggedIn]);

  // Fetch all details from Supabase database
  const fetchDatabaseData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profile_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (profileData) {
        setProfileForm({
          name: profileData.name || "",
          title: profileData.title || "",
          bio: profileData.bio || "",
          spline_url: profileData.spline_url || "",
          resume_url: profileData.resume_url || "",
          avatar_url: profileData.avatar_url || "",
          github: profileData.github || "",
          linkedin: profileData.linkedin || "",
          email: profileData.email || "",
        });
      }

      const { data: projectsData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      setProjects(projectsData || []);

      const { data: expData } = await supabase.from("experiences").select("*").order("created_at", { ascending: false });
      setExperiences(expData || []);

      const { data: eduData } = await supabase.from("education").select("*").order("created_at", { ascending: false });
      setEducationList(eduData || []);

      const { data: skillsData } = await supabase.from("skills").select("*").order("created_at", { ascending: false });
      setSkills(skillsData || []);

      const { data: certsData } = await supabase.from("certifications").select("*").order("created_at", { ascending: false });
      setCertifications(certsData || []);

      const { data: messagesData } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
      setMessages(messagesData || []);
    } catch (err: any) {
      console.error("Failed to load DB details:", err);
      setError(`Data fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch local storage mock data if offline
  const loadSimulatedData = () => {
    const localProj = localStorage.getItem("sim_projects");
    if (localProj) setProjects(JSON.parse(localProj));
    const localExp = localStorage.getItem("sim_experiences");
    if (localExp) setExperiences(JSON.parse(localExp));
    const localEdu = localStorage.getItem("sim_education");
    if (localEdu) setEducationList(JSON.parse(localEdu));
    const localSkills = localStorage.getItem("sim_skills");
    if (localSkills) setSkills(JSON.parse(localSkills));
    const localCerts = localStorage.getItem("sim_certs");
    if (localCerts) setCertifications(JSON.parse(localCerts));
    const localMessages = localStorage.getItem("sim_contacts");
    if (localMessages) setMessages(JSON.parse(localMessages));

    const localProfile = localStorage.getItem("sim_profile");
    if (localProfile) setProfileForm(JSON.parse(localProfile));
  };

  // Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (dbStatus === "connected") {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) throw loginErr;
        setIsSimulatedLoggedIn(false);
        localStorage.removeItem("sim_logged_in");
        setSuccess("Signed in successfully!");
      } else {
        throw new Error("Database is not connected. Authentication is unavailable.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setSuccess("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_portal_access");
      localStorage.removeItem("sim_logged_in");
    }
    setIsSimulatedLoggedIn(false);
    try {
      if (dbStatus === "connected") {
        await supabase.auth.signOut();
      }
      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Sign out failed");
      router.replace("/");
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;
    setError("");
    setSuccess("");

    if (isDatabaseActive) {
      try {
        const { error: delErr } = await supabase.from("contacts").delete().eq("id", id);
        if (delErr) throw delErr;
        setMessages(messages.filter((msg) => msg.id !== id));
        setSuccess("Message deleted successfully!");
      } catch (err: any) {
        setError(err.message || err);
      }
    } else {
      const updated = messages.filter((msg) => msg.id !== id);
      setMessages(updated);
      localStorage.setItem("sim_contacts", JSON.stringify(updated));
      setSuccess("Message deleted (Local Simulator)!");
    }
  };

  // 1. Triggered when user selects a file for profile photo or project image
  const handleImageCropSelect = (e: React.ChangeEvent<HTMLInputElement>, targetField: "image_url" | "avatar_url" = "image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCropTargetField(targetField);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropModalOpen(true);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageCropSelect(e, "avatar_url");
  };

  // 2. Drag & Drop / Pan events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 3. Touch panning (Mobile/Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  // 4. Save cropped image and upload
  const handleCropSave = () => {
    setUploading(true);
    setError("");
    setSuccess("");

    const isWidescreen = cropTargetField === "image_url";
    const outWidth = isWidescreen ? 800 : 400;
    const outHeight = isWidescreen ? 450 : 400;
    const cropBoxWidth = isWidescreen ? 320 : 200;
    const cropBoxHeight = isWidescreen ? 180 : 200;
    const containerWidth = 340;
    const containerHeight = isWidescreen ? 240 : 300;

    const img = new Image();
    img.src = cropImageSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = outWidth;
        canvas.height = outHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not initialize canvas context.");
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill background
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, outWidth, outHeight);

        // Aspect ratio calculations for displayed image size
        let displayWidth = containerWidth;
        let displayHeight = containerHeight;
        const imgRatio = img.width / img.height;
        const containerRatio = containerWidth / containerHeight;

        if (imgRatio > containerRatio) {
          displayWidth = containerWidth;
          displayHeight = containerWidth / imgRatio;
        } else {
          displayWidth = containerHeight * imgRatio;
          displayHeight = containerHeight;
        }

        const scaleFactor = outWidth / cropBoxWidth;

        ctx.save();
        ctx.scale(scaleFactor, scaleFactor);
        ctx.translate(-(containerWidth - cropBoxWidth) / 2, -(containerHeight - cropBoxHeight) / 2);
        ctx.translate(containerWidth / 2 + pan.x, containerHeight / 2 + pan.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
        ctx.restore();

        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = isWidescreen ? "thumbnail.jpg" : "avatar.jpg";
            const croppedFile = new File([blob], fileName, { type: "image/jpeg" });
            uploadCroppedFile(croppedFile, cropTargetField);
          } else {
            setError("Failed to generate cropped image blob.");
            setUploading(false);
          }
        }, "image/jpeg", 0.92);
      } catch (err: any) {
        setError(`Crop failed: ${err.message || err}`);
        setUploading(false);
      }
    };
    img.onerror = () => {
      setError("Failed to load preview image for cropping.");
      setUploading(false);
    };
  };

  const uploadCroppedFile = async (file: File, field: "image_url" | "avatar_url") => {
    const mockEvent = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await handleFileUpload(mockEvent, field);
    setIsCropModalOpen(false);
  };

  // Upload to Supabase Storage (or read as base64 in simulator mode)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "image_url" | "video_url" | "resume_url" | "avatar_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadingField(targetField);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadProgress(`Uploading ${file.name} (${fileSizeMB} MB)...`);
    setError("");
    setSuccess("");

    if (isSimulatedLoggedIn) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultUrl = reader.result as string;
          if (targetField === "image_url") {
            setProjectForm((prev) => ({ ...prev, image_url: resultUrl }));
          } else if (targetField === "video_url") {
            setProjectForm((prev) => ({ ...prev, video_url: resultUrl }));
          } else if (targetField === "avatar_url") {
            setProfileForm((prev) => ({ ...prev, avatar_url: resultUrl }));
          } else {
            setProfileForm((prev) => ({ ...prev, resume_url: resultUrl }));
          }
          setSuccess("File loaded successfully (Local Simulator)!");
          setUploading(false);
          setUploadingField(null);
          setUploadProgress("");
        };
        reader.onerror = () => {
          throw new Error("Failed to read file.");
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setError(`Upload failed: ${err.message || err}`);
        setUploading(false);
        setUploadingField(null);
        setUploadProgress("");
      }
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const res = supabase.storage.from("portfolio").getPublicUrl(filePath);
      const url = res.data?.publicUrl || (res as any).publicURL || (res.data as any)?.publicURL || "";

      console.log("File uploaded successfully. Target field:", targetField, "Public URL:", url);

      if (targetField === "image_url") {
        setProjectForm((prev) => ({ ...prev, image_url: url }));
      } else if (targetField === "video_url") {
        setProjectForm((prev) => ({ ...prev, video_url: url }));
      } else if (targetField === "avatar_url") {
        setProfileForm((prev) => ({ ...prev, avatar_url: url }));
      } else {
        setProfileForm((prev) => ({ ...prev, resume_url: url }));
      }
      setSuccess("File uploaded successfully! Click 'Add Project' or 'Save Settings' to save.");
    } catch (err: any) {
      console.error("Upload handler error:", err);
      if (err.message && err.message.includes("exceeded the maximum allowed size")) {
        setError("File is too large for your Supabase bucket limit. Please increase the upload limit in your Supabase Dashboard (Storage > portfolio > Edit Bucket > File size limit) or compress the video to under 50MB.");
      } else {
        setError(`Upload failed: ${err.message || err}`);
      }
    } finally {
      setUploading(false);
      setUploadingField(null);
      setUploadProgress("");
    }
  };

  // Edit existing project helper
  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title || "",
      description: p.description || "",
      image_url: p.image_url || "",
      video_url: p.video_url || "",
      project_url: p.project_url || "",
      github_url: p.github_url || "",
      tags: p.tags ? p.tags.join(", ") : "",
    });
    setError("");
    setSuccess(`Editing project: "${p.title}"`);
    // Scroll smoothly to the form
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancelProjectEdit = () => {
    setEditingProjectId(null);
    setProjectForm({ title: "", description: "", image_url: "", video_url: "", project_url: "", github_url: "", tags: "" });
    setSuccess("");
    setError("");
  };

  // 1. Submit or Update project
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const tagsArray = projectForm.tags ? projectForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const projectPayload = {
      title: projectForm.title,
      description: projectForm.description,
      image_url: projectForm.image_url || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      video_url: projectForm.video_url || undefined,
      project_url: projectForm.project_url || undefined,
      github_url: projectForm.github_url || undefined,
      tags: tagsArray,
    };

    if (isDatabaseActive) {
      try {
        if (editingProjectId) {
          // Update existing project
          const { data, error } = await supabase
            .from("projects")
            .update(projectPayload)
            .eq("id", editingProjectId)
            .select();
          if (error) throw error;
          const updatedList = projects.map(p => p.id === editingProjectId ? (data[0] || { ...p, ...projectPayload }) : p);
          setProjects(updatedList);
          setSuccess("Project successfully updated!");
          setEditingProjectId(null);
        } else {
          // Insert new project
          const { data, error } = await supabase.from("projects").insert([projectPayload]).select();
          if (error) throw error;
          setProjects([data[0], ...projects]);
          setSuccess("Project successfully added!");
        }
        setProjectForm({ title: "", description: "", image_url: "", video_url: "", project_url: "", github_url: "", tags: "" });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      if (editingProjectId) {
        const updated = projects.map(p => p.id === editingProjectId ? { ...p, ...projectPayload } : p);
        setProjects(updated);
        localStorage.setItem("sim_projects", JSON.stringify(updated));
        setSuccess("Project updated (Local Simulator)!");
        setEditingProjectId(null);
      } else {
        const simulated: Project = { id: Math.random().toString(), created_at: new Date().toISOString(), ...projectPayload };
        const updated = [simulated, ...projects];
        setProjects(updated);
        localStorage.setItem("sim_projects", JSON.stringify(updated));
        setSuccess("Project added (Local Simulator)!");
      }
      setProjectForm({ title: "", description: "", image_url: "", video_url: "", project_url: "", github_url: "", tags: "" });
      setSaving(false);
    }
  };

  // 2. Submit Profile Settings
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (isDatabaseActive) {
      try {
        const { data: existing } = await supabase.from("profile_settings").select("id").limit(1).maybeSingle();
        let result;
        if (existing) {
          result = await supabase.from("profile_settings").update(profileForm).eq("id", existing.id);
        } else {
          result = await supabase.from("profile_settings").insert([profileForm]);
        }
        if (result.error) throw result.error;
        setSuccess("Profile updated successfully!");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      localStorage.setItem("sim_profile", JSON.stringify(profileForm));
      setSuccess("Profile updated (Local Simulator)!");
      setSaving(false);
    }
  };

  // Edit existing experience helper
  const handleEditExperience = (exp: Experience) => {
    setEditingExperienceId(exp.id || null);
    setExperienceForm({
      role: exp.role || "",
      company: exp.company || "",
      duration: exp.duration || "",
      descriptionLines: exp.description ? exp.description.join("\n") : "",
    });
    setError("");
    setSuccess(`Editing experience: "${exp.role} at ${exp.company}"`);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancelExperienceEdit = () => {
    setEditingExperienceId(null);
    setExperienceForm({ role: "", company: "", duration: "", descriptionLines: "" });
    setSuccess("");
    setError("");
  };

  // Edit existing education helper
  const handleEditEducation = (edu: Education) => {
    setEditingEducationId(edu.id || null);
    setEducationForm({
      school: edu.school || "",
      degree: edu.degree || "",
      year: edu.year || "",
    });
    setError("");
    setSuccess(`Editing education: "${edu.degree} - ${edu.school}"`);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancelEducationEdit = () => {
    setEditingEducationId(null);
    setEducationForm({ school: "", degree: "", year: "" });
    setSuccess("");
    setError("");
  };

  // 3. Submit or Update Experience
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const descList = experienceForm.descriptionLines.split("\n").map(l => l.trim()).filter(Boolean);
    const expPayload = {
      role: experienceForm.role,
      company: experienceForm.company,
      duration: experienceForm.duration,
      description: descList,
    };

    if (isDatabaseActive) {
      try {
        if (editingExperienceId) {
          const { data, error } = await supabase
            .from("experiences")
            .update(expPayload)
            .eq("id", editingExperienceId)
            .select();
          if (error) throw error;
          const updatedList = experiences.map(exp => exp.id === editingExperienceId ? (data[0] || { ...exp, ...expPayload }) : exp);
          setExperiences(updatedList);
          setSuccess("Experience successfully updated!");
          setEditingExperienceId(null);
        } else {
          const { data, error } = await supabase.from("experiences").insert([expPayload]).select();
          if (error) throw error;
          setExperiences([data[0], ...experiences]);
          setSuccess("Experience successfully added!");
        }
        setExperienceForm({ role: "", company: "", duration: "", descriptionLines: "" });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      if (editingExperienceId) {
        const updated = experiences.map(exp => exp.id === editingExperienceId ? { ...exp, ...expPayload } : exp);
        setExperiences(updated);
        localStorage.setItem("sim_experiences", JSON.stringify(updated));
        setSuccess("Experience updated (Local Simulator)!");
        setEditingExperienceId(null);
      } else {
        const simulated = { id: Math.random().toString(), created_at: new Date().toISOString(), ...expPayload };
        const updated = [simulated, ...experiences];
        setExperiences(updated);
        localStorage.setItem("sim_experiences", JSON.stringify(updated));
        setSuccess("Experience added (Local Simulator)!");
      }
      setExperienceForm({ role: "", company: "", duration: "", descriptionLines: "" });
      setSaving(false);
    }
  };

  // 4. Submit or Update Education
  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const eduPayload = {
      school: educationForm.school,
      degree: educationForm.degree,
      year: educationForm.year,
    };

    if (isDatabaseActive) {
      try {
        if (editingEducationId) {
          const { data, error } = await supabase
            .from("education")
            .update(eduPayload)
            .eq("id", editingEducationId)
            .select();
          if (error) throw error;
          const updatedList = educationList.map(edu => edu.id === editingEducationId ? (data[0] || { ...edu, ...eduPayload }) : edu);
          setEducationList(updatedList);
          setSuccess("Education successfully updated!");
          setEditingEducationId(null);
        } else {
          const { data, error } = await supabase.from("education").insert([eduPayload]).select();
          if (error) throw error;
          setEducationList([data[0], ...educationList]);
          setSuccess("Education successfully added!");
        }
        setEducationForm({ school: "", degree: "", year: "" });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      if (editingEducationId) {
        const updated = educationList.map(edu => edu.id === editingEducationId ? { ...edu, ...eduPayload } : edu);
        setEducationList(updated);
        localStorage.setItem("sim_education", JSON.stringify(updated));
        setSuccess("Education updated (Local Simulator)!");
        setEditingEducationId(null);
      } else {
        const simulated = { id: Math.random().toString(), created_at: new Date().toISOString(), ...eduPayload };
        const updated = [simulated, ...educationList];
        setEducationList(updated);
        localStorage.setItem("sim_education", JSON.stringify(updated));
        setSuccess("Education added (Local Simulator)!");
      }
      setEducationForm({ school: "", degree: "", year: "" });
      setSaving(false);
    }
  };

  // 5. Submit Skill
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const newSkill = {
      name: skillForm.name,
      category: skillForm.category,
    };

    if (isDatabaseActive) {
      try {
        const { data, error } = await supabase.from("skills").insert([newSkill]).select();
        if (error) throw error;
        setSkills([data[0], ...skills]);
        setSuccess("Skill successfully added!");
        setSkillForm({ name: "", category: "Backend" });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      const simulated = { id: Math.random().toString(), ...newSkill };
      const updated = [simulated, ...skills];
      setSkills(updated);
      localStorage.setItem("sim_skills", JSON.stringify(updated));
      setSuccess("Skill added (Local Simulator)!");
      setSkillForm({ name: "", category: "Backend" });
      setSaving(false);
    }
  };

  // 6. Submit Certification
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const newCert = {
      name: certForm.name,
      issuer: certForm.issuer,
    };

    if (isDatabaseActive) {
      try {
        const { data, error } = await supabase.from("certifications").insert([newCert]).select();
        if (error) throw error;
        setCertifications([data[0], ...certifications]);
        setSuccess("Certification successfully added!");
        setCertForm({ name: "", issuer: "" });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      const simulated = { id: Math.random().toString(), ...newCert };
      const updated = [simulated, ...certifications];
      setCertifications(updated);
      localStorage.setItem("sim_certs", JSON.stringify(updated));
      setSuccess("Certification added (Local Simulator)!");
      setCertForm({ name: "", issuer: "" });
      setSaving(false);
    }
  };

  // Generic Deletion
  const handleDelete = async (table: string, id: string, setList: any, list: any) => {
    if (!confirm(`Are you sure you want to delete this from ${table}?`)) return;
    setError("");
    setSuccess("");

    if (table === "projects" && editingProjectId === id) handleCancelProjectEdit();
    if (table === "experiences" && editingExperienceId === id) handleCancelExperienceEdit();
    if (table === "education" && editingEducationId === id) handleCancelEducationEdit();

    if (isDatabaseActive) {
      try {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        setList(list.filter((item: any) => item.id !== id));
        setSuccess("Item deleted successfully!");
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      const updated = list.filter((item: any) => item.id !== id);
      setList(updated);
      const storageKey = table === "projects" ? "sim_projects" : `sim_${table}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSuccess("Item deleted (Local Simulator)!");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm animate-pulse font-syne">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const isAuthorized = (dbStatus === "connected" && session) || isSimulatedLoggedIn;

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen bg-[#030712] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 text-white relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="w-full max-w-md space-y-8 glass rounded-3xl p-8 border border-white/5 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
              <Key className="h-6 w-6" />
            </div>
            <h2 className="font-syne text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Admin Portal Access
            </h2>
            <p className="text-sm text-slate-400 text-center">
              {dbStatus === "disconnected"
                ? "Simulator Mode: Use credentials below to test offline."
                : "Sign in with your administrator credentials."}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="login-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Authenticate Portal"
              )}
            </button>
          </form>

          {dbStatus === "disconnected" && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-300 text-xs leading-relaxed text-left space-y-1">
              <strong className="block text-center mb-1">Demo Credentials:</strong>
              <div>Email: <code className="bg-black/30 px-1 py-0.5 rounded font-mono">admin@portfolio.com</code></div>
              <div>Password: <code className="bg-black/30 px-1 py-0.5 rounded font-mono">admin123</code></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white py-10 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mx-auto max-w-7xl">
        {/* Title & Connection Header */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-syne text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-300 text-sm">
              Dynamically edit and manage your portfolio projects, resume elements, and biography.
            </p>
          </div>

        {/* Database connection badge and Logout */}
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          {isSimulatedLoggedIn ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs text-amber-400 font-medium animate-pulse">
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Simulator Mode (Local Storage)
            </span>
          ) : dbStatus === "connected" ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400 font-medium">
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Connected to Supabase
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-500/10 border border-slate-500/30 px-3 py-1 text-xs text-slate-400 font-medium">
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Offline Simulator
            </span>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-400 font-semibold hover:bg-red-500/20 transition-all cursor-pointer animate-fadeIn"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Global Status messages */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium animate-fadeIn">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-medium animate-fadeIn">
          {success}
        </div>
      )}

      {/* Responsive Scrollable Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-white/10 mb-8 space-x-6 pb-2 scrollbar-none">
        {[
          { id: "projects", label: "Projects", icon: Briefcase },
          { id: "profile", label: "Profile Info", icon: User },
          { id: "experience", label: "Experience", icon: FileText },
          { id: "education", label: "Education", icon: BookOpen },
          { id: "skills", label: "Skills", icon: Key },
          { id: "certifications", label: "Certifications", icon: Award },
          { id: "messages", label: "Messages", icon: Mail },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center pb-3 text-sm font-semibold border-b-2 transition-all flex-shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-cyan-400 text-cyan-300 shadow-[0_4px_12px_rgba(6,182,212,0.2)]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PROJECTS */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleProjectSubmit} className="lg:col-span-5 glass rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold text-white">
                {editingProjectId ? "Edit Project" : "Add Project"}
              </h3>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={handleCancelProjectEdit}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
              <input type="text" required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Project title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea required rows={3} value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Description details..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            {/* Thumbnail Image with Crop */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Card Thumbnail Image (16:9)
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">Includes interactive crop tool</span>
              </div>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={projectForm.image_url}
                  onChange={e => setProjectForm({ ...projectForm, image_url: e.target.value })}
                  placeholder="https://... or upload/crop image"
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                />
                <label
                  htmlFor="project-image-crop-upload"
                  className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${uploadingField === "image_url"
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 pointer-events-none"
                      : "bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30 text-indigo-400"
                    }`}
                  title="Upload & Crop Image (16:9 widescreen)"
                >
                  {uploadingField === "image_url" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </label>
                <input
                  id="project-image-crop-upload"
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageCropSelect(e, "image_url")}
                  className="hidden"
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </div>
              {uploadingField === "image_url" && (
                <p className="text-[11px] font-mono text-indigo-400 mt-1 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {uploadProgress || "Uploading image file..."}
                </p>
              )}
            </div>

            {/* Video Demo */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Project Video Demo (Google Drive, YouTube, or MP4)
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={projectForm.video_url}
                  onChange={e => setProjectForm({ ...projectForm, video_url: e.target.value })}
                  placeholder="Paste Google Drive link, YouTube link, or upload MP4"
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                />
                <label
                  htmlFor="project-video-upload"
                  className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${uploadingField === "video_url"
                      ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 pointer-events-none animate-pulse"
                      : "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-400"
                    }`}
                  title="Upload Video File (MP4, WebM)"
                >
                  {uploadingField === "video_url" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </label>
                <input
                  id="project-video-upload"
                  type="file"
                  accept="video/*"
                  onChange={e => handleFileUpload(e, "video_url")}
                  className="hidden"
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </div>
              {uploadingField === "video_url" && (
                <p className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {uploadProgress || "Uploading video to storage... this may take a few seconds."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live URL</label>
                <input type="url" value={projectForm.project_url} onChange={e => setProjectForm({ ...projectForm, project_url: e.target.value })} placeholder="https://" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub URL</label>
                <input type="url" value={projectForm.github_url} onChange={e => setProjectForm({ ...projectForm, github_url: e.target.value })} placeholder="https://" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
              <input type="text" value={projectForm.tags} onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="React, Node.js, Bootstrap" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <button type="submit" disabled={saving || uploading} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
              {editingProjectId ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Save Project Changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Project
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold text-white">Existing Projects</h3>
              <button
                type="button"
                onClick={fetchDatabaseData}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 font-mono transition-all"
              >
                ↻ Refresh DB
              </button>
            </div>
            {loading ? (
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : projects.length === 0 ? (
              <p className="text-center text-slate-500 text-sm">No projects found. Click &apos;Refresh DB&apos; or add a project.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {projects.map((p) => (
                  <div key={p.id} className="py-4 flex justify-between items-center gap-4 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {p.image_url && (p.image_url.toLowerCase().includes(".mp4") || p.image_url.toLowerCase().includes(".webm") || p.image_url.toLowerCase().includes(".mov")) ? (
                        <video
                          src={p.image_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-14 h-10 object-cover rounded-lg border border-white/5 bg-slate-900 flex-shrink-0"
                        />
                      ) : (
                        <img
                          src={p.image_url || "/api/placeholder/600/400"}
                          alt={p.title}
                          className="w-14 h-10 object-cover rounded-lg border border-white/5 bg-slate-900 flex-shrink-0"
                        />
                      )}
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-semibold truncate max-w-xs sm:max-w-sm">{p.title}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{p.tags?.join(", ") || "No tags"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditProject(p)}
                        className={`p-2 rounded-lg transition-all ${editingProjectId === p.id
                            ? "bg-indigo-500 text-white font-bold"
                            : "bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400"
                          }`}
                        title="Edit Project Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("projects", p.id, setProjects, projects)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="glass rounded-3xl p-8 max-w-4xl mx-auto space-y-6">
          <h3 className="font-syne text-xl font-bold text-white mb-2">Edit Profile Info</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Title</label>
              <input type="text" required value={profileForm.title} onChange={e => setProfileForm({ ...profileForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Availability Badge Text
              </label>
              <input 
                type="text" 
                value={profileForm.availability_badge || ""} 
                onChange={e => setProfileForm({ ...profileForm, availability_badge: e.target.value })} 
                placeholder="e.g. Available for Internships / Open to Work" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-xs" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bio / Professional Summary</label>
            <textarea required rows={4} value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={profileForm.email || ""} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub Link</label>
              <input type="url" value={profileForm.github || ""} onChange={e => setProfileForm({ ...profileForm, github: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">LinkedIn Link</label>
              <input type="url" value={profileForm.linkedin || ""} onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Spline Scene Link</label>
              <input type="url" required value={profileForm.spline_url} onChange={e => setProfileForm({ ...profileForm, spline_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resume (PDF Upload)</label>
              <div className="flex gap-4">
                <input type="url" value={profileForm.resume_url || ""} onChange={e => setProfileForm({ ...profileForm, resume_url: e.target.value })} placeholder="Enter resume URL..." className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                <label htmlFor="resume-upload" className="flex items-center justify-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer text-white transition-all">
                  <Upload className="h-5 w-5" />
                </label>
                <input id="resume-upload" type="file" accept=".pdf" onChange={e => handleFileUpload(e, "resume_url")} className="hidden" style={{ display: 'none' }} disabled={uploading} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Profile Photo (Avatar Upload)</label>
              <div className="flex gap-4">
                <input type="url" value={profileForm.avatar_url || ""} onChange={e => setProfileForm({ ...profileForm, avatar_url: e.target.value })} placeholder="Enter image URL..." className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                <label htmlFor="avatar-upload" className="flex items-center justify-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer text-white transition-all">
                  <Upload className="h-5 w-5" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={e => handleAvatarSelect(e)} className="hidden" style={{ display: 'none' }} disabled={uploading} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving || uploading} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" /> Save Settings
          </button>
        </form>
      )}

      {/* TAB CONTENT: EXPERIENCE */}
      {activeTab === "experience" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleExperienceSubmit} className="lg:col-span-5 glass rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold text-white">
                {editingExperienceId ? "Edit Work Experience" : "Add Work Experience"}
              </h3>
              {editingExperienceId && (
                <button
                  type="button"
                  onClick={handleCancelExperienceEdit}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role/Position</label>
              <input type="text" required value={experienceForm.role} onChange={e => setExperienceForm({ ...experienceForm, role: e.target.value })} placeholder="e.g. Full-Stack Developer Intern" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
              <input type="text" required value={experienceForm.company} onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })} placeholder="e.g. MGEN" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
              <input type="text" required value={experienceForm.duration} onChange={e => setExperienceForm({ ...experienceForm, duration: e.target.value })} placeholder="e.g. Sept 2025 - Feb 2026" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descriptions (One bullet point per line)</label>
              <textarea required rows={6} value={experienceForm.descriptionLines} onChange={e => setExperienceForm({ ...experienceForm, descriptionLines: e.target.value })} placeholder="Built authentication flow using SSO...&#10;Led Supabase database migration..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
              {editingExperienceId ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Save Experience Changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Experience
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-3xl p-6 space-y-6">
            <h3 className="font-syne text-xl font-bold text-white">Existing Experiences</h3>
            {loading ? (
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : experiences.length === 0 ? (
              <p className="text-center text-slate-500 text-sm">No experiences found.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="py-4 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold">{exp.role}</h4>
                      <p className="text-xs text-indigo-400 mt-0.5">{exp.company} | {exp.duration}</p>
                      <ul className="text-xs text-slate-500 list-disc pl-4 mt-2 space-y-1">
                        {exp.description.slice(0, 3).map((d, dIdx) => (
                          <li key={dIdx}>{d}</li>
                        ))}
                        {exp.description.length > 3 && <li>...and {exp.description.length - 3} more.</li>}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditExperience(exp)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${editingExperienceId === exp.id
                            ? "bg-indigo-500 text-white font-bold"
                            : "bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400"
                          }`}
                        title="Edit Experience Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("experiences", exp.id!, setExperiences, experiences)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex-shrink-0 cursor-pointer transition-all"
                        title="Delete Experience"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EDUCATION */}
      {activeTab === "education" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleEducationSubmit} className="lg:col-span-5 glass rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold text-white">
                {editingEducationId ? "Edit Education" : "Add Education"}
              </h3>
              {editingEducationId && (
                <button
                  type="button"
                  onClick={handleCancelEducationEdit}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">School</label>
              <input type="text" required value={educationForm.school} onChange={e => setEducationForm({ ...educationForm, school: e.target.value })} placeholder="e.g. Quezon City University" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Degree/Level</label>
              <input type="text" required value={educationForm.degree} onChange={e => setEducationForm({ ...educationForm, degree: e.target.value })} placeholder="e.g. BS in Information Technology" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year / Status</label>
              <input type="text" required value={educationForm.year} onChange={e => setEducationForm({ ...educationForm, year: e.target.value })} placeholder="e.g. Tertiary or 2022" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
              {editingEducationId ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Save Education Changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Education
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-3xl p-6 space-y-6">
            <h3 className="font-syne text-xl font-bold text-white">Existing Education Entries</h3>
            {loading ? (
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : educationList.length === 0 ? (
              <p className="text-center text-slate-500 text-sm">No education history found.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {educationList.map((edu) => (
                  <div key={edu.id} className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold">{edu.degree}</h4>
                      <p className="text-xs text-slate-400 mt-1">{edu.school} | <span className="text-purple-400">{edu.year}</span></p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditEducation(edu)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${editingEducationId === edu.id
                            ? "bg-indigo-500 text-white font-bold"
                            : "bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400"
                          }`}
                        title="Edit Education Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("education", edu.id!, setEducationList, educationList)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex-shrink-0 cursor-pointer transition-all"
                        title="Delete Education"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SKILLS */}
      {activeTab === "skills" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSkillSubmit} className="lg:col-span-5 glass rounded-3xl p-6 space-y-6">
            <h3 className="font-syne text-xl font-bold text-white mb-2">Add Skill</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skill Name</label>
              <input type="text" required value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="e.g. Node.js or Git/GitHub" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select value={skillForm.category} onChange={e => setSkillForm({ ...skillForm, category: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="Database">Database</option>
                <option value="Tools">Tools</option>
                <option value="General">General / Other</option>
              </select>
            </div>

            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add Skill
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-3xl p-6 space-y-6">
            <h3 className="font-syne text-xl font-bold text-white">Skills Matrix</h3>
            {loading ? (
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : skills.length === 0 ? (
              <p className="text-center text-slate-500 text-sm">No skills added.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {Array.from(new Set(skills.map(s => s.category))).map((cat, idx) => (
                  <div key={idx} className="py-4 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{cat}</h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.filter(s => s.category === cat).map((s) => (
                        <div key={s.id} className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 pl-3 pr-1 py-1 text-xs">
                          <span>{s.name}</span>
                          <button onClick={() => handleDelete("skills", s.id!, setSkills, skills)} className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition-colors"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATIONS */}
      {activeTab === "certifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleCertSubmit} className="lg:col-span-5 glass rounded-3xl p-6 space-y-6">
            <h3 className="font-syne text-xl font-bold text-white mb-2">Add Certification</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Certification Name</label>
              <input type="text" required value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} placeholder="e.g. Introduction to Cybersecurity" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issuing Authority</label>
              <input type="text" required value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} placeholder="e.g. Cisco Networking Academy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
            </div>

            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add Certification
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-3xl p-6 space-y-6">
            <h3 className="font-syne text-xl font-bold text-white">Existing Certifications</h3>
            {loading ? (
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : certifications.length === 0 ? (
              <p className="text-center text-slate-500 text-sm">No certifications found.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {certifications.map((cert) => (
                  <div key={cert.id} className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold">{cert.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{cert.issuer}</p>
                    </div>
                    <button onClick={() => handleDelete("certifications", cert.id!, setCertifications, certifications)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MESSAGES */}
      {activeTab === "messages" && (
        <div className="glass rounded-3xl p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="font-syne text-xl font-bold text-white">Inbox Messages ({messages.length})</h3>
              <p className="text-xs text-slate-400 mt-1">Read messages submitted by users via your contact form.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs text-indigo-400 font-medium">
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              {messages.length} Total Messages
            </span>
          </div>

          {loading ? (
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
              <Mail className="h-10 w-10 mx-auto mb-3 text-slate-600 animate-pulse" />
              <span className="block text-slate-400 font-semibold mb-1">Inbox is empty</span>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">When employers or visitors send messages from your home page, they will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.map((msg) => (
                <div key={msg.id} className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{msg.name}</h4>
                        <a href={`mailto:${msg.email}`} className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">{msg.email}</a>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-black/20 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. IMAGE CROPPING MODAL */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn animate-duration-200">
          <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-6">
            <div className="text-center space-y-1">
              <h3 className="font-syne text-xl font-bold text-white">
                {cropTargetField === "image_url" ? "Crop Project Thumbnail (16:9 Widescreen)" : "Crop Profile Picture"}
              </h3>
              <p className="text-xs text-slate-400">
                {cropTargetField === "image_url"
                  ? "Drag to position and use slider to zoom. Fits perfectly on the portfolio card."
                  : "Drag to center your face inside the circle."}
              </p>
            </div>

            {/* Crop Workspace Container */}
            <div
              className={`relative bg-slate-900 overflow-hidden border border-white/5 rounded-2xl mx-auto cursor-grab active:cursor-grabbing select-none ${cropTargetField === "image_url" ? "w-[340px] h-[240px]" : "w-[300px] h-[300px]"
                }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                src={cropImageSrc}
                alt="Crop preview"
                className="absolute origin-center max-w-none max-h-none pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  top: '50%',
                  left: '50%',
                  marginLeft: cropTargetField === "image_url" ? '-170px' : '-150px',
                  marginTop: cropTargetField === "image_url" ? '-120px' : '-150px',
                  width: cropTargetField === "image_url" ? '340px' : '300px',
                  height: cropTargetField === "image_url" ? '240px' : '300px',
                  objectFit: 'contain'
                }}
              />

              {/* Mask Overlay: 16:9 box for projects, circular for avatar */}
              {cropTargetField === "image_url" ? (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[320px] h-[180px] border-2 border-cyan-400 rounded-xl shadow-[0_0_0_9999px_rgba(2,6,23,0.75)]" />
                </div>
              ) : (
                <div className="absolute inset-0 pointer-events-none border-[50px] border-slate-950/70 flex items-center justify-center">
                  <div className="w-[200px] h-[200px] border-2 border-indigo-500 rounded-full shadow-[0_0_0_9999px_rgba(2,2,5,0.7)]" />
                </div>
              )}
            </div>

            {/* Slider Zoom Control */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>ZOOM & FIT</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                disabled={uploading}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600/50 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                ) : (
                  "Crop & Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
