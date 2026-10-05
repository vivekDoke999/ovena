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
    <header className="bg-surface border-b border-border h-[72px] px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 transition-shadow duration-300">
      {/* LEFT: Wordmark */}
      <div className="flex-1 flex items-center">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <span className="text-[22px] font-semibold text-foreground tracking-tight flex items-center">
            OVENA<span className="w-1.5 h-1.5 rounded-full bg-accent ml-1 mb-1 block"></span>
          </span>
        </Link>
      </div>

      {/* CENTER: Main Navigation */}
      <nav className="hidden md:flex flex-1 justify-center gap-8 items-center text-[15px] font-medium text-text-secondary">
        <Link href="/search" className="hover:text-foreground transition-colors">Rent</Link>
        <Link href="/search" className="hover:text-foreground transition-colors">Explore</Link>
        <Link href="/search" className="hover:text-foreground transition-colors">Locations</Link>
      </nav>

      {/* RIGHT: Auth/Actions */}
      <div className="hidden md:flex flex-1 justify-end items-center gap-5">
        {(!user || (role !== 'HOST' && role !== 'ADMIN')) && (
          <Link href="/host" className="text-[14px] font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors">
            List your property
          </Link>
        )}
        
        {user ? (
          <div className="flex items-center gap-5 text-[14px] font-medium text-text-secondary">
             {(!role || role === 'RENTER') && (
               <Link href="/renter/dashboard?tab=saved" className="hover:text-foreground transition-colors">Saved</Link>
             )}
             {role === 'HOST' && (
               <Link href="/host" className="hover:text-foreground transition-colors">Host Dashboard</Link>
             )}
             {role === 'ADMIN' && (
               <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
             )}
             
            <div className="flex items-center gap-4 pl-5 border-l border-border">
              <Link href={role === 'HOST' ? '/host' : role === 'ADMIN' ? '/admin' : '/renter/dashboard?tab=profile'} className="hover:text-foreground transition-colors font-medium">
                {displayName}
              </Link>
              <form action="/auth/logout" method="POST">
                <button type="submit" className="hover:text-foreground transition-colors">Logout</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 ml-2">
            <Link href="/login" className="text-[14px] font-medium text-text-secondary hover:text-foreground transition-colors px-3 py-2">Log In</Link>
            <Link href="/signup" className="text-[14px] font-medium text-text-secondary hover:text-foreground transition-colors px-3 py-2">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu user={user} role={role} displayName={displayName} />
    </header>
  );
}
