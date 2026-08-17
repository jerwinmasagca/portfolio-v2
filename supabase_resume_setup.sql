-- ----------------------------------------------------
-- 1. Create Tables for Resume & Portfolio Information
-- ----------------------------------------------------

-- Experience Table
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    duration TEXT NOT NULL,
    description TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Education Table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school TEXT NOT NULL,
    degree TEXT NOT NULL,
    year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General', -- e.g., 'Backend', 'Frontend', 'Database', 'Tools'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------
-- 2. Enable Row-Level Security (RLS)
-- ----------------------------------------------------
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- 3. Row-Level Security (RLS) Policies
-- ----------------------------------------------------

-- Public selects
CREATE POLICY "Allow public read experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Allow public read education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Allow public read certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Allow public read skills" ON public.skills FOR SELECT USING (true);

-- Admin writes
CREATE POLICY "Allow admin all experiences" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all education" ON public.education FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all certifications" ON public.certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------
-- 4. Seed Seed-Data (Your initial resume data)
-- ----------------------------------------------------

-- Seed Initial Experience
INSERT INTO public.experiences (role, company, duration, description) VALUES
(
  'Full-Stack Developer Intern', 
  'MGEN (Meralco PowerGen)', 
  'Sept 2025 - Feb 2026', 
  ARRAY[
    'Develop backend features using Node.js, TypeScript, and PHP.',
    'Work on CodeIgniter modules focusing on backend logic and data workflows.',
    'Troubleshoot system issues and contribute to performance improvements.',
    'Support UI fixes and layout adjustments when needed.',
    'Contributed to the development of the MGEN Central Hub system from early stages, completing 160+ development tickets.',
    'Independently implemented Microsoft Single Sign-On (SSO) using Azure Active Directory (Entra ID), enabling secure authentication.',
    'Led database migration to Supabase, ensuring stable connectivity, optimized performance, and proper data handling.',
    'Designed and developed Role-Based Access Control (RBAC), allowing Super Admins to manage department and employee access permissions.',
    'Built and enhanced multiple system features based on requirements and acceptance criteria.',
    'Performed bug fixing, troubleshooting, and UI improvements to enhance user experience and system reliability.',
    'Worked on Renewal Care (Support Entitlement) system, focused on system enhancements and fixes.',
    'Improved system performance by optimizing queries and limiting heavy data loads to prevent timeouts.'
  ]
);

-- Seed Initial Education
INSERT INTO public.education (school, degree, year) VALUES
('Quezon City University', 'Bachelor of Science in Information Technology (BSIT)', 'Tertiary'),
('International Christian & Jose Maria College', 'Senior High School', '2022'),
('Doña Rosario High School', 'High School', '2020'),
('Rosa Susano Elementary School', 'Elementary', '2016');

-- Seed Initial Certifications
INSERT INTO public.certifications (name, issuer) VALUES
('Introduction to Cybersecurity', 'Cisco Networking Academy'),
('Endpoint Security', 'Cisco Networking Academy'),
('Networking Basics', 'Cisco Networking Academy'),
('Introduction to Data Science', 'Cisco Networking Academy'),
('LEGO Educational Robotics and Computer Technical Training', 'Diliman College');

-- Seed Initial Skills
INSERT INTO public.skills (name, category) VALUES
-- Backend
('Node.js', 'Backend'),
('PHP', 'Backend'),
('CodeIgniter', 'Backend'),
('TypeScript', 'Backend'),
('C++', 'Backend'),
('Python Django', 'Backend'),
-- Frontend
('React', 'Frontend'),
('Bootstrap', 'Frontend'),
('JavaScript', 'Frontend'),
('Java Swing', 'Frontend'),
-- Database
('MySQL', 'Database'),
('PostgreSQL', 'Database'),
('SQLite', 'Database'),
('Supabase', 'Database'),
-- General / Tools
('Git/GitHub', 'Tools'),
('XAMPP', 'Tools'),
('Eclipse', 'Tools'),
('Role-Based Access Control (RBAC)', 'General'),
('Microsoft SSO (Entra ID)', 'General');
