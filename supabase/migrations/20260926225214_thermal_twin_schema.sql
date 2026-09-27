/*
# Thermal Twin - Community Applications Table

1. Purpose
   The Thermal Twin platform serves two stakeholders: mine operators (who sign in)
   and community members / businesses (who do NOT sign in). Community users submit
   applications to off-take heat opportunities or job placements. These submissions
   need to persist so mine operators can review them later.

2. New Tables
   - `community_applications`
     - `id` (uuid, primary key)
     - `applicant_type` (text: 'individual' or 'business')
     - `full_name` (text, not null)
     - `email` (text, not null)
     - `phone` (text)
     - `opportunity_id` (text, identifies which opportunity they applied to)
     - `opportunity_name` (text, denormalized for display)
     - `organization` (text, optional - for business applicants)
     - `message` (text, optional - cover note / motivation)
     - `status` (text, default 'pending')
     - `created_at` (timestamptz, default now())

3. Security
   - RLS enabled on `community_applications`.
   - INSERT: allowed for anon + authenticated (community users submit without signing in).
   - SELECT/UPDATE/DELETE: authenticated only (mine operators review applications after login).
   - This is intentionally a split policy: public write, private read.
*/

CREATE TABLE IF NOT EXISTS community_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_type text NOT NULL CHECK (applicant_type IN ('individual', 'business')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  opportunity_id text NOT NULL,
  opportunity_name text NOT NULL,
  organization text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_applications" ON community_applications;
CREATE POLICY "anon_insert_applications"
ON community_applications FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_applications" ON community_applications;
CREATE POLICY "auth_select_applications"
ON community_applications FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_applications" ON community_applications;
CREATE POLICY "auth_update_applications"
ON community_applications FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_applications" ON community_applications;
CREATE POLICY "auth_delete_applications"
ON community_applications FOR DELETE
TO authenticated USING (true);