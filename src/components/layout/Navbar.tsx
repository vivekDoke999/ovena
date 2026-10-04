import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MobileMenu } from './MobileMenu';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role: string | null = null;
  let firstName: string | null = null;
  let lastName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', user.id)
      .single();
    if (profile) {
      role = profile.role;
      firstName = profile.first_name;
      lastName = profile.last_name;
    }
  }

  const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : 'Account';

  return (
    <header className="bg-surface border-b border-border py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-2xl font-bold text-foreground tracking-tighter hover:opacity-80 transition-opacity">
          OVENA.
        </Link>
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-text-secondary">
          <Link href="/search" className="hover:text-foreground transition-colors">Search</Link>
          {role === 'HOST' || role === 'ADMIN' ? (
            <Link href="/host" className="hover:text-foreground transition-colors">Host Dashboard</Link>
          ) : (
            <Link href="/host" className="hover:text-foreground transition-colors">List Your Property</Link>
          )}
          {role === 'ADMIN' && (
             <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          )}
        </nav>
      </div>

      {/* Desktop Auth/Actions */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-6 text-sm font-medium text-text-secondary mr-2">
               {(!role || role === 'RENTER') && (
                 <>
                   <Link href="/renter/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                   <Link href="/renter/dashboard?tab=saved" className="hover:text-foreground transition-colors">Saved</Link>
                   <Link href="/renter/dashboard?tab=enquiries" className="hover:text-foreground transition-colors">Enquiries</Link>
                 </>
               )}
            </div>
            
            <div className="flex items-center gap-3 border-l border-border pl-4 ml-2">
              <Link href={role === 'HOST' ? '/host' : role === 'ADMIN' ? '/admin' : '/renter/dashboard?tab=profile'} className="text-sm font-semibold text-foreground hover:opacity-80 transition-opacity">
                {displayName}
              </Link>
              <form action="/auth/logout" method="POST">
                <button type="submit" className="text-sm font-medium text-text-secondary px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border">Logout</button>
              </form>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors px-4 py-2">Log In</Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-colors">Sign Up</Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu user={user} role={role} displayName={displayName} />
    </header>
  );
}
