import React from 'react';
import Link from 'next/link';
import { Tag, ImageIcon, MessageSquare, User, ExternalLink, HelpCircle } from 'lucide-react';
import { readContent } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const content = await readContent();

  // Compute metrics
  const servicesCount = content.categories.reduce(
    (acc: number, cat: any) => acc + (cat.services?.length || 0),
    0
  );
  const galleryCount = content.gallery?.length || 0;
  const reviewsCount = content.testimonials?.length || 0;
  const teamCount = content.team?.length || 0;

  const dashboardCards = [
    {
      title: 'Services Active',
      count: servicesCount,
      desc: 'Individual makeup, hair, and nail services',
      href: '/admin/services',
      icon: Tag,
      color: 'text-cherry-300 bg-cherry-900/10 border-cherry-900/30',
    },
    {
      title: 'Gallery Assets',
      count: galleryCount,
      desc: 'Portfolio transformation photos',
      href: '/admin/gallery',
      icon: ImageIcon,
      color: 'text-gold bg-gold/5 border-gold/10',
    },
    {
      title: 'Client Reviews',
      count: reviewsCount,
      desc: 'Testimonials displayed in the carousel',
      href: '/admin/homepage',
      icon: MessageSquare,
      color: 'text-white bg-charcoal border-charcoal-lighter',
    },
    {
      title: 'Artisans Team',
      count: teamCount,
      desc: 'Featured stylists and lead specialists',
      href: '/admin/gul-arora',
      icon: User,
      color: 'text-cherry-300 bg-cherry-900/10 border-cherry-900/30',
    },
  ];

  return (
    <div className="space-y-10">
      
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-charcoal-light border border-cherry-900/25 p-8 rounded-3xl">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome, Gul Arora
          </h1>
          <p className="text-xs text-ivory/60 font-light max-w-xl leading-relaxed">
            This is the administration panel for **Glam Lounge Luxury Salon**. You can update any text copy, change prices, upload portfolio photos, or edit service packages here.
          </p>
        </div>
        <div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-white text-[10px] font-semibold uppercase tracking-widest px-5 py-3 rounded-xl border border-cherry-500/25 shadow-lg transition-all"
          >
            <span>Preview Site</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-2xl border flex flex-col justify-between h-44 hover:-translate-y-1 transition-all duration-300 group ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
                  {card.title}
                </span>
                <Icon size={18} className="opacity-70 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-4xl font-serif font-bold text-white block mb-1">
                  {card.count}
                </span>
                <span className="text-[10px] text-ivory/50 leading-relaxed font-light block">
                  {card.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Instruction Card */}
      <div className="bg-charcoal-light border border-cherry-900/20 p-8 rounded-3xl">
        <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center">
          <HelpCircle size={16} className="text-cherry-500 mr-2" />
          Content Management Tips
        </h3>
        <ul className="space-y-3.5 text-xs text-ivory/70 font-light leading-relaxed">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-cherry-500 rounded-full mt-1.5 mr-3 shrink-0" />
            <span>
              <strong>Image Formats:</strong> Always upload high-resolution images in PNG, JPG, or WEBP. Upload size must be under 5MB.
            </span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-cherry-500 rounded-full mt-1.5 mr-3 shrink-0" />
            <span>
              <strong>Immediate Updates:</strong> When you hit <strong>Save</strong> inside any admin tab, the changes are written instantly, and cache revalidation refreshes the public site immediately.
            </span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-cherry-500 rounded-full mt-1.5 mr-3 shrink-0" />
            <span>
              <strong>Booking Prefills:</strong> Changing WhatsApp phone configurations will automatically update all click-to-book links, ensuring messages reach the correct booking assistant.
            </span>
          </li>
        </ul>
      </div>

    </div>
  );
}
