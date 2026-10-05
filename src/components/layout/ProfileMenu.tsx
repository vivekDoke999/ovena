'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

type ProfileMenuProps = {
  displayName: string;
  email: string;
  role: string | null;
};

export function ProfileMenu({ displayName, email, role }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Compute initials
  let initials = 'OV';
  if (displayName && displayName !== 'Account') {
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts[0].length >= 1) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const profileLink = role === 'HOST' ? '/host' : role === 'ADMIN' ? '/admin' : '/renter/dashboard?tab=profile';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-soft text-primary font-medium text-[14px] hover:ring-2 hover:ring-border transition-all"
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-lg border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-soft text-primary font-medium text-[15px]">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-[14px] font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[13px] text-text-secondary truncate">{email}</p>
            </div>
          </div>

          {/* Links */}
          <div className="py-2 border-b border-border flex flex-col">
            <Link 
              href={profileLink}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-[14px] text-foreground hover:bg-secondary-hover transition-colors"
            >
              Profile
            </Link>
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-[14px] text-foreground hover:bg-secondary-hover transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* Theme Switcher */}
          <div className="py-2 border-b border-border px-4">
            <p className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2">Theme</p>
            <div className="flex bg-secondary-hover p-1 rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-colors ${theme === 'system' ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'}`}
              >
                System
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="py-2">
            <form action="/auth/logout" method="POST" className="w-full">
              <button 
                type="submit" 
                className="w-full text-left px-4 py-2 text-[14px] text-foreground hover:bg-secondary-hover transition-colors"
              >
                Log out
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
