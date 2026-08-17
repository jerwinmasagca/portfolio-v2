-- ----------------------------------------------------
-- Create Contacts Table for Visitor/Employer Messages
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Policies
-- ----------------------------------------------------

-- Allow public insertion (so anyone visiting the page can send a message)
CREATE POLICY "Allow public insert contacts" ON public.contacts 
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view messages
CREATE POLICY "Allow admin read contacts" ON public.contacts 
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to delete messages
CREATE POLICY "Allow admin delete contacts" ON public.contacts 
    FOR DELETE TO authenticated USING (true);
