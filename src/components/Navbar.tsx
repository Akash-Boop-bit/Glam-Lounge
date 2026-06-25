"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

interface NavbarProps {
  businessName: string;
  whatsappNumber: string;
}

export default function Navbar({ businessName, whatsappNumber }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Gul Arora', href: '#gul-arora' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      // Offset for sticky navbar
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-charcoal-light/90 backdrop-blur-md py-4 border-b border-cherry-900/30 shadow-2xl shadow-charcoal/80'
          : 'bg-transparent py-6 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo/Branding */}
        <a href="#hero" className="flex items-center" onClick={(e) => handleLinkClick(e, '#hero')}>
          <span className="font-serif text-lg md:text-xl font-bold tracking-widest text-ivory hover:text-cherry-300 transition-colors uppercase">
            Glam Lounge
            <span className="hidden sm:inline text-cherry-500">.</span>
            <span className="hidden md:inline font-sans text-[10px] block tracking-[0.25em] text-cherry-300 font-light mt-0.5 opacity-80">
              LUXURY SALON
            </span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-[10px] uppercase tracking-[0.2em] text-ivory/80 hover:text-cherry-300 transition-colors duration-300 font-medium relative group"
            >
              {link.name}
              <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-cherry-300 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden lg:block">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] px-6 py-3 rounded-full border border-cherry-500/20 hover:border-cherry-300/40 shadow-[0_0_15px_rgba(140,31,58,0.3)] hover:shadow-[0_0_20px_rgba(217,79,112,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Phone size={10} />
            <span>Book Now</span>
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          className="lg:hidden text-ivory/90 hover:text-cherry-300 transition-colors p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Sidebar/Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-charcoal-light/95 backdrop-blur-lg border-b border-cherry-900/50 py-8 px-6 flex flex-col space-y-5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-xs uppercase tracking-[0.2em] text-ivory hover:text-cherry-300 transition-colors py-2 font-medium border-b border-charcoal-lighter/40"
            >
              {link.name}
            </a>
          ))}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] py-3.5 px-6 rounded-full border border-cherry-500/20"
          >
            <Phone size={10} />
            <span>Book on WhatsApp</span>
          </a>
        </div>
      )}
    </nav>
  );
}
