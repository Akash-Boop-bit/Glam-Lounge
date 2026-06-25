"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowDown, MessageCircle } from 'lucide-react';
import gsap from '@/lib/gsap';

interface HeroProps {
  heroImage: string;
  headline: string;
  punchline: string;
  whatsappNumber: string;
  rating: string;
  reviewsCount: string;
}

export default function Hero({
  heroImage,
  headline,
  punchline,
  whatsappNumber,
  rating,
  reviewsCount,
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReduced) {
      // Static display for reduced motion
      if (imageRef.current) gsap.set(imageRef.current, { opacity: 0.45 });
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 1 });
      if (subRef.current) gsap.set(subRef.current, { opacity: 1 });
      if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 1 });
      if (actionsRef.current) gsap.set(actionsRef.current, { opacity: 1 });
      return;
    }

    // Zoom out background image slowly
    gsap.fromTo(
      imageRef.current,
      { scale: 1.15, opacity: 0 },
      { scale: 1, opacity: 0.45, duration: 2.5, ease: 'power2.out' }
    );

    // Stagger text and button entrance animations
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Stagger words in headline
    if (titleRef.current) {
      const words = titleRef.current.innerText.split(' ');
      titleRef.current.innerHTML = words
        .map((word) => `<span class="inline-block opacity-0 translate-y-8">${word}</span>`)
        .join(' ');

      tl.to(
        titleRef.current.querySelectorAll('span'),
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.2,
        },
        '+=0.2'
      );
    }

    tl.fromTo(
      subRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 },
      '-=0.6'
    );

    tl.fromTo(
      badgeRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8 },
      '-=0.5'
    );

    tl.fromTo(
      actionsRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.6'
    );
  }, [headline]);

  const scrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const servicesSection = document.querySelector('#services');
    if (servicesSection) {
      const yOffset = -80;
      const y = servicesSection.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center items-center bg-charcoal overflow-hidden pt-20"
    >
      {/* Background image & gradient overlays */}
      <div className="absolute inset-0 z-0">
        <div ref={imageRef} className="relative w-full h-full opacity-45">
          <Image
            src={heroImage}
            alt="Glam Lounge Luxury Salon interior background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal-light/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-charcoal/20 to-charcoal/90" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center flex flex-col items-center select-none">
        {/* Trust Badges */}
        <div
          ref={badgeRef}
          className="inline-flex items-center space-x-2 bg-charcoal-lighter/80 border border-cherry-900/40 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm"
        >
          <span className="text-gold text-xs font-semibold">★ {rating}</span>
          <span className="text-cherry-300/30 text-xs">|</span>
          <span className="text-ivory/80 text-[10px] uppercase tracking-widest font-medium">
            {reviewsCount} Google Reviews
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={titleRef}
          className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ivory mb-6 leading-[1.1] text-gold-gradient"
        >
          {headline}
        </h1>

        {/* Punchline */}
        <p
          ref={subRef}
          className="text-base sm:text-lg lg:text-xl text-cherry-100 font-sans tracking-wide max-w-2xl mb-12 font-light"
        >
          {punchline}
        </p>

        {/* CTA Buttons */}
        <div
          ref={actionsRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20book%20an%20appointment%20at%20Glam%20Lounge%20Luxury%20Salon`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] px-8 py-4 rounded-full border border-cherry-500/20 shadow-[0_0_20px_rgba(140,31,58,0.4)] hover:shadow-[0_0_25px_rgba(217,79,112,0.6)] transition-all duration-300 w-full sm:w-auto transform hover:-translate-y-0.5"
          >
            <MessageCircle size={14} />
            <span>Book on WhatsApp</span>
          </a>
          
          <a
            href="#services"
            onClick={scrollToServices}
            className="flex items-center justify-center space-x-2 bg-charcoal-light/70 hover:bg-charcoal-lighter text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] px-8 py-4 rounded-full border border-cherry-900/50 hover:border-cherry-300/30 transition-all duration-300 w-full sm:w-auto"
          >
            <span>Explore Services</span>
            <ArrowDown size={12} className="animate-bounce" />
          </a>
        </div>
      </div>

      {/* Decorative Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
              const yOffset = -80;
              const y = aboutSection.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center text-ivory/40 hover:text-cherry-300 transition-colors text-[9px] uppercase tracking-[0.25em]"
        >
          <span className="mb-2">Scroll Down</span>
          <div className="w-[1px] h-10 bg-cherry-900/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-cherry-300" style={{ animation: 'scroll-line 2s infinite' }} />
          </div>
        </a>
      </div>
      
      <style jsx global>{`
        @keyframes scroll-line {
          0% { top: -50%; }
          100% { top: 100%; }
        }
      `}</style>
    </section>
  );
}
