import { logout } from '@/app/(auth)/actions';
import { redirect } from 'next/navigation';

export async function POST() {
  await logout();
  // logout action handles redirect, but we include it here just in case
  redirect('/login');
}
