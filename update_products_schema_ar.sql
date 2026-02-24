-- Add Arabic columns to the products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS name_ar text,
ADD COLUMN IF NOT EXISTS description_ar text,
ADD COLUMN IF NOT EXISTS category_ar text,
ADD COLUMN IF NOT EXISTS details_ar jsonb;
