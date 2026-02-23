# Fix "New row violates row-level security policy"

If you are seeing an error when trying to submit an inquiry, it means the database is blocking public users (like your website visitors) from writing to the `inquiries` table.

Please run the following SQL command in your [Supabase SQL Editor](https://supabase.com/dashboard/project/mmeuwvuvglvwxtforlcp/sql) to fix this permission issue.

```sql
-- Allow anyone (public/anon users) to INSERT into the inquiries table
CREATE POLICY "Public Create Inquiries"
ON public.inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- If the policy already exists but is wrong, you can drop it first:
-- DROP POLICY IF EXISTS "Public Create Inquiries" ON public.inquiries;
-- Then run the CREATE POLICY command above.
```

**Why this happened:**
By default, Row Level Security (RLS) blocks *all* access. You must explicitly allow `anon` (unauthenticated) users to `INSERT` rows if you want a public contact form.
