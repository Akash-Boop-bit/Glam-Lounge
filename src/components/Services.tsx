"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import gsap, { ScrollTrigger } from '@/lib/gsap';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  services: ServiceItem[];
}

interface ServicesProps {
  categories: Category[];
  whatsappNumber: string;
}

export default function Services({ categories, whatsappNumber }: ServicesProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || 'makeup');
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
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

  // Trigger grid stagger animate when active tab shifts
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.service-card');
      if (isReduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        ScrollTrigger.refresh();
        return;
      }

      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => {
            ScrollTrigger.refresh(); // Recalculate ScrollTrigger points after height shifts
          }
        }
      );
    }
  }, [activeTab]);

  const activeCategory = categories.find((cat) => cat.id === activeTab);

  return (
    <section id="services" className="py-24 bg-charcoal-light relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-xl mx-auto mb-16">
          <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 block">
            Our Specialties
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Curated Salon Services
          </h2>
          <p className="text-xs sm:text-sm text-ivory/60 font-light leading-relaxed">
            Experience premium cosmetics and precision hair styling customized by international standards.
          </p>
        </div>

        {/* Category Tabs Switcher */}
        <div className="flex justify-center space-x-2 md:space-x-4 mb-12 border-b border-charcoal-lighter pb-4 overflow-x-auto max-w-full no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-5 py-3 text-[10px] sm:text-xs uppercase tracking-widest font-semibold rounded-full border transition-all duration-300 shrink-0 ${
                activeTab === category.id
                  ? 'bg-cherry-700 border-cherry-500 text-white shadow-[0_0_15px_rgba(140,31,58,0.4)]'
                  : 'bg-charcoal/50 border-cherry-900/30 text-ivory/60 hover:text-white hover:border-cherry-300/30'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Tab description text */}
        {activeCategory && (
          <p className="text-center text-xs text-cherry-300/80 tracking-wide font-light max-w-lg mx-auto mb-12 italic">
            {activeCategory.description}
          </p>
        )}

        {/* Services Grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]"
        >
          {activeCategory?.services.map((service) => (
            <div
              key={service.id}
              className="service-card flex flex-col justify-between bg-charcoal border border-cherry-900/20 hover:border-cherry-300/30 rounded-2xl overflow-hidden group hover:bg-charcoal-lighter/80 transition-all duration-500 shadow-md"
              style={{ opacity: 0 }} // Pre-set for GSAP stagger load
            >
              <div>
                {/* Image Frame */}
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-60" />
                </div>

                {/* Info Text */}
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-cherry-300 transition-colors duration-300">
                      {service.name}
                    </h3>
                    <span className="font-serif text-sm font-semibold text-gold shrink-0 bg-charcoal-light/60 px-3 py-1 rounded-md border border-cherry-900/40">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-xs text-ivory/65 leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Booking Trigger */}
              <div className="px-6 pb-6 pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20book%20the%20${encodeURIComponent(
                    service.name
                  )}%20service%20at%20Glam%20Lounge%20Luxury%20Salon.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-charcoal-light group-hover:bg-cherry-700/20 text-ivory/90 group-hover:text-ivory text-[10px] font-semibold uppercase tracking-[0.15em] py-3 rounded-xl border border-cherry-900/30 group-hover:border-cherry-300/35 transition-all duration-300"
                >
                  <MessageCircle size={12} className="text-cherry-500 group-hover:text-white" />
                  <span>Book this Service</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
