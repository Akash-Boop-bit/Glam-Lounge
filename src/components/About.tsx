"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap, { ScrollTrigger } from '@/lib/gsap';

interface AboutProps {
  aboutText: string;
  aboutImage: string;
  established: string;
  rating: string;
  reviewsCount: string;
  instagramFollowers: string;
}

export default function About({
  aboutText,
  aboutImage,
  established,
  rating,
  reviewsCount,
  instagramFollowers,
}: AboutProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const followersRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      // Fallback values for count-ups under prefers-reduced-motion
      if (ratingRef.current) ratingRef.current.innerText = rating;
      if (reviewsRef.current) reviewsRef.current.innerText = reviewsCount;
      if (followersRef.current) followersRef.current.innerText = instagramFollowers;
      
      const yearsExp = new Date().getFullYear() - (parseInt(established) || 2018);
      if (expRef.current) expRef.current.innerText = `${yearsExp}+ Yrs`;
      return;
    }

    const ctx = gsap.context(() => {
      // Draw the gold divider line left-to-right
      gsap.fromTo(
        dividerRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: dividerRef.current,
            start: 'top 85%',
          },
        }
      );

      // Fade-in copy section
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
          },
        }
      );

      // Fade-in image section
      gsap.fromTo(
        imgContainerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: imgContainerRef.current,
            start: 'top 80%',
          },
        }
      );

      // Numeric counter animation helper
      const animateCounter = (element: HTMLElement | null, endVal: number, suffix = '', decimals = 0) => {
        if (!element) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: endVal,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 95%',
          },
          onUpdate: () => {
            element.innerText = obj.val.toFixed(decimals) + suffix;
          },
        });
      };

      // Parse values safely
      const numRating = parseFloat(rating) || 5.0;
      const numReviews = parseInt(reviewsCount.replace(/\D/g, '')) || 120;
      const numFollowers = parseInt(instagramFollowers.replace(/\D/g, '')) || 10;
      const currentYear = new Date().getFullYear();
      const estYear = parseInt(established) || 2018;
      const yearsExp = Math.max(currentYear - estYear, 5);

      // Trigger count-ups
      animateCounter(ratingRef.current, numRating, '', 1);
      animateCounter(reviewsRef.current, numReviews, '+');
      animateCounter(followersRef.current, numFollowers, 'K+');
      animateCounter(expRef.current, yearsExp, '+ Yrs');
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [aboutText, established, rating, reviewsCount, instagramFollowers]);

  return (
    <section id="about" ref={sectionRef} className="py-24 bg-charcoal-light relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Luxury Gold/Cherry Border Top Divider */}
        <div ref={dividerRef} className="h-[1px] bg-gradient-to-r from-gold/50 via-cherry-500/25 to-transparent w-full mb-20" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Brand Narrative */}
          <div ref={textRef} className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 block">
              Luxury Unveiled
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
              Model Town's Premier Unisex Makeup & Hair Destination
            </h2>
            <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-light mb-10 max-w-2xl whitespace-pre-line">
              {aboutText}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-charcoal-lighter">
              <div>
                <div ref={ratingRef} className="text-2xl sm:text-3xl font-serif font-bold text-gold">
                  0.0
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-ivory/55 mt-1 font-semibold">
                  Google Rating
                </div>
              </div>
              <div>
                <div ref={reviewsRef} className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  0+
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-ivory/55 mt-1 font-semibold">
                  Google Reviews
                </div>
              </div>
              <div>
                <div ref={followersRef} className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  0+
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-ivory/55 mt-1 font-semibold">
                  Insta Followers
                </div>
              </div>
              <div>
                <div ref={expRef} className="text-2xl sm:text-3xl font-serif font-bold text-gold">
                  0+
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-ivory/55 mt-1 font-semibold">
                  Establishment
                </div>
              </div>
            </div>
          </div>

          {/* Salon Interior Image */}
          <div ref={imgContainerRef} className="lg:col-span-5 relative w-full aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-cherry-900/30 group">
            <Image
              src={aboutImage}
              alt="Glam Lounge Salon Interior"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-light via-transparent to-transparent opacity-65 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
