import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MobileMenu } from './MobileMenu';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) role = profile.role;
  }

  return (
    <header className="bg-white border-b border-border py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm relative">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
          OVENA
        </Link>
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-primary transition-colors">Explore</Link>
          {role === 'HOST' || role === 'ADMIN' ? (
            <Link href="/host" className="hover:text-primary transition-colors">Host Dashboard</Link>
          ) : (
            <Link href="/host" className="hover:text-primary transition-colors">List Your Property</Link>
          )}
          {role === 'ADMIN' && (
             <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
          )}
        </nav>
      </div>

      {/* Desktop Auth/Actions */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-600 mr-4">
               {(!role || role === 'RENTER') && (
                 <>
                   <Link href="/renter/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                   <Link href="/renter/dashboard?tab=saved" className="hover:text-primary transition-colors">Saved</Link>
                   <Link href="/renter/dashboard?tab=enquiries" className="hover:text-primary transition-colors">Enquiries</Link>
                 </>
               )}
            </div>
            <form action="/auth/logout" method="POST">
              <button type="submit" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Logout</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log In</Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors">Sign Up</Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu user={user} role={role} />
    </header>
  );
}
