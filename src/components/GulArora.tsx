"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageCircle, Award } from 'lucide-react';
import gsap, { ScrollTrigger } from '@/lib/gsap';

const InstagramIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

interface FounderProps {
  founder: {
    name: string;
    title: string;
    photo: string;
    bio: string;
    whatsappNumber: string;
    instagram: string;
    instagramHandle: string;
    credentials: string[];
  };
  team: TeamMember[];
}

export default function GulArora({ founder, team }: FounderProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      if (imageRef.current) gsap.set(imageRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      return;
    }

    const ctx = gsap.context(() => {
      // Clip-path wipe wipe reveal for portrait image on scroll
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.6,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Fade-in list credentials on scroll
      if (listRef.current) {
        const items = listRef.current.querySelectorAll('li');
        gsap.fromTo(
          items,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: listRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      // Fade-in bio title
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Fade-in team section cards
      if (teamRef.current) {
        const cards = teamRef.current.querySelectorAll('.team-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: teamRef.current,
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
  }, [founder, team]);

  return (
    <section id="gul-arora" className="py-24 bg-charcoal relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Founder Portrait (Left Column) */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              ref={imageRef}
              className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border border-cherry-900/35 shadow-[0_0_30px_rgba(219,79,112,0.1)] group"
              style={{ clipPath: 'inset(100% 0% 0% 0%)' }} // Prevent flashes before GSAP mounts
            >
              <Image
                src={founder.photo}
                alt={`${founder.name} portrait`}
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-70" />
              
              {/* Instagram Handle Overlay */}
              <a
                href={founder.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-6 left-6 flex items-center space-x-2 bg-charcoal-light/85 backdrop-blur-md px-4 py-2 rounded-full border border-cherry-300/20 text-ivory hover:text-cherry-300 hover:border-cherry-300/50 transition-all duration-300"
              >
                <InstagramIcon size={14} className="text-cherry-500" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">
                  {founder.instagramHandle}
                </span>
              </a>
            </div>
          </div>

          {/* Founder Bio & Details (Right Column) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div ref={titleRef}>
              <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 block">
                Meet Our Founder
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                {founder.name}
              </h2>
              <p className="text-gold text-xs font-medium tracking-widest uppercase mb-6">
                {founder.title}
              </p>
              <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-light mb-8 whitespace-pre-line">
                {founder.bio}
              </p>
            </div>

            {/* Credentials / Certificates */}
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-cherry-100 mb-4 flex items-center">
              <Award size={14} className="text-gold mr-2" />
              Certifications & Credentials
            </h3>
            <ul ref={listRef} className="space-y-3 mb-10">
              {founder.credentials.map((cred, index) => (
                <li
                  key={index}
                  className="flex items-start text-xs sm:text-sm text-ivory/70 font-light"
                >
                  <span className="w-1.5 h-1.5 bg-cherry-500 rounded-full mt-2 mr-3 shrink-0" />
                  <span>{cred}</span>
                </li>
              ))}
            </ul>

            {/* Call to Action */}
            <div>
              <a
                href={`https://wa.me/${founder.whatsappNumber}?text=Hi%20Gul%2C%20I%27d%20like%20to%20book%20a%20consultation`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-charcoal-light hover:bg-charcoal-lighter text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] px-8 py-4 rounded-full border border-cherry-300/30 hover:border-cherry-300/60 shadow-[0_0_15px_rgba(246,160,192,0.05)] hover:shadow-[0_0_20px_rgba(246,160,192,0.15)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <MessageCircle size={14} className="text-cherry-500" />
                <span>Chat with Gul Arora</span>
              </a>
            </div>
          </div>
        </div>

        {/* Meet the Team sub-section
        {team && team.length > 0 && (
          <div ref={teamRef} className="mt-24 pt-16 border-t border-charcoal-lighter">
            <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 text-center block">
              Our Artisans
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white text-center mb-12">
              Meet the Team
            </h2>

            <div className="flex flex-wrap justify-center gap-8">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="team-card bg-charcoal-light/60 border border-cherry-900/30 rounded-2xl p-6 max-w-sm w-full flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-cherry-300/20 hover:bg-charcoal-light transition-all duration-500 shadow-lg"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-cherry-900/40">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-center sm:text-left justify-center">
                    <h4 className="font-serif text-lg font-bold text-white mb-0.5">
                      {member.name}
                    </h4>
                    <span className="text-cherry-300 text-[10px] tracking-wider uppercase font-semibold mb-3">
                      {member.role}
                    </span>
                    <p className="text-xs text-ivory/60 font-light leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </section>
  );
}
