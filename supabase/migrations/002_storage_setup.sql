-- 002_storage_setup.sql

-- Insert the private bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', false)
ON CONFLICT (id) DO NOTHING;

-- Enforce RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Admin Policies: Complete access to all property-images objects
CREATE POLICY "Admin can manage all property images"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'property-images' AND
    public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'property-images' AND
    public.is_admin(auth.uid())
);

-- 2. Host Policies: Scoped to their own UUID folder root
-- The file path requirement is: {host_user_id}/{property_id}/{unique_file_name}
-- Using (string_to_array(name, '/'))[1] accurately extracts the first path segment.

CREATE POLICY "Hosts can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'property-images' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Hosts can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-images' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Hosts can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'property-images' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Hosts can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-images' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);
