"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SECRET_COMMAND = "/jerwin-admin";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Jerwin's AI assistant.\nAsk me about his skills, projects, experience, or background. 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isSleeping = !isOpen && !isHovered && !isWaking;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (!isHovered && !isOpen) {
      setIsWaking(true);
      setTimeout(() => setIsWaking(false), 700);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      setIsWaking(true);
      setTimeout(() => setIsWaking(false), 700);
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Secret command check
    if (trimmed.toLowerCase() === SECRET_COMMAND) {
      setInput("");
      router.push("/admin");
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role === "user" || m.role === "assistant"),
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Container */}
      <div className="fixed bottom-6 right-6 z-[60] flex items-center justify-center">
        {/* Floating Zzz Particles when Sleeping */}
        {isSleeping && (
          <div className="absolute -top-7 -left-1 pointer-events-none select-none font-mono font-black text-cyan-300">
            <span className="absolute text-[10px] animate-zzz-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">z</span>
            <span className="absolute text-[13px] animate-zzz-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]">z</span>
            <span className="absolute text-[17px] animate-zzz-3 drop-shadow-[0_0_14px_rgba(6,182,212,1)]">Z</span>
          </div>
        )}

        {/* Wake-Up Ripple Shockwave */}
        {isWaking && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-wake-shockwave pointer-events-none" />
        )}

        {/* Main Floating Button */}
        <button
          onClick={handleButtonClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? "bg-slate-800 text-slate-300 rotate-0 hover:scale-105"
              : isWaking
              ? "bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white animate-bot-wake shadow-[0_0_35px_rgba(6,182,212,0.7)]"
              : isSleeping
              ? "bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-cyan-400 border border-cyan-500/40 animate-bot-sleep"
              : "bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-110"
          }`}
          title={isOpen ? "Close chat" : isSleeping ? "Sleeping AI Assistant (Click or hover to wake up)" : "Jerwin's Assistant"}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : isSleeping ? (
            /* Sleeping Bot Face Icon */
            <svg viewBox="0 0 36 36" className="w-7 h-7 transition-all duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Antenna */}
              <line x1="18" y1="4" x2="18" y2="8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="4" r="2" fill="#38bdf8" />
              {/* Head */}
              <rect x="5" y="8" width="26" height="22" rx="7" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
              {/* Screen / Visor */}
              <rect x="8" y="12" width="20" height="14" rx="4" fill="#020617" />
              {/* Sleepy Closed Curved Eyes */}
              <path d="M11 18.5 Q14 21 17 18.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M19 18.5 Q22 21 25 18.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          ) : (
            /* Awake Smiling Bot Face Icon */
            <svg viewBox="0 0 36 36" className="w-7 h-7 transition-all duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Antenna with energetic glowing tip */}
              <line x1="18" y1="4" x2="18" y2="8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="4" r="2.5" fill="#38bdf8" />
              {/* Head */}
              <rect x="5" y="8" width="26" height="22" rx="7" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              {/* Screen / Visor */}
              <rect x="8" y="12" width="20" height="14" rx="4" fill="#020617" />
              {/* Awake Shiny Eyes */}
              <circle cx="13.5" cy="18" r="2.5" fill="#38bdf8" />
              <circle cx="14.2" cy="17.2" r="0.9" fill="#ffffff" />
              <circle cx="22.5" cy="18" r="2.5" fill="#38bdf8" />
              <circle cx="23.2" cy="17.2" r="0.9" fill="#ffffff" />
              {/* Happy Smile */}
              <path d="M15 22.5 Q18 24.5 21 22.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-[60] w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto translate-y-0"
            : "scale-90 opacity-0 pointer-events-none translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 rounded-t-2xl bg-gradient-to-r from-cyan-500/10 to-sky-500/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white leading-tight">Jerwin&apos;s Assistant</p>
            <p className="text-[10px] font-mono text-cyan-400 tracking-wider">POWERED BY GEMINI FLASH</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] max-h-[340px] scrollbar-thin">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-sky-600/20 text-sky-400"
                    : "bg-cyan-500/15 text-cyan-400"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-sky-600/20 text-sky-100 rounded-tr-md"
                    : "bg-white/5 text-slate-300 rounded-tl-md border border-white/5"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-cyan-500/15 text-cyan-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/30 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Jerwin..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none py-1.5"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
