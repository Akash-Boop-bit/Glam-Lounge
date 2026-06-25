"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import gsap from '@/lib/gsap';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

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
  }, []);

  // Auto advance slide
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 6000); // 6 seconds auto-play rotation

    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-24 bg-charcoal-light relative overflow-hidden">
      {/* Decorative Blur Ambient Lights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-cherry-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-cherry-700/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-xl mx-auto mb-16">
          <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 block">
            Love From Clients
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Guest Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-ivory/60 font-light leading-relaxed">
            Read stories of experiences, bridal glow-ups, and specialized services shared by our guests.
          </p>
        </div>

        {/* Carousel Outer Frame */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative bg-charcoal border border-cherry-900/30 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center"
        >
          {/* Quote Icon */}
          <div className="text-cherry-900/40 mb-6">
            <Quote size={40} className="fill-current" />
          </div>

          {/* Testimonial Active Slide Content */}
          <div className="w-full min-h-[160px] flex flex-col items-center text-center justify-center">
            {/* Stars */}
            <div className="flex items-center space-x-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < testimonials[activeIndex].rating
                      ? 'text-gold fill-current'
                      : 'text-charcoal-lighter fill-current'
                  }
                />
              ))}
            </div>

            {/* Quote Copy */}
            <p className="font-sans text-sm sm:text-base text-ivory leading-relaxed font-light mb-8 max-w-2xl italic">
              "{testimonials[activeIndex].text}"
            </p>

            {/* Author */}
            <div>
              <h4 className="font-serif text-white font-bold tracking-wide">
                {testimonials[activeIndex].name}
              </h4>
              <span className="text-[10px] uppercase tracking-widest text-cherry-300 font-semibold mt-1 block">
                {testimonials[activeIndex].date}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-6 mt-10">
            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              className="text-ivory/50 hover:text-white p-2 border border-cherry-900/40 hover:border-cherry-300/40 rounded-full bg-charcoal-light transition-all duration-300"
              aria-label="Previous review"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Bullet Indicators */}
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-cherry-500 w-4'
                      : 'bg-charcoal-lighter hover:bg-cherry-900'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              className="text-ivory/50 hover:text-white p-2 border border-cherry-900/40 hover:border-cherry-300/40 rounded-full bg-charcoal-light transition-all duration-300"
              aria-label="Next review"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Call to review on Google */}
        <div className="text-center mt-12">
          <p className="text-[10px] uppercase tracking-widest text-ivory/40">
            Loving our work?{' '}
            <a
              href="https://google.com" // Placeholder for client GBP
              target="_blank"
              rel="noopener noreferrer"
              className="text-cherry-300 hover:text-cherry-100 underline underline-offset-4 transition-colors font-semibold"
            >
              Leave us a review on Google
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
