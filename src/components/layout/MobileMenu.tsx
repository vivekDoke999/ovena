'use client';

import { useState } from 'react';
import Link from 'next/link';

import { User } from '@supabase/supabase-js';

interface MobileMenuProps {
  user: User | null;
  role: string | null;
  displayName?: string;
}

export function MobileMenu({ user, role, displayName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 -mr-2 text-text-secondary hover:text-foreground focus:outline-none transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-surface border-b border-border shadow-md py-4 px-6 flex flex-col gap-4 text-sm font-medium">
          {user && (
            <div className="text-foreground font-semibold text-base mb-2 border-b border-border pb-3">
              Hello, {displayName}
            </div>
          )}
          <Link href="/search" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">Search Properties</Link>
          
          {role === 'HOST' || role === 'ADMIN' ? (
            <Link href="/host" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">Host Dashboard</Link>
          ) : (
            <Link href="/host" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">List Your Property</Link>
          )}

          {role === 'ADMIN' && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">Admin Dashboard</Link>
          )}

          {user && (!role || role === 'RENTER') && (
            <>
              <div className="h-px bg-border my-1"></div>
              <Link href="/renter/dashboard" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">Renter Dashboard</Link>
              <Link href="/renter/dashboard?tab=saved" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">Saved Properties</Link>
              <Link href="/renter/dashboard?tab=enquiries" onClick={() => setIsOpen(false)} className="py-2 text-text-secondary hover:text-foreground transition-colors">My Enquiries</Link>
            </>
          )}

          <div className="h-px bg-border my-1"></div>
          
          {user ? (
            <form action="/auth/logout" method="POST" onSubmit={() => setIsOpen(false)}>
              <button type="submit" className="w-full text-left py-2 text-error hover:opacity-80 transition-opacity">Logout</button>
            </form>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" onClick={() => setIsOpen(false)} className="py-2.5 text-text-secondary hover:text-foreground transition-colors text-center border border-border rounded-lg">Log In</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="py-2.5 bg-primary text-white text-center rounded-lg hover:bg-primary-hover transition-colors">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
