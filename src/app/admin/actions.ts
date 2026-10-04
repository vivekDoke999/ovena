'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return { supabase, user };
}

export async function verifyProperty(formData: FormData) {
  const { supabase, user } = await verifyAdminAccess();
  const propertyId = formData.get('property_id') as string;
  
  if (!propertyId) {
    console.error('Invalid property ID');
    return;
  }

  const { error } = await supabase
    .from('properties')
    .update({ verification_status: 'VERIFIED', status: 'AVAILABLE' })
    .eq('id', propertyId);

  if (error) {
    console.error('Failed to verify property', error);
    return;
  }

  await supabase.from('admin_actions').insert([{
    admin_id: user.id,
    action: 'listing_verified',
    target_type: 'property',
    target_id: propertyId
  }]);

  revalidatePath('/admin');
  revalidatePath('/admin/properties');
}

export async function rejectProperty(formData: FormData) {
  const { supabase, user } = await verifyAdminAccess();
  const propertyId = formData.get('property_id') as string;
  
  if (!propertyId) {
    console.error('Invalid property ID');
    return;
  }

  const { error } = await supabase
    .from('properties')
    .update({ verification_status: 'REJECTED' })
    .eq('id', propertyId);

  if (error) {
    console.error('Failed to reject property', error);
    return;
  }

  await supabase.from('admin_actions').insert([{
    admin_id: user.id,
    action: 'listing_rejected',
    target_type: 'property',
    target_id: propertyId
  }]);

  revalidatePath('/admin');
  revalidatePath('/admin/properties');
}

export async function pauseProperty(formData: FormData) {
  const { supabase, user } = await verifyAdminAccess();
  const propertyId = formData.get('property_id') as string;
  
  if (!propertyId) {
    console.error('Invalid property ID');
    return;
  }

  const { error } = await supabase
    .from('properties')
    .update({ status: 'PAUSED' })
    .eq('id', propertyId);

  if (error) {
    console.error('Failed to pause property', error);
    return;
  }

  await supabase.from('admin_actions').insert([{
    admin_id: user.id,
    action: 'listing_suspended',
    target_type: 'property',
    target_id: propertyId
  }]);

  revalidatePath('/admin');
  revalidatePath('/admin/properties');
}

export async function removeProperty(formData: FormData) {
  const { supabase, user } = await verifyAdminAccess();
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
    console.error('Failed to remove property', error);
    return;
  }

  await supabase.from('admin_actions').insert([{
    admin_id: user.id,
    action: 'listing_removed',
    target_type: 'property',
    target_id: propertyId
  }]);

  revalidatePath('/admin');
  revalidatePath('/admin/properties');
}

export async function suspendUser(formData: FormData) {
  const { supabase, user } = await verifyAdminAccess();
  const userId = formData.get('user_id') as string;
  const isSuspended = formData.get('is_suspended') === 'true';
  
  if (!userId) {
    console.error('Invalid user ID');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: isSuspended })
    .eq('id', userId);

  if (error) {
    console.error('Failed to suspend/unsuspend user', error);
    return;
  }

  await supabase.from('admin_actions').insert([{
    admin_id: user.id,
    action: isSuspended ? 'user_suspended' : 'user_unsuspended',
    target_type: 'user',
    target_id: userId
  }]);

  revalidatePath('/admin/users');
}

export async function resolveReport(formData: FormData) {
  const { supabase, user } = await verifyAdminAccess();
  const reportId = formData.get('report_id') as string;
  const status = formData.get('status') as string;
  
  if (!reportId) {
    console.error('Invalid report ID');
    return;
  }

  const { error } = await supabase
    .from('reports')
    .update({ status: status as 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED' })
    .eq('id', reportId);

  if (error) {
    console.error('Failed to resolve report', error);
    return;
  }

  await supabase.from('admin_actions').insert([{
    admin_id: user.id,
    action: 'report_resolved',
    target_type: 'report',
    target_id: reportId
  }]);

  revalidatePath('/admin/reports');
}
