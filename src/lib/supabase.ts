import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url?: string) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

if (!rawUrl || !rawKey || !isValidUrl(rawUrl)) {
  console.warn(
    'Supabase credentials are not configured or invalid in .env.local. Falling back to local simulator.'
  );
}

// Fallback to a syntactically valid URL during build/prerender to prevent build crashes
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key-value';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
  project_url?: string;
  github_url?: string;
  tags?: string[];
  created_at?: string;
}

export interface ProfileSettings {
  id?: string;
  name: string;
  title: string;
  bio: string;
  availability_badge?: string;
  spline_url: string;
  resume_url?: string;
  avatar_url?: string;
  email?: string;
  github?: string;
  linkedin?: string;
}

export interface Experience {
  id?: string;
  role: string;
  company: string;
  duration: string;
  description: string[];
  created_at?: string;
}

export interface Education {
  id?: string;
  school: string;
  degree: string;
  year: string;
  created_at?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  created_at?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category: string;
  created_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}



