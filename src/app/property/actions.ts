'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function saveProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to save properties' };
  }

  const { error } = await supabase
    .from('saved_properties')
    .insert({
      renter_id: user.id,
      property_id: propertyId
    });

  if (error) {
    if (error.code === '23505') { // unique violation
      return { success: true }; // already saved
    }
    return { error: 'Failed to save property' };
  }

  revalidatePath(`/property/${propertyId}`);
  revalidatePath('/renter/dashboard');
  return { success: true };
}

export async function unsaveProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to unsave properties' };
  }

  const { error } = await supabase
    .from('saved_properties')
    .delete()
    .match({
      renter_id: user.id,
      property_id: propertyId
    });

  if (error) {
    return { error: 'Failed to unsave property' };
  }

  revalidatePath(`/property/${propertyId}`);
  revalidatePath('/renter/dashboard');
  return { success: true };
}

const enquirySchema = z.object({
  property_id: z.string().uuid(),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000)
});

export async function createEnquiry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to send an enquiry' };
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    message: formData.get('message') as string,
  };

  const parsed = enquirySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase
    .from('enquiries')
    .insert({
      renter_id: user.id,
      property_id: parsed.data.property_id,
      message: parsed.data.message,
      status: 'PENDING'
    });

  if (error) {
    return { error: 'Failed to send enquiry' };
  }

  revalidatePath('/renter/dashboard');
  return { success: true };
}

const reportSchema = z.object({
  property_id: z.string().uuid(),
  reason: z.string().min(3, "Please select a reason"),
  description: z.string().max(1000).optional()
});

export async function reportListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to report a listing' };
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    reason: formData.get('reason') as string,
    description: formData.get('description') as string,
  };

  const parsed = reportSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      property_id: parsed.data.property_id,
      reason: parsed.data.reason,
      description: parsed.data.description || null,
      status: 'OPEN'
    });

  if (error) {
    return { error: 'Failed to submit report' };
  }

  return { success: true };
}
