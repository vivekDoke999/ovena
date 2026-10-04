'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';

interface UploadedImage {
  path: string;
  url: string;
}

interface ImageUploadProps {
  hostId: string;
  propertyId: string;
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export default function ImageUpload({ hostId, propertyId, images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const supabase = createClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    const file = e.target.files[0];
    
    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc).');
      setUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB.');
      setUploading(false);
      return;
    }

    // Generate unique safe path: {host_user_id}/{property_id}/{unique_file_name}
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${hostId}/${propertyId}/${fileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (data) {
        // Since bucket is private, we'll store the path. 
        // We can optionally generate a temporary signed URL for preview
        const { data: urlData } = await supabase.storage
          .from('property-images')
          .createSignedUrl(data.path, 60 * 60); // 1 hour preview

        onChange([...images, { path: data.path, url: urlData?.signedUrl || '' }]);
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Error uploading image');
      } else {
        setError('Error uploading image');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    
    // Optional: Delete from storage bucket immediately
    try {
      await supabase.storage.from('property-images').remove([imageToRemove.path]);
    } catch (err) {
      console.error('Failed to remove from storage', err);
    }
    
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={img.path} className="relative group rounded-md overflow-hidden border aspect-video bg-gray-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={`Property image ${idx + 1}`} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="bg-red-600 text-white p-1 px-3 rounded-md text-xs font-medium"
              >
                Delete
              </button>
            </div>
            {idx === 0 && (
              <span className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider font-bold shadow-sm">
                Primary
              </span>
            )}
          </div>
        ))}
        
        {images.length < 5 && (
          <div className="border-2 border-dashed border-gray-300 rounded-md aspect-video flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-gray-500 text-sm font-medium">
              {uploading ? 'Uploading...' : '+ Add Image'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
