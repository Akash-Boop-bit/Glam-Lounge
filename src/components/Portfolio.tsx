"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import gsap, { ScrollTrigger } from '@/lib/gsap';

interface GalleryItem {
  id: string;
  category: string;
  title: string;
  image: string;
}

interface PortfolioProps {
  gallery: GalleryItem[];
}

export default function Portfolio({ gallery }: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const categories = [
    { label: 'All Work', value: 'all' },
    { label: 'Bridal', value: 'bridal' },
    { label: 'Party Makeup', value: 'party' },
    { label: 'Hair Care', value: 'hair' },
    { label: 'Nails & Skin', value: 'nails' },
    { label: 'Academy', value: 'academy' },
    { label: 'Engagement', value: 'engagement' },
    { label: 'Reception', value: 'reception' },

  ];

  // Filter gallery items based on tag
  const filteredItems = activeFilter === 'all'
    ? gallery
    : gallery.filter((item) => item.category === activeFilter);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  // Animate grid items entering when filter changes
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll('.gallery-item');
      gsap.fromTo(
        items,
        { opacity: 0, scale: 0.95, y: 15 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    }
  }, [activeFilter, gallery]);

  // Lightbox overlay animations
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (lightboxIndex !== null && lightboxRef.current) {
      document.body.style.overflow = 'hidden'; // Lock background scroll
      if (!isReduced) {
        gsap.fromTo(
          lightboxRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
          lightboxRef.current.querySelector('.lightbox-content'),
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
        );
      }
    } else {
      document.body.style.overflow = ''; // Release scroll
    }
  }, [lightboxIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev! + 1));
  };

  return (
    <section id="portfolio" className="py-24 bg-charcoal relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-xl mx-auto mb-16">
          <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 block">
            Visual Story
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Our Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-ivory/60 font-light leading-relaxed">
            Browse through real transformations, professional bridal makeovers, and creative hairstyling work.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center flex-wrap gap-2 md:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-4 py-2 text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold rounded-full border transition-all duration-300 ${
                activeFilter === cat.value
                  ? 'bg-cherry-700 border-cherry-500 text-white shadow-[0_0_15px_rgba(140,31,58,0.3)]'
                  : 'bg-charcoal-light border-cherry-900/20 text-ivory/60 hover:text-white hover:border-cherry-300/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {filteredItems.map((item, index) => {
            // Find index of item in the full gallery list for referencing
            return (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="gallery-item relative aspect-square rounded-2xl overflow-hidden border border-cherry-900/30 group cursor-pointer shadow-md"
                style={{ opacity: 0 }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-charcoal-light/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end w-full">
                    <div>
                      <span className="text-cherry-300 text-[8px] uppercase tracking-widest font-bold block mb-1">
                        {item.category}
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-white">
                        {item.title}
                      </h4>
                    </div>
                    <div className="bg-cherry-700/80 p-2.5 rounded-full border border-cherry-300/20">
                      <Maximize2 size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <div
            ref={lightboxRef}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-ivory/60 hover:text-white p-2.5 rounded-full bg-charcoal-light/60 hover:bg-charcoal-lighter/80 transition-all border border-cherry-900/40 z-55"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>

            {/* Slider Navigation */}
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-6 text-ivory/60 hover:text-white p-3 rounded-full bg-charcoal-light/60 hover:bg-charcoal-lighter/80 transition-all border border-cherry-900/40 z-55"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-6 text-ivory/60 hover:text-white p-3 rounded-full bg-charcoal-light/60 hover:bg-charcoal-lighter/80 transition-all border border-cherry-900/40 z-55"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            {/* Content Frame */}
            <div
              onClick={(e) => e.stopPropagation()} // Stop bubbling
              className="lightbox-content relative max-w-4xl w-full max-h-[80vh] aspect-[4/5] sm:aspect-video rounded-2xl overflow-hidden border border-cherry-900/40 bg-charcoal-light shadow-2xl flex items-center justify-center"
            >
              <Image
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain p-2"
              />
              
              {/* Bottom tag info strip */}
              <div className="absolute bottom-0 left-0 right-0 bg-charcoal-light/95 border-t border-cherry-900/40 py-4 px-6 flex justify-between items-center backdrop-blur-sm">
                <div>
                  <span className="text-cherry-300 text-[8px] uppercase tracking-widest font-bold block mb-0.5">
                    {filteredItems[lightboxIndex].category}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-white">
                    {filteredItems[lightboxIndex].title}
                  </h4>
                </div>
                <span className="text-[10px] text-ivory/40 font-mono">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
