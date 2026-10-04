'use client';

import { useState } from 'react';
import Link from 'next/link';

import { User } from '@supabase/supabase-js';

interface MobileMenuProps {
  user: User | null;
  role: string | null;
}

export function MobileMenu({ user, role }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-border shadow-md py-4 px-6 flex flex-col gap-4 text-sm font-medium">
          <Link href="/search" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">Explore Properties</Link>
          
          {role === 'HOST' || role === 'ADMIN' ? (
            <Link href="/host" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">Host Dashboard</Link>
          ) : (
            <Link href="/host" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">List Your Property</Link>
          )}

          {role === 'ADMIN' && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">Admin Dashboard</Link>
          )}

          {user && (!role || role === 'RENTER') && (
            <>
              <div className="h-px bg-gray-100 my-1"></div>
              <Link href="/renter/dashboard" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">Renter Dashboard</Link>
              <Link href="/renter/dashboard?tab=saved" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">Saved Properties</Link>
              <Link href="/renter/dashboard?tab=enquiries" onClick={() => setIsOpen(false)} className="py-2 hover:text-primary transition-colors">My Enquiries</Link>
            </>
          )}

          <div className="h-px bg-gray-100 my-1"></div>
          
          {user ? (
            <form action="/auth/logout" method="POST" onSubmit={() => setIsOpen(false)}>
              <button type="submit" className="w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors">Logout</button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)} className="py-2 text-gray-600 hover:text-primary transition-colors">Log In</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="py-2 bg-primary text-white text-center rounded-md hover:bg-primary-hover transition-colors">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
