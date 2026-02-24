-- 1. Fix RLS Policy: Allow Authenticated Users (Admins) to Create Inquiries
-- This fixes the error: "new row violates row-level security policy for table 'inquiries'"
create policy "Authenticated Create Inquiries"
on public.inquiries for insert
to authenticated
with check (true);

-- 2. Add 'resolved' column to Inquiries table
alter table public.inquiries
add column if not exists resolved boolean default false;

-- 3. Allow Admins to UPDATE Inquiries (for marking as resolved)
create policy "Admin Update Inquiries"
on public.inquiries for update
to authenticated
using (true)
with check (true);

-- 4. Allow Admins to DELETE Inquiries
create policy "Admin Delete Inquiries"
on public.inquiries for delete
to authenticated
using (true);
