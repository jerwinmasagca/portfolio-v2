import React, { useState } from "react";
import { Project } from "@/lib/supabase";
import { ExternalLink, Play, X } from "lucide-react";
import { GithubIcon } from "@/components/BrandIcons";

interface ProjectCardProps {
  project: Project;
}

// Convert Google Drive, YouTube, or raw URLs into embeddable/playable formats
function formatVideoUrl(url?: string): { type: "iframe" | "video" | null; url: string | null } {
  if (!url) return { type: null, url: null };

  const trimmed = url.trim();

  // 1. Google Drive link (e.g., https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
  const gdriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      type: "iframe",
      url: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
    };
  }

  // 2. YouTube links (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "iframe",
      url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`,
    };
  }

  // 3. Vimeo links
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "iframe",
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // 4. Default to standard HTML5 video (Supabase Storage, MP4, WebM, Streamable)
  return {
    type: "video",
    url: trimmed,
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const rawVideo = project.video_url || (
    project.image_url && (
      project.image_url.toLowerCase().includes(".mp4") ||
      project.image_url.toLowerCase().includes(".webm") ||
      project.image_url.toLowerCase().includes(".mov")
    ) ? project.image_url : undefined
  );

  const { type: videoType, url: videoSource } = formatVideoUrl(rawVideo);

  // Fallback image if image_url itself was a video file
  const isImageAVideo = project.image_url && (
    project.image_url.toLowerCase().includes(".mp4") ||
    project.image_url.toLowerCase().includes(".webm") ||
    project.image_url.toLowerCase().includes(".mov")
  );

  const displayImage = !isImageAVideo && project.image_url
    ? project.image_url
    : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800";

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl glass-card h-full">
        {/* Media container */}
        <div className="relative aspect-video w-full overflow-hidden border-b border-white/5 bg-slate-900">
          <img
            src={displayImage}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-syne text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
            {project.title}
          </h3>
          
          <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-grow">
            {project.description}
          </p>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400 border border-cyan-500/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Links */}
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <GithubIcon className="mr-1.5 h-4 w-4" />
                  Source
                </a>
              )}
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>

            {videoSource && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Play Demo
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Video Modal Popup */}
      {isVideoModalOpen && videoSource && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-current" />
                <h3 className="font-syne font-bold text-white text-base sm:text-lg truncate max-w-md sm:max-w-xl">
                  {project.title} — Video Demo
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player (Google Drive / YouTube iframe or native video) */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {videoType === "iframe" ? (
                <iframe
                  src={videoSource}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoSource}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain"
                >
                  <source src={videoSource} type="video/mp4" />
                  <source src={videoSource} type="video/webm" />
                  <source src={videoSource} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Footer with Description */}
            <div className="p-5 border-t border-white/10 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <p className="line-clamp-2 max-w-xl leading-relaxed">{project.description}</p>
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-bold transition-all text-center flex-shrink-0"
                >
                  Visit Live Site →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
