import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HostLayout({ children }: { children: React.ReactNode }) {
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

  if (profile?.role !== 'HOST' && profile?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
