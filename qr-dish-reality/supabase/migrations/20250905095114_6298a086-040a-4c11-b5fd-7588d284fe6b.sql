-- Create storage bucket for dish assets (images and 3D models)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dish-assets', 'dish-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for dish assets storage
CREATE POLICY "Anyone can view dish assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dish-assets');

CREATE POLICY "Restaurant owners can upload dish assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dish-assets' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can update their dish assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dish-assets' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can delete their dish assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dish-assets' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE owner_id = auth.uid()
  )
);