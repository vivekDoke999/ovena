'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteProperty(formData: FormData) {
  const supabase = await createClient();
  const propertyId = formData.get('property_id') as string;
  
  if (!propertyId) {
    console.error('Invalid property ID');
    return;
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) {
    console.error('Failed to delete property', error);
    return;
  }

  revalidatePath('/host/properties');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProperty(data: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { id, images, amenities, ...propertyData } = data;

  const insertData = {
    ...propertyData,
    id,
    host_id: user.id,
    status: 'DRAFT',
    verification_status: 'PENDING',
  };

  const { error: propertyError } = await supabase
    .from('properties')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert([insertData as any]);

  if (propertyError) {
    console.error(propertyError);
    return { error: 'Failed to create property' };
  }

  if (images && images.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageInserts = images.map((img: any, index: number) => ({
      property_id: id,
      image_url: img.path,
      display_order: index,
    }));
    await supabase.from('property_images').insert(imageInserts);
  }

  if (amenities && amenities.length > 0) {
    const amenityInserts = amenities.map((amenityId: string) => ({
      property_id: id,
      amenity_id: amenityId,
    }));
    await supabase.from('property_amenities').insert(amenityInserts);
  }

  revalidatePath('/host');
  revalidatePath('/host/properties');
  
  return { success: true };
}
