-- Add Arabic columns to Products table
alter table public.products
add column if not exists name_ar text,
add column if not exists description_ar text,
add column if not exists details_ar jsonb;

-- Ensure RLS allows Admins to write to these new columns
-- (Policies are usually 'row-based' so existing policies should cover it, but checking)
-- Policy: "Admin Modify Products" (covers update/insert for ALL columns)
