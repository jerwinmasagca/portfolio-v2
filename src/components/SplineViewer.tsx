"use client";

import React, { useState, useEffect } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          url?: string;
          className?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface SplineViewerProps {
  sceneUrl?: string;
  fullScreen?: boolean;
  scale?: number;
}

export default function SplineViewer({
  sceneUrl = "https://my.spline.design/roomrelaxingcopy-dNXtjCuu7tPa7pG8yhZ5X4ct/",
  fullScreen = false,
  scale,
}: SplineViewerProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isIframe = !sceneUrl.endsWith(".splinecode");

  useEffect(() => {
    if (isIframe) return;

    // If the custom element is already registered (e.g. from hot-reloading), set loaded immediately
    if (typeof window !== "undefined" && window.customElements && window.customElements.get("spline-viewer")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@splinetool/viewer@1.12.97/build/spline-viewer.js";
    script.type = "module";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("Failed to load Spline script");
    document.body.appendChild(script);
  }, [sceneUrl, isIframe]);

  const wrapperClass = fullScreen
    ? "relative w-full h-full overflow-hidden flex items-center justify-center"
    : "relative w-full h-[500px] md:h-[650px] rounded-3xl overflow-hidden glass border border-white/10 flex items-center justify-center";

  const elementClass = fullScreen ? "w-full h-full border-0" : "w-full h-full border-0 rounded-3xl";

  return (
    <div className={wrapperClass}>
      {isIframe ? (
        <iframe
          src={sceneUrl}
          className={elementClass}
          style={scale ? { transform: `scale(${scale})`, transformOrigin: "center" } : undefined}
          allow="autoplay; fullscreen; vr"
          loading="lazy"
        />
      ) : (
        <>
          {/* Loading state spinner until the script is ready */}
          {!scriptLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-400 font-medium tracking-wider uppercase font-syne">
                Initializing 3D Space...
              </p>
            </div>
          )}

          {/* Actual Spline 3D Scene using Native Web Component */}
          <spline-viewer
            url={sceneUrl}
            className="w-full h-full object-cover"
          />
        </>
      )}
    </div>
  );
}
