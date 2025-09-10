-- Add preparation time to dishes table
ALTER TABLE public.dishes 
ADD COLUMN preparation_time_minutes INTEGER DEFAULT 15;