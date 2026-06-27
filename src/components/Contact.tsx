"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
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

interface ContactInfo {
  phone: string;
  whatsappNumber: string;
  address: string;
  hours: string;
  instagramUrl: string;
  mapEmbedUrl: string;
}

interface ContactProps {
  contact: ContactInfo;
}

export default function Contact({ contact }: ContactProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: leftRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (rightRef.current) {
        gsap.fromTo(
          rightRef.current,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: rightRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Format message string for WhatsApp redirect link
    const textMessage = `Hello Glam Lounge Salon! I'd like to book an appointment.%0A%0A*Name:* ${encodeURIComponent(
      name
    )}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Message:* ${encodeURIComponent(message || 'No extra message provided.')}`;

    const waUrl = `https://wa.me/${contact.whatsappNumber}?text=${textMessage}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="contact" className="py-24 bg-charcoal relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Details & Interactive Form (Left) */}
          <div  className="lg:col-span-6">
            <span className="text-cherry-300 text-[10px] tracking-[0.3em] font-semibold uppercase mb-4 block">
              Get in Touch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
              Book Your Experience
            </h2>
            <p className="text-xs sm:text-sm text-ivory/60 font-light leading-relaxed mb-10">
              Have a question or looking to schedule a bridal consultation? Fill in your details below to chat with our booking assistant directly on WhatsApp.
            </p>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-name" className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Your Name *
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-charcoal-light border border-cherry-900/30 rounded-xl px-4 py-3.5 text-sm text-ivory placeholder-ivory/30 focus:border-cherry-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="form-phone" className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Phone Number *
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="99999 99999"
                    className="w-full bg-charcoal-light border border-cherry-900/30 rounded-xl px-4 py-3.5 text-sm text-ivory placeholder-ivory/30 focus:border-cherry-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="form-msg" className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Inquiry Message (Optional)
                </label>
                <textarea
                  id="form-msg"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the service you'd like to book..."
                  className="w-full bg-charcoal-light border border-cherry-900/30 rounded-xl px-4 py-3.5 text-sm text-ivory placeholder-ivory/30 focus:border-cherry-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] py-4 rounded-xl border border-cherry-500/20 shadow-[0_0_15px_rgba(140,31,58,0.3)] hover:shadow-[0_0_20px_rgba(217,79,112,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>Submit Inquiry (WhatsApp)</span>
              </button>
            </form>

            {/* Quick Details Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-charcoal-lighter">
              <div className="flex items-start space-x-4">
                <MapPin size={18} className="text-cherry-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-white font-bold mb-1">Salon Address</h4>
                  <p className="text-xs text-ivory/60 font-light leading-relaxed">{contact.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock size={18} className="text-cherry-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-white font-bold mb-1">Operational Hours</h4>
                  <p className="text-xs text-ivory/60 font-light leading-relaxed">{contact.hours}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone size={18} className="text-cherry-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-white font-bold mb-1">Call Booking Hotline</h4>
                  <a href={`tel:${contact.phone}`} className="text-xs text-gold hover:text-white transition-colors font-medium">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <InstagramIcon size={18} className="text-cherry-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-white font-bold mb-1">Follow Instagram</h4>
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold hover:text-white transition-colors font-medium"
                  >
                    @makeup_by_gularora
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Embed Frame (Right) */}
          <div  className="lg:col-span-6 relative w-full h-[450px] rounded-3xl overflow-hidden border border-cherry-900/35 shadow-2xl">
            <iframe
              src={contact.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map location representation for Glam Lounge salon"
            />
            {/* Dark glass outline cover */}
            <div className="absolute inset-0 border-[8px] border-charcoal pointer-events-none rounded-3xl" />
          </div>

        </div>
      </div>
    </section>
  );
}
