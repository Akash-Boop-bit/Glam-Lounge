"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Tag,
  Image as ImageIcon,
  User,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Skip sidebar layout for login screen
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Homepage Copy', href: '/admin/homepage', icon: Home },
    { name: 'Services Grid', href: '/admin/services', icon: Tag },
    { name: 'Gallery Work', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Founder Info', href: '/admin/gul-arora', icon: User },
    { name: 'Contact & Map', href: '/admin/contact', icon: MapPin },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col lg:flex-row text-ivory">
      
      {/* Mobile Nav Header */}
      <header className="lg:hidden bg-charcoal-light border-b border-cherry-900/30 px-6 py-4 flex items-center justify-between z-30">
        <Link href="/admin" className="font-serif text-md font-bold tracking-widest text-white uppercase">
          Glam Admin
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-ivory/80 hover:text-cherry-300 transition-colors p-2"
          aria-label="Toggle menu sidebar"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-charcoal-light border-r border-cherry-900/30 flex flex-col justify-between py-8 px-6 transform lg:translate-x-0 lg:static transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-8">
          {/* Logo Branding */}
          <div className="hidden lg:block border-b border-charcoal-lighter pb-4">
            <Link href="/admin" className="font-serif text-lg font-bold tracking-widest text-white uppercase block">
              Glam Lounge
            </Link>
            <span className="font-sans text-[8px] tracking-[0.25em] text-cherry-300 font-semibold uppercase block opacity-85 mt-0.5">
              ADMIN CONTROL PANEL
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-200 border ${
                    isActive
                      ? 'bg-cherry-700/10 border-cherry-500/20 text-cherry-300 shadow-inner'
                      : 'border-transparent text-ivory/60 hover:bg-charcoal hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-cherry-300' : 'text-ivory/40'} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Control */}
        <div className="border-t border-charcoal-lighter pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3.5 px-4 py-3 w-full rounded-xl text-xs uppercase tracking-widest font-semibold text-cherry-500 hover:bg-cherry-900/10 transition-colors border border-transparent cursor-pointer"
          >
            <LogOut size={14} className="text-cherry-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Background overlay for mobile menu open state */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Main Workspace Frame */}
      <main className="flex-grow p-6 sm:p-10 lg:max-h-screen lg:overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>

    </div>
  );
}
