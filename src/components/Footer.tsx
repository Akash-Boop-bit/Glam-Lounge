"use client";

import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  businessName: string;
}

export default function Footer({ businessName }: FooterProps) {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal border-t border-charcoal-lighter/80 py-16 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand Label */}
        <div className="text-center md:text-left">
          <h3 className="font-serif text-lg font-bold tracking-widest text-white uppercase mb-1">
            Glam Lounge
          </h3>
          <span className="font-sans text-[8px] tracking-[0.3em] text-cherry-300 font-semibold uppercase block opacity-85">
            LUXURY SALON
          </span>
          <p className="text-[10px] text-ivory/40 mt-3 font-light max-w-xs">
            Model Town, Panipat's premium unisex beauty destination. Crafted by Gul Arora.
          </p>
        </div>

        {/* Brand Copyright & Dev signature */}
        <div className="text-center">
          <p className="text-[10px] tracking-wider text-ivory/50 font-light">
            © {currentYear} {businessName}. All rights reserved.
          </p>
          <p className="text-[9px] text-ivory/30 tracking-widest uppercase font-semibold mt-1">
            Design & Experience by <a href="https://www.fallup.in" target="_blank" rel="noopener noreferrer">Akash Malik</a>
          </p>
        </div>

        {/* Scroll To Top Button */}
        <div>
          <button
            onClick={handleScrollToTop}
            className="flex items-center space-x-2 bg-charcoal-light hover:bg-charcoal-lighter text-ivory/70 hover:text-cherry-300 transition-colors py-3.5 px-6 rounded-full border border-cherry-900/30 hover:border-cherry-300/30 text-[9px] uppercase tracking-widest font-semibold cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp size={10} className="text-cherry-500" />
          </button>
        </div>

      </div>
    </footer>
  );
}
