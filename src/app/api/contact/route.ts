import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // 1. Always save to Supabase database first so it shows up in Admin Portal
    const { error: dbError } = await supabase.from("contacts").insert([
      { name, email, message }
    ]);

    if (dbError) {
      console.warn("Supabase contacts insert error:", dbError);
    }

    // 2. Send email notification via Web3Forms
    const accessKey = (process.env.WEB3FORMS_ACCESS_KEY || "").trim();
    let emailSent = false;
    let emailStatusMessage = "";

    if (accessKey && accessKey !== "YOUR_ACCESS_KEY_HERE") {
      try {
        const emailRes = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `🚀 Portfolio Message from ${name}`,
            from_name: name,
            name: name,
            email: email,
            message: message,
          }),
        });

        const emailData = await emailRes.json();
        console.log("Web3Forms email response:", emailData);

        if (emailData.success) {
          emailSent = true;
          emailStatusMessage = "Email delivered successfully via Web3Forms.";
        } else {
          console.warn("Web3Forms error details:", emailData);
          emailStatusMessage = emailData.message || "Web3Forms submission failed.";
        }
      } catch (emailErr) {
        console.error("Web3Forms email dispatch exception:", emailErr);
      }
    }

    // Fallback: FormSubmit
    if (!emailSent) {
      try {
        const fsRes = await fetch("https://formsubmit.co/ajax/masagca.jerwin.bedro@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            _subject: `⚡ Portfolio Transmission from ${name}`,
            _template: "table",
          }),
        });
        const fsData = await fsRes.json();
        console.log("FormSubmit fallback response:", fsData);
        if (fsData.success === "true" || fsData.success === true) {
          emailSent = true;
        }
      } catch (formErr) {
        console.warn("FormSubmit fallback error:", formErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailSent,
      emailStatusMessage,
      message: "Transmission recorded in database and dispatched to email." 
    });
  } catch (error: any) {
    console.error("Contact transmission route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
