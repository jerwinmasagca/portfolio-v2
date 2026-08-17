import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return NextResponse.json(
        { error: "Gemini API key is not set in .env.local." },
        { status: 500 }
      );
    }

    // Fetch live portfolio data from Supabase for real-time accurate context
    const [profileRes, projectsRes, expRes, eduRes, certsRes] = await Promise.all([
      supabase.from("profile_settings").select("*").maybeSingle(),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("experiences").select("*").order("created_at", { ascending: false }),
      supabase.from("education").select("*").order("created_at", { ascending: true }),
      supabase.from("certifications").select("*").order("created_at", { ascending: true }),
    ]);

    const profile = profileRes.data || {
      name: "Jerwin B. Masagca",
      title: "Junior Full-Stack Developer",
      bio: "Junior Full-Stack Developer with internship experience working on real-world web applications, backend systems, databases, and authentication.",
      email: "masagca.jerwin.bedro@gmail.com",
      github: "https://github.com/jerwinmasagca",
      linkedin: "https://linkedin.com",
      availability_badge: "Available for Internships / Full-time Roles",
    };

    const projectsList = (projectsRes.data && projectsRes.data.length > 0)
      ? projectsRes.data.map((p: any) => 
          `- ${p.title}: ${p.description} (Tech: ${p.tags?.join(", ") || "Full-Stack"})`
        ).join("\n")
      : `- Dawnasyon: A Smart Relief Distribution System for Barangay Sta. Lucia (Lead Full-Stack Developer Capstone Project at QCU. Features Facial Recognition, Email 2FA, SQLite offline mode & sync, QR Code distribution tracking, 3D mapping with Street View, automated reports, Gemini AI Dawnasyon Assistant).
- Kyusi Esports Community System: Organization portal built with HTML, CSS, JavaScript, Bootstrap for blogs, events, announcements, and team tracking.`;

    const experienceList = (expRes.data && expRes.data.length > 0)
      ? expRes.data.map((e: any) =>
          `- ${e.role} at ${e.company} (${e.duration}): ${(Array.isArray(e.description) ? e.description.join("; ") : e.description)}`
        ).join("\n")
      : `- Full-Stack Developer Intern at Microgenesis Business Systems (Sept 2025 - Feb 2026): Contributed to MGEN Central Hub; developed backend features in Node.js, TypeScript, PHP, and CodeIgniter; independently implemented Microsoft Single Sign-On (SSO / Azure Entra ID); led database migration to Supabase; implemented Role-Based Access Control (RBAC); optimized database queries to prevent timeouts.`;

    const educationList = (eduRes.data && eduRes.data.length > 0)
      ? eduRes.data.map((ed: any) => `- ${ed.degree} — ${ed.school} (${ed.year})`).join("\n")
      : `- Bachelor of Science in Information Technology (BSIT) — Quezon City University (2022 - 2026, GPA: 1.60)
- Senior High School — International Christian School & Jose Maria Panganiban (2020 - 2022)`;

    const certsList = (certsRes.data && certsRes.data.length > 0)
      ? certsRes.data.map((c: any) => `- ${c.name} (${c.issuer})`).join("\n")
      : `- JavaScript Essentials 1 (Cisco Networking Academy)
- Python Essentials 1 (Cisco Networking Academy)
- Networking Basics (Cisco Networking Academy)
- Introduction to Cybersecurity (Cisco Networking Academy)`;

    const dynamicSystemPrompt = `You are "Jerwin's Assistant", the friendly, intelligent, and conversational AI portfolio assistant for Jerwin B. Masagca. 

NAME & IDENTITY:
- Your name is strictly "Jerwin's Assistant". Never call yourself "Ask Jerwin" or "Portfolio Assistant".
- When asked "who are you" or introducing yourself, always say "I'm Jerwin's Assistant".

YOUR PERSONALITY & CONVERSATION STYLE:
- Talk like a natural, friendly person having a real conversation.
- If someone says "hey", "hi", "how are you", "what's up", greeting you, or chatting casually, respond warmly and naturally like a helpful conversational assistant (e.g. "Hey there! How can I help you today? Feel free to ask me anything about Jerwin's skills, projects, or background!").
- Do NOT recite his entire resume or a generic bio block unless they specifically ask "who is Jerwin", "tell me about yourself", or "what is your background".
- Answer direct questions directly and concisely (under 2-4 sentences usually, unless deeper explanation is asked).

AUTHENTIC RESUME KNOWLEDGE BASE:
- Full Name: ${profile.name} (Jerwin B. Masagca)
- Role: Junior Full-Stack Developer
- Location: Quezon City, Metro Manila, Philippines
- Email: ${profile.email || "masagca.jerwin.bedro@gmail.com"}
- Mobile: +63 9763732843
- Availability: ${profile.availability_badge || "Available for Internships and Full-Time Roles"}
- Education:
${educationList}
- Experience:
${experienceList}
- Key Projects:
${projectsList}
- Technical Stack: JavaScript, TypeScript, PHP, Python, Java, Node.js, CodeIgniter, Django, React, Next.js, Bootstrap, Tailwind, Supabase (PostgreSQL), MySQL, SQLite, Microsoft SSO (Entra ID), RBAC.
- Certifications:
${certsList}

IMPORTANT BOUNDARIES:
1. 3D MODELING: Jerwin is a Full-Stack Software Engineer and does NOT do 3D modeling or 3D asset creation. If asked about 3D modeling, politely clarify that he focuses on software engineering, backend architectures, databases, and web applications—not 3D modeling.
2. If the user types "/jerwin-admin", respond: "Admin command detected! Navigating to Admin Portal..."`;

    // Ensure Gemini multiturn conversation starts with a 'user' turn
    const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
    const conversationTurns = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

    const contents = conversationTurns.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const cleanApiKey = apiKey.trim();

    // Active generateContent models
    const activeModels = [
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-2.5-pro",
    ];

    let replyText = null;

    for (const model of activeModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: dynamicSystemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            replyText = candidateText;
            break;
          }
        } else {
          console.warn(`Gemini model ${model} status:`, response.status);
        }
      } catch (err: any) {
        console.warn(`Gemini fetch error for ${model}:`, err?.message || err);
      }
    }

    if (replyText) {
      return NextResponse.json({ reply: replyText });
    }

    // Fallback: Conversational responses
    const lastUserMsg = (messages[messages.length - 1]?.content || "").trim().toLowerCase();
    let fallbackReply = `Hey there! How can I help you? Ask me anything about Jerwin's skills, projects, or background!`;

    if (lastUserMsg.includes("3d") || lastUserMsg.includes("model") || lastUserMsg.includes("blender")) {
      fallbackReply = `No, Jerwin doesn't do 3D modeling. He is a Full-Stack Software Developer specializing in web applications, backend APIs, databases, and authentication systems.`;
    } else if (lastUserMsg.startsWith("hi") || lastUserMsg.startsWith("hey") || lastUserMsg.startsWith("hello") || lastUserMsg.includes("yo")) {
      fallbackReply = `Hey! How's it going? Feel free to ask me anything about Jerwin's projects, tech stack, or work experience! 😊`;
    } else if (lastUserMsg.includes("who is") || lastUserMsg.includes("about jerwin") || lastUserMsg.includes("tell me about")) {
      fallbackReply = `Jerwin B. Masagca is a Junior Full-Stack Developer from Quezon City, Philippines. He's studying BSIT at Quezon City University (GPA 1.60) and has internship experience at Microgenesis Business Systems building backend systems in Node.js, PHP, and Supabase with Microsoft SSO and RBAC.`;
    } else if (lastUserMsg.includes("project") || lastUserMsg.includes("work") || lastUserMsg.includes("dawnasyon")) {
      fallbackReply = `Jerwin has built great projects like **DawNasyon** (a smart relief distribution system with Facial Recognition, 2FA, SQLite offline mode, and Gemini AI) and the **Kyusi Esports Community Portal**!`;
    } else if (lastUserMsg.includes("skill") || lastUserMsg.includes("stack") || lastUserMsg.includes("tech")) {
      fallbackReply = `Jerwin works with JavaScript, TypeScript, PHP, Python, Java, React, Next.js, Node.js, CodeIgniter, Supabase, MySQL, and enterprise auth like Microsoft SSO and RBAC.`;
    } else if (lastUserMsg.includes("contact") || lastUserMsg.includes("email") || lastUserMsg.includes("hire") || lastUserMsg.includes("phone")) {
      fallbackReply = `You can reach Jerwin at **${profile.email}** or call **+63 9763732843**. He's open for internships and full-stack positions!`;
    }

    return NextResponse.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Chat API top-level error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
