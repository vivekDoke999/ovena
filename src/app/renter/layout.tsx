import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RenterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (profile?.role !== 'RENTER' && profile?.role !== 'ADMIN') {
    // If HOST trying to access renter, send them home to be redirected properly
    redirect('/');
  }

  return (
    <div className="flex-1 flex flex-col bg-secondary/10">
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
