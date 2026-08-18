import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Jerwin Masagca | Full-Stack Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let imageSrc = "";
  try {
    const imagePath = join(process.cwd(), "public", "jerwin_gradpic.JPG");
    const imageBuffer = await readFile(imagePath);
    imageSrc = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  } catch {
    imageSrc = "";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#030712",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
          padding: "60px 70px",
          fontFamily: "sans-serif",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxSizing: "border-box",
        }}
      >
        {/* Left Column: Branding, Title & Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: "600px",
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(6, 182, 212, 0.12)",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              borderRadius: "9999px",
              padding: "8px 18px",
              alignSelf: "flex-start",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 10px #22c55e",
              }}
            />
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#67e8f9",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Available for Opportunities
            </span>
          </div>

          {/* Name */}
          <h1
            style={{
              fontSize: "52px",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: "12px",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Jerwin Masagca
          </h1>

          {/* Subtitle */}
          <h2
            style={{
              fontSize: "26px",
              fontWeight: 700,
              margin: 0,
              marginBottom: "20px",
              background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Full-Stack Developer & Software Engineer
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.5,
              color: "#94a3b8",
              margin: 0,
              marginBottom: "28px",
            }}
          >
            Building practical applications across web and desktop, with a focus on backend systems, databases, and modern user experiences.
          </p>

          {/* Tech Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS", "Node.js"].map(
              (tech) => (
                <span
                  key={tech}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    padding: "6px 14px",
                  }}
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right Column: Framed Photo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Outer Glowing Ring */}
          <div
            style={{
              width: "380px",
              height: "440px",
              borderRadius: "28px",
              padding: "4px",
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.6), rgba(129, 140, 248, 0.3), rgba(6, 182, 212, 0.8))",
              boxShadow: "0 0 45px rgba(6, 182, 212, 0.35)",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Jerwin Masagca"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "50% 12%",
                  borderRadius: "24px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#0f172a",
                  borderRadius: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: 900,
                  color: "#38bdf8",
                }}
              >
                JM
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
