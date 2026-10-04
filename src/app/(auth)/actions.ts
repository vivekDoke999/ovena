'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export async function login(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['RENTER', 'HOST']),
});

export async function signup(formData: FormData) {
  const supabase = await createClient();
  
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'RENTER' | 'HOST';
  
  // Normalize phone so missing/empty fields become undefined
  const rawPhone = formData.get('phone');
  const phone = (typeof rawPhone === 'string' && rawPhone.trim() !== '') ? rawPhone.trim() : undefined;

  const validation = signupSchema.safeParse({
    firstName, lastName, email, phone, password, role
  });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user account' };
  }

  // 2. Insert profile using service role to bypass restrictive RLS logic
  // signUp doesn't establish an immediate authenticated session when email confirmations are required,
  // causing standard client inserts to fail with RLS error 42501.
  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  const serviceClient = createServiceRoleClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (serviceClient.from('profiles') as any).insert([{
    id: authData.user.id,
    first_name: firstName,
    last_name: lastName,
    phone: phone || null,
    role: role,
  }]);

  if (profileError) {
    console.error('Supabase profile creation error:', profileError);
    // If profile creation fails, we return an error.
    return { error: 'Account created, but failed to setup profile. Please contact support.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
