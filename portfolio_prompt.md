# Master Portfolio Specification & Generation Prompt

Below is a detailed, comprehensive prompt designed to guide AI coding assistants in building or upgrading your 3D Developer Portfolio with an Admin Panel and media upload capabilities. You can copy and paste this entire prompt block to specify your requirements.

---

```markdown
Role: Senior Full-Stack Developer & Next.js Expert

Task: Implement and polish a complete, responsive 3D developer portfolio website featuring a secure, fully functional admin control panel with interactive database integrations and rich media uploading (images and videos) using Supabase storage.

### Tech Stack Constraints
- Framework: Next.js (App Router, React 19)
- Styling: Tailwind CSS v4 (using clean utility classes, custom modern fonts, and glassmorphic aesthetics)
- 3D Graphics: Spline Integration (via @splinetool/react-spline)
- Icons: Lucide React
- Backend / Database / Storage: Supabase (Auth, PostgreSQL DB, and Storage Buckets)

---

## CORE FUNCTIONAL REQUIREMENTS

### 1. Interactive 3D Spline Viewports
- Integration: Render an interactive 3D scene from Spline. The Spline URL must be dynamically loaded from the profile settings table in Supabase.
- UX & Fallbacks:
  - Provide a sleek CSS skeleton loader while the Spline element downloads.
  - If loading takes more than 5 seconds or fails, smoothly replace the viewport with a high-fidelity animated CSS background/canvas to prevent blocking the user experience.
  - Ensure the 3D element is interactive (rotates on cursor movement or scroll triggers) and responsive across desktop, tablet, and mobile views.

### 2. Complete Admin Control Panel (`/admin`)
- Security: Access must require login authentication. Secure the route using Supabase Auth. Provide a login page with state controls and a database connection status indicator.
- Navigation: A clean, sidebar-based or tab-based control panel featuring the following modules:
  - Projects: Management interface showing all projects. Includes triggers to add, edit, and delete projects.
  - Profile Settings: Input forms to change personal info, description, social handles (GitHub, LinkedIn, Email), CV file link, avatar picture, and the Spline 3D Scene URL.
  - Professional History: Input controls to create/update employment experience (roles, company, duration, responsibilities) and educational backgrounds.
  - Skills & Certifications: Categorized lists where items can be appended or removed dynamically.
  - Messages Inbox: A read-only interface displaying contact requests, names, emails, timestamps, and message contents submitted from the public site.

### 3. Rich Media Uploading & Supabase Storage (Critical)
- Storage Configuration:
  - Integrate with Supabase Storage. Set up/verify a public bucket named `project-assets`.
  - Provide auto-folder organization structure: images stored under `projects/images/` and videos under `projects/videos/`.
- Project Form Controls:
  - Provide drag-and-drop upload inputs for both Project Cover Image (Image) and Project Demo Video (Video).
  - Show real-time upload progress indicators (percentage bars or loaders) during transfer.
  - Show immediate preview states: render the selected image and play the selected video file in-browser before confirming changes.
- Database Schema Support:
  - The projects table must support columns for `id`, `title`, `description`, `image_url` (public storage URL), `video_url` (public storage URL, nullable), `project_url`, `github_url`, `tags` (array), and `created_at`.
- Garbage Collection & Storage Cleanups:
  - Whenever a project is deleted, automatically trigger a clean-up method to delete the associated image and video assets from Supabase Storage.
  - If a project is edited and the files are replaced, ensure the deprecated old assets are deleted from Supabase Storage to avoid storage pollution.

### 4. Public Portfolio Frontend Layout & Visual Polish
- Aesthetic: Deep-dark modern developer dashboard layout, using rich glassmorphic layers (backdrop-blur, translucent borders, subtle glowing gradient blobs in the background).
- Navigation: Sticky, header nav with smooth-scrolling anchors.
- Hero Section: Display the Spline 3D canvas side-by-side with dynamic text typing animations, and call-to-actions ("Explore Work", "Contact Me").
- Experience & Education: Clean timeline components detailing career progression.
- Skills Grid: Multi-category grids featuring hover highlights and visual progress/badges.
- Projects Section:
  - Interactive grid cards displaying the cover image.
  - On hovering a project card, play the demo video inline if a `video_url` exists.
  - Include tags filtering to filter projects dynamically by technologies used.
  - Implement a modal detail popup upon clicking a project, displaying full markdown-ready description, tech badges, links to GitHub/Live sites, and a responsive embedded HTML5 video player / image slider.
- Contact Form: Clean form capturing Visitor Name, Email, and Message, sending submissions instantly to the Supabase database.
```
